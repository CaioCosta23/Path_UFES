"""
Testes dos endpoints POST /aluno/historico, POST /aluno/upload-pdf,
GET /aluno/{matricula}/disponiveis e GET /aluno/{matricula}/trilha.

Verifica o cadastro de histórico (JSON e PDF), a lógica de disciplinas
disponíveis e o algoritmo de trilha acadêmica (caminho crítico em calendário
com PAR/ÍMPAR).
"""
from unittest.mock import MagicMock, patch

from sqlalchemy import insert

from app.models import Disciplina, TipoDisciplina, Departamento, PeriodoOferta, DiaSemana, Horario
from app.models import prerequisitos as prereq_table
from app.models import Aula, AulaDia, AulaHorario

MATRICULA = "2023999999"

PAYLOAD_BASE = {
    "matricula":        MATRICULA,
    "nome":             "Aluno Teste",
    "curso":            "Ciência da Computação",
    "ano_ingresso":     2023,
    "periodo_ingresso": "2023/1",
    "cr":               8.0,
    "disciplinas":      [],
}


def _inserir_disciplina(db, codigo: str, nome: str, periodo: int = 1):
    """
    Insere uma disciplina obrigatória mínima no banco de teste.

    :param db: Sessão do banco de teste.
    :type db: Session
    :param codigo: Código da disciplina.
    :type codigo: str
    :param nome: Nome da disciplina.
    :type nome: str
    :param periodo: Período sugerido na grade curricular.
    :type periodo: int
    """
    db.execute(insert(Disciplina).values({
        "codigo":           codigo,
        "nome":             nome,
        "creditos":         4,
        "carga_horaria":    60,
        "tipo_disciplina":  TipoDisciplina.OBRIGATORIA,
        "departamento":     Departamento.DI,
        "periodo_sugerido": periodo,
    }))


def _inserir_aula(db, codigo_disciplina: str, dia: DiaSemana, horario: Horario) -> None:
    """
    Insere uma Aula com um dia e horário específicos no banco de teste.

    :param db: Sessão do banco de teste.
    :type db: Session
    :param codigo_disciplina: Código da disciplina dona da aula.
    :type codigo_disciplina: str
    :param dia: Dia da semana em que a aula ocorre.
    :type dia: DiaSemana
    :param horario: Faixa de horário da aula.
    :type horario: Horario
    """
    aula = Aula(codigo_disciplina=codigo_disciplina)
    db.add(aula)
    db.flush()
    db.add(AulaDia(aula_id=aula.id, dia_semana=dia))
    db.add(AulaHorario(aula_id=aula.id, horario=horario))


def _inserir_prereq(db, disciplina: str, prereq: str):
    """
    Insere uma relação de pré-requisito no banco de teste.

    :param db: Sessão do banco de teste.
    :type db: Session
    :param disciplina: Código da disciplina que exige o pré-requisito.
    :type disciplina: str
    :param prereq: Código da disciplina exigida como pré-requisito.
    :type prereq: str
    """
    db.execute(insert(prereq_table).values(
        codigo_disciplina=disciplina,
        codigo_prereq=prereq,
        bloco=1,
    ))


def _inserir_disciplina_com_oferta(
    db,
    codigo: str,
    nome: str,
    tipo: TipoDisciplina = TipoDisciplina.OBRIGATORIA,
    periodo_oferta: PeriodoOferta | None = None,
    periodo_sugerido: int = 1,
):
    """
    Insere disciplina com periodo_oferta definido para testes de trilha.

    :param db: Sessão do banco de teste.
    :type db: Session
    :param codigo: Código da disciplina.
    :type codigo: str
    :param nome: Nome da disciplina.
    :type nome: str
    :param tipo: Tipo da disciplina (OB ou OP).
    :type tipo: TipoDisciplina
    :param periodo_oferta: Restrição de semestre PAR/IMPAR/AMBOS (None = sem restrição).
    :type periodo_oferta: PeriodoOferta | None
    :param periodo_sugerido: Período sugerido na grade curricular.
    :type periodo_sugerido: int
    """
    values = {
        "codigo":           codigo,
        "nome":             nome,
        "creditos":         4,
        "carga_horaria":    60,
        "tipo_disciplina":  tipo,
        "departamento":     Departamento.DI,
        "periodo_sugerido": periodo_sugerido,
    }
    if periodo_oferta is not None:
        values["periodo_oferta"] = periodo_oferta
    db.execute(insert(Disciplina).values(values))


def _inserir_disciplina_com_min_horas(
    db,
    codigo: str,
    nome: str,
    min_horas: int,
    carga_horaria: int = 60,
):
    """
    Insere disciplina obrigatória com requisito de horas mínimas cursadas.

    :param db: Sessão do banco de teste.
    :type db: Session
    :param codigo: Código da disciplina.
    :type codigo: str
    :param nome: Nome da disciplina.
    :type nome: str
    :param min_horas: Mínimo de horas cursadas no currículo para poder cursar.
    :type min_horas: int
    :param carga_horaria: Carga horária da própria disciplina.
    :type carga_horaria: int
    """
    db.execute(insert(Disciplina).values({
        "codigo":           codigo,
        "nome":             nome,
        "creditos":         4,
        "carga_horaria":    carga_horaria,
        "tipo_disciplina":  TipoDisciplina.OBRIGATORIA,
        "departamento":     Departamento.DI,
        "periodo_sugerido": 9,
        "min_horas":        min_horas,
    }))


# ---------------------------------------------------------------------------
# Helpers para mock de PDF
# ---------------------------------------------------------------------------

_PDF_VALIDO = """
Matrícula: 2023999999
Nome civil: Aluno Teste
Curso: 51 - Ciência da Computação Versão: 2020
Ano/Semestre de ingresso: 2023/1
Coeficiente de Rendimento Acumulado: 8,00

2023/1
INF00001 Programacao I 4 60 8.50 AP
"""

_PDF_SEM_MATRICULA = """
Nome civil: Aluno Sem Matricula
Curso: 51 - Ciência da Computação Versão: 2020
Ano/Semestre de ingresso: 2023/1
"""


def _mock_pdf(texto: str):
    """
    Cria um mock de contexto ``pdfplumber.open`` com uma única página.

    :param texto: Texto que a página simulada deve retornar.
    :type texto: str
    :return: Mock configurado como context manager retornando o PDF simulado.
    :rtype: MagicMock
    """
    pagina = MagicMock()
    pagina.extract_text.return_value = texto
    pdf = MagicMock()
    pdf.pages = [pagina]
    pdf.__enter__ = MagicMock(return_value=pdf)
    pdf.__exit__ = MagicMock(return_value=False)
    return pdf


# ---------------------------------------------------------------------------
# POST /aluno/upload-pdf
# ---------------------------------------------------------------------------

def test_upload_pdf_valido(client, db_session):
    """PDF bem formado deve importar o aluno e retornar 201 com a contagem."""
    _inserir_disciplina(db_session, "INF00001", "Programacao I")
    db_session.commit()

    with patch("app.routers.alunos.pdfplumber.open", return_value=_mock_pdf(_PDF_VALIDO)):
        resp = client.post(
            "/aluno/upload-pdf",
            files={"file": ("historico.pdf", b"%PDF fake", "application/pdf")},
        )

    assert resp.status_code == 201
    data = resp.json()
    assert data["matricula"] == MATRICULA
    assert data["nome"] == "Aluno Teste"
    assert data["disciplinas_importadas"] == 1


def test_upload_pdf_sem_matricula(client, db_session):
    """PDF sem campo Matrícula deve retornar 422."""
    with patch("app.routers.alunos.pdfplumber.open", return_value=_mock_pdf(_PDF_SEM_MATRICULA)):
        resp = client.post(
            "/aluno/upload-pdf",
            files={"file": ("historico.pdf", b"%PDF fake", "application/pdf")},
        )

    assert resp.status_code == 422


def test_upload_pdf_arquivo_invalido(client, db_session):
    """Bytes que não são PDF devem retornar 400."""
    resp = client.post(
        "/aluno/upload-pdf",
        files={"file": ("nao_e_pdf.pdf", b"isso nao e um pdf", "application/pdf")},
    )
    assert resp.status_code == 400


# ---------------------------------------------------------------------------
# POST /aluno/historico
# ---------------------------------------------------------------------------

def test_salvar_historico_vazio(client, db_session):
    """Deve aceitar histórico sem disciplinas aprovadas."""
    resp = client.post("/aluno/historico", json=PAYLOAD_BASE)
    assert resp.status_code == 201
    assert resp.json()["matricula"] == MATRICULA
    assert resp.json()["disciplinas_salvas"] == 0


def test_salvar_historico_com_disciplinas(client, db_session):
    """Deve salvar as disciplinas aprovadas e retornar a quantidade."""
    _inserir_disciplina(db_session, "INF00001", "Prog I")
    _inserir_disciplina(db_session, "INF00002", "Prog II")
    db_session.commit()

    payload = {**PAYLOAD_BASE, "disciplinas": [
        {"codigo": "INF00001", "media": 8.5, "ano": 2023, "semestre": 1},
        {"codigo": "INF00002", "media": 7.0, "ano": 2023, "semestre": 2},
    ]}
    resp = client.post("/aluno/historico", json=payload)
    assert resp.status_code == 201
    assert resp.json()["disciplinas_salvas"] == 2


def test_salvar_historico_idempotente(client, db_session):
    """Enviar o mesmo histórico duas vezes não deve duplicar registros."""
    _inserir_disciplina(db_session, "INF00001", "Prog I")
    db_session.commit()

    payload = {**PAYLOAD_BASE, "disciplinas": [
        {"codigo": "INF00001", "media": 9.0, "ano": 2023, "semestre": 1},
    ]}
    client.post("/aluno/historico", json=payload)
    resp = client.post("/aluno/historico", json=payload)

    assert resp.status_code == 201
    assert resp.json()["disciplinas_salvas"] == 1


# ---------------------------------------------------------------------------
# GET /aluno/{matricula}/disponiveis
# ---------------------------------------------------------------------------

def test_disponiveis_aluno_inexistente(client):
    """Matrícula não cadastrada deve retornar 404."""
    resp = client.get("/aluno/0000000000/disponiveis")
    assert resp.status_code == 404


def test_disponiveis_sem_prereqs(client, db_session):
    """Disciplina sem pré-requisitos deve estar disponível desde o início."""
    _inserir_disciplina(db_session, "INF00001", "Prog I")
    db_session.commit()

    client.post("/aluno/historico", json=PAYLOAD_BASE)

    resp = client.get(f"/aluno/{MATRICULA}/disponiveis")
    assert resp.status_code == 200
    codigos = [d["codigo"] for d in resp.json()]
    assert "INF00001" in codigos


def test_disponiveis_prereq_nao_cumprido(client, db_session):
    """Disciplina cujo pré-requisito não foi feito não deve aparecer."""
    _inserir_disciplina(db_session, "INF00001", "Prog I",  periodo=1)
    _inserir_disciplina(db_session, "INF00002", "Prog II", periodo=2)
    _inserir_prereq(db_session, "INF00002", "INF00001")
    db_session.commit()

    # Aluno não fez nenhuma disciplina
    client.post("/aluno/historico", json=PAYLOAD_BASE)

    resp = client.get(f"/aluno/{MATRICULA}/disponiveis")
    codigos = [d["codigo"] for d in resp.json()]

    assert "INF00001" in codigos   # disponível: sem pré-req
    assert "INF00002" not in codigos  # bloqueada: falta Prog I


def test_disponiveis_prereq_cumprido(client, db_session):
    """Após cumprir o pré-requisito, a disciplina deve aparecer disponível."""
    _inserir_disciplina(db_session, "INF00001", "Prog I",  periodo=1)
    _inserir_disciplina(db_session, "INF00002", "Prog II", periodo=2)
    _inserir_prereq(db_session, "INF00002", "INF00001")
    db_session.commit()

    payload = {**PAYLOAD_BASE, "disciplinas": [
        {"codigo": "INF00001", "media": 8.0, "ano": 2023, "semestre": 1},
    ]}
    client.post("/aluno/historico", json=payload)

    resp = client.get(f"/aluno/{MATRICULA}/disponiveis")
    codigos = [d["codigo"] for d in resp.json()]

    assert "INF00001" not in codigos  # já aprovada, não aparece mais
    assert "INF00002" in codigos      # pré-req cumprido, agora disponível


# ---------------------------------------------------------------------------
# GET /aluno/{matricula}/trilha
# ---------------------------------------------------------------------------

def test_trilha_aluno_inexistente(client):
    """Matrícula não cadastrada deve retornar 404."""
    resp = client.get("/aluno/0000000000/trilha?semestre_inicio=2026/1")
    assert resp.status_code == 404


def test_trilha_respeita_periodo_oferta(client, db_session):
    """Disciplina ÍMPAR não deve aparecer em semestre PAR e vice-versa."""
    _inserir_disciplina_com_oferta(db_session, "INF00001", "Disc AMBOS",
                                   periodo_oferta=PeriodoOferta.AMBOS)
    _inserir_disciplina_com_oferta(db_session, "INF00002", "Disc IMPAR",
                                   periodo_oferta=PeriodoOferta.IMPAR)
    db_session.commit()

    client.post("/aluno/historico", json=PAYLOAD_BASE)

    # semestre_inicio=2026/2 é PAR: INF00002 (ÍMPAR) não pode entrar no 1º semestre
    resp = client.get(
        f"/aluno/{MATRICULA}/trilha?semestre_inicio=2026/2&max_disciplinas=1"
    )
    assert resp.status_code == 200
    semestres = resp.json()["semestres"]

    codigos_sem1 = [d["codigo"] for d in semestres[0]["disciplinas"]]
    assert "INF00001" in codigos_sem1
    assert "INF00002" not in codigos_sem1

    # No semestre seguinte (2027/1, ÍMPAR), INF00002 deve aparecer
    codigos_sem2 = [d["codigo"] for d in semestres[1]["disciplinas"]]
    assert "INF00002" in codigos_sem2


def test_trilha_prereq_desbloqueia_proximo_semestre(client, db_session):
    """
    Disciplina bloqueada por pré-requisito deve aparecer no semestre seguinte
    após o pré-requisito ser agendado na trilha.
    """
    _inserir_disciplina_com_oferta(db_session, "INF00001", "Base")
    _inserir_disciplina_com_oferta(db_session, "INF00002", "Avancada")
    _inserir_prereq(db_session, "INF00002", "INF00001")
    db_session.commit()

    client.post("/aluno/historico", json=PAYLOAD_BASE)

    # max_disciplinas=1: Base fica no sem 1, Avancada só pode no sem 2
    resp = client.get(
        f"/aluno/{MATRICULA}/trilha?semestre_inicio=2026/1&max_disciplinas=1"
    )
    assert resp.status_code == 200
    semestres = resp.json()["semestres"]

    assert semestres[0]["disciplinas"][0]["codigo"] == "INF00001"
    assert semestres[1]["disciplinas"][0]["codigo"] == "INF00002"


def test_trilha_gera_placeholder_optativa(client, db_session):
    """Slots restantes até max_disciplinas devem virar placeholders 'OptativaXX'."""
    _inserir_disciplina_com_oferta(db_session, "INF00001", "Unica Obrigatoria")
    db_session.commit()

    client.post("/aluno/historico", json=PAYLOAD_BASE)

    # max_disciplinas=2 com apenas 1 obrigatória → 1 slot vira placeholder
    resp = client.get(
        f"/aluno/{MATRICULA}/trilha?semestre_inicio=2026/1&max_disciplinas=2"
    )
    assert resp.status_code == 200
    disciplinas = resp.json()["semestres"][0]["disciplinas"]

    nomes = [d["nome"] for d in disciplinas]
    assert "Unica Obrigatoria" in nomes
    assert "Optativa01" in nomes
    assert len(disciplinas) == 2
    # placeholder não tem código
    placeholder = next(d for d in disciplinas if d["nome"] == "Optativa01")
    assert placeholder["codigo"] is None


# ---------------------------------------------------------------------------
# GET /aluno/{matricula}/trilha — filtro de horarios_bloqueados
# ---------------------------------------------------------------------------

def test_trilha_exclui_disciplina_com_conflito_de_horario(client, db_session):
    """
    Disciplina com aula na SEGUNDA H08_09 deve ser excluída quando esse slot
    está bloqueado. Disciplina em dia diferente deve permanecer na trilha.
    """
    _inserir_disciplina_com_oferta(db_session, "INF00001", "Disc Segunda")
    _inserir_disciplina_com_oferta(db_session, "INF00002", "Disc Quarta")
    db_session.commit()

    _inserir_aula(db_session, "INF00001", DiaSemana.SEGUNDA, Horario.H08_09)
    _inserir_aula(db_session, "INF00002", DiaSemana.QUARTA,  Horario.H08_09)
    db_session.commit()

    client.post("/aluno/historico", json=PAYLOAD_BASE)

    resp = client.get(
        f"/aluno/{MATRICULA}/trilha?semestre_inicio=2026/1"
        "&horarios_bloqueados=SEGUNDA:H08_09"
    )
    assert resp.status_code == 200
    todos_codigos = [
        d["codigo"]
        for sem in resp.json()["semestres"]
        for d in sem["disciplinas"]
    ]
    assert "INF00002" in todos_codigos      # quarta: sem conflito
    assert "INF00001" not in todos_codigos  # segunda H08_09: bloqueada


def test_trilha_sem_aulas_sempre_disponivel(client, db_session):
    """
    Disciplina sem aulas cadastradas deve aparecer na trilha mesmo com
    horários bloqueados.
    """
    _inserir_disciplina_com_oferta(db_session, "INF00001", "Sem Aulas")
    db_session.commit()

    client.post("/aluno/historico", json=PAYLOAD_BASE)

    # Bloqueia vários slots sem que INF00001 tenha aulas cadastradas
    resp = client.get(
        f"/aluno/{MATRICULA}/trilha?semestre_inicio=2026/1"
        "&horarios_bloqueados=SEGUNDA:H08_09&horarios_bloqueados=TERCA:H10_11"
        "&horarios_bloqueados=QUARTA:H14_15&horarios_bloqueados=QUINTA:H16_17"
        "&horarios_bloqueados=SEXTA:H07_08"
    )
    assert resp.status_code == 200
    todos_codigos = [
        d["codigo"]
        for sem in resp.json()["semestres"]
        for d in sem["disciplinas"]
    ]
    assert "INF00001" in todos_codigos  # sem aulas → nunca filtrada


def test_trilha_nao_exclui_horario_diferente_no_mesmo_dia(client, db_session):
    """
    Disciplina com aula na SEGUNDA H08_09 NÃO deve ser excluída quando
    apenas SEGUNDA:H10_11 está bloqueado (mesmo dia, horário diferente).
    """
    _inserir_disciplina_com_oferta(db_session, "INF00001", "Disc Segunda Manha")
    db_session.commit()

    _inserir_aula(db_session, "INF00001", DiaSemana.SEGUNDA, Horario.H08_09)
    db_session.commit()

    client.post("/aluno/historico", json=PAYLOAD_BASE)

    resp = client.get(
        f"/aluno/{MATRICULA}/trilha?semestre_inicio=2026/1"
        "&horarios_bloqueados=SEGUNDA:H10_11"
    )
    assert resp.status_code == 200
    todos_codigos = [
        d["codigo"]
        for sem in resp.json()["semestres"]
        for d in sem["disciplinas"]
    ]
    assert "INF00001" in todos_codigos  # H08_09 ≠ H10_11: sem conflito


def test_trilha_optativas_faltantes_descontadas_do_historico(client, db_session):
    """
    optativas_faltantes na resposta deve descontar as optativas já aprovadas;
    o total exigido é 9.
    """
    _inserir_disciplina_com_oferta(db_session, "INF00001", "Obrigatoria")
    for i in range(3):
        _inserir_disciplina_com_oferta(
            db_session, f"OPT0000{i}", f"Optativa Aprovada {i}",
            tipo=TipoDisciplina.OPTATIVA,
        )
    db_session.commit()

    payload = {**PAYLOAD_BASE, "disciplinas": [
        {"codigo": f"OPT0000{i}", "media": 8.0, "ano": 2023, "semestre": 1}
        for i in range(3)
    ]}
    client.post("/aluno/historico", json=payload)

    resp = client.get(f"/aluno/{MATRICULA}/trilha?semestre_inicio=2026/1")
    assert resp.status_code == 200
    data = resp.json()
    assert data["optativas_faltantes"] == 6  # 9 - 3 aprovadas = 6


def test_trilha_restricao_horario_por_semestre_especifico(client, db_session):
    """
    Restrição no formato SEMESTRE:DIA:HORARIO exclui a disciplina APENAS naquele
    semestre e a libera nos seguintes. Restrição em 2026/1 → disciplina migra para 2026/2.

    Com o fix do deadlock, quando não há obrigatórias disponíveis em 2026/1 mas
    ainda há optativas a agendar, o semestre 2026/1 é criado com placeholders
    de optativas. INF00001 deve aparecer em 2026/2 e nunca em 2026/1.
    """
    _inserir_disciplina_com_oferta(db_session, "INF00001", "Disc Segunda")
    db_session.commit()
    _inserir_aula(db_session, "INF00001", DiaSemana.SEGUNDA, Horario.H08_09)
    db_session.commit()

    client.post("/aluno/historico", json=PAYLOAD_BASE)

    resp = client.get(
        f"/aluno/{MATRICULA}/trilha?semestre_inicio=2026/1"
        "&horarios_bloqueados=2026/1:SEGUNDA:H08_09"  # só bloqueia em 2026/1
    )
    assert resp.status_code == 200
    semestres = resp.json()["semestres"]

    # INF00001 não pode estar em nenhum semestre 2026/1 (bloqueado por horário)
    codigos_2026_1 = [
        d["codigo"]
        for s in semestres if s["semestre"] == "2026/1"
        for d in s["disciplinas"]
    ]
    assert "INF00001" not in codigos_2026_1

    # INF00001 deve aparecer em 2026/2, quando a restrição não se aplica mais
    codigos_2026_2 = [
        d["codigo"]
        for s in semestres if s["semestre"] == "2026/2"
        for d in s["disciplinas"]
    ]
    assert "INF00001" in codigos_2026_2


def test_trilha_completa_9_optativas_apos_obrigatorias(client, db_session):
    """
    Após esgotar todas as obrigatórias, a trilha deve criar semestres extras
    com placeholders de optativas até atingir as 9 exigidas no total.
    """
    _inserir_disciplina_com_oferta(db_session, "INF00001", "Unica Obrigatoria")
    db_session.commit()
    client.post("/aluno/historico", json=PAYLOAD_BASE)

    resp = client.get(
        f"/aluno/{MATRICULA}/trilha?semestre_inicio=2026/1&max_disciplinas=1"
    )
    assert resp.status_code == 200
    data = resp.json()

    todos_nomes = [
        d["nome"]
        for sem in data["semestres"]
        for d in sem["disciplinas"]
    ]
    opt_count = sum(1 for n in todos_nomes if n.startswith("Optativa"))
    assert opt_count == 9


def test_trilha_sem_conflito_horario_entre_disciplinas(client, db_session):
    """
    Duas disciplinas com aula no mesmo dia e faixa de horário não devem
    aparecer no mesmo semestre da trilha — a segunda deve ser postergada.
    """
    _inserir_disciplina_com_oferta(db_session, "INF00001", "Disc A Segunda")
    _inserir_disciplina_com_oferta(db_session, "INF00002", "Disc B Segunda")
    db_session.commit()

    # Ambas têm aula na SEGUNDA H08_09 — conflito direto
    _inserir_aula(db_session, "INF00001", DiaSemana.SEGUNDA, Horario.H08_09)
    _inserir_aula(db_session, "INF00002", DiaSemana.SEGUNDA, Horario.H08_09)
    db_session.commit()

    client.post("/aluno/historico", json=PAYLOAD_BASE)

    # max_disciplinas=2: cabem duas por semestre, mas conflito impede coexistência
    resp = client.get(
        f"/aluno/{MATRICULA}/trilha?semestre_inicio=2026/1&max_disciplinas=2"
    )
    assert resp.status_code == 200
    semestres = resp.json()["semestres"]

    codigos_sem1 = {d["codigo"] for d in semestres[0]["disciplinas"] if d["codigo"]}
    codigos_sem2 = {d["codigo"] for d in semestres[1]["disciplinas"] if d["codigo"]}

    # As duas NÃO podem coexistir no mesmo semestre
    assert not ({"INF00001", "INF00002"} <= codigos_sem1)
    # Uma fica no 1º semestre e a outra no 2º
    assert len(codigos_sem1 & {"INF00001", "INF00002"}) == 1
    assert len(codigos_sem2 & {"INF00001", "INF00002"}) == 1


def test_trilha_historico_vazio_calouro(client, db_session):
    """
    Aluno sem nenhuma disciplina aprovada (recém-ingressante) deve receber
    na trilha todas as disciplinas sem pré-requisito no 1º semestre,
    disciplinas com pré-req apenas a partir do 2º, e optativas_faltantes == 9.
    """
    _inserir_disciplina_com_oferta(db_session, "INF00001", "Prog I",        periodo_sugerido=1)
    _inserir_disciplina_com_oferta(db_session, "INF00002", "Calculo I",     periodo_sugerido=1)
    _inserir_disciplina_com_oferta(db_session, "INF00003", "Prog Avancada", periodo_sugerido=2)
    _inserir_prereq(db_session, "INF00003", "INF00001")
    db_session.commit()

    # Histórico vazio: PAYLOAD_BASE tem disciplinas=[]
    client.post("/aluno/historico", json=PAYLOAD_BASE)

    resp = client.get(
        f"/aluno/{MATRICULA}/trilha?semestre_inicio=2026/1&max_disciplinas=5"
    )
    assert resp.status_code == 200
    data = resp.json()

    # Nenhuma optativa aprovada → ainda faltam todas as 9
    assert data["optativas_faltantes"] == 9

    semestres = data["semestres"]
    codigos_sem1 = {d["codigo"] for d in semestres[0]["disciplinas"] if d["codigo"]}

    # Disciplinas sem pré-requisito devem estar no 1º semestre
    assert "INF00001" in codigos_sem1
    assert "INF00002" in codigos_sem1
    # Disciplina com pré-requisito não cumprido não pode estar no 1º semestre
    assert "INF00003" not in codigos_sem1

    # INF00003 aparece no 2º semestre, quando INF00001 já foi agendada
    codigos_sem2 = {d["codigo"] for d in semestres[1]["disciplinas"] if d["codigo"]}
    assert "INF00003" in codigos_sem2


def test_trilha_respeita_min_horas(client, db_session):
    """
    Disciplina com min_horas=120 não deve aparecer na trilha enquanto o
    aluno não tiver acumulado ao menos 120 horas cursadas (aprovadas + agendadas).
    Duas disciplinas de 60h cada devem ser agendadas antes dela.
    """
    # Duas disciplinas sem requisitos, 60h cada
    _inserir_disciplina_com_oferta(db_session, "INF00001", "Base A")
    _inserir_disciplina_com_oferta(db_session, "INF00002", "Base B")
    # TCC: exige 120h cursadas (soma das duas anteriores)
    _inserir_disciplina_com_min_horas(db_session, "INF00099", "TCC I", min_horas=120)
    db_session.commit()

    # Histórico vazio — nenhuma hora acumulada ainda
    client.post("/aluno/historico", json=PAYLOAD_BASE)

    resp = client.get(
        f"/aluno/{MATRICULA}/trilha?semestre_inicio=2026/1&max_disciplinas=1"
    )
    assert resp.status_code == 200
    semestres = resp.json()["semestres"]

    # Com max_disciplinas=1, sem 1 = Base A (60h), sem 2 = Base B (60h acumuladas = 120h)
    codigos_por_semestre = [
        {d["codigo"] for d in s["disciplinas"] if d["codigo"]}
        for s in semestres
    ]

    # TCC não pode estar no 1º semestre (0h acumuladas < 120h)
    assert "INF00099" not in codigos_por_semestre[0]
    # TCC não pode estar no 2º semestre (60h acumuladas < 120h)
    assert "INF00099" not in codigos_por_semestre[1]
    # TCC deve aparecer no 3º semestre (120h acumuladas >= 120h)
    assert "INF00099" in codigos_por_semestre[2]

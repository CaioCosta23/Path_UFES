"""
Testes dos endpoints POST /aluno/historico, GET /aluno/{matricula}/disponiveis
e GET /aluno/{matricula}/trilha.

Verifica o cadastro de histórico, a lógica de disciplinas disponíveis e o
algoritmo de trilha acadêmica (caminho crítico em calendário com PAR/ÍMPAR).
"""
from sqlalchemy import insert

from app.models import Disciplina, TipoDisciplina, Departamento, PeriodoOferta
from app.models import prerequisitos as prereq_table

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
    """Insere uma disciplina mínima no banco de teste."""
    db.execute(insert(Disciplina).values({
        "codigo":           codigo,
        "nome":             nome,
        "creditos":         4,
        "carga_horaria":    60,
        "tipo_disciplina":  TipoDisciplina.OBRIGATORIA,
        "departamento":     Departamento.DI,
        "periodo_sugerido": periodo,
    }))


def _inserir_prereq(db, disciplina: str, prereq: str):
    """Insere uma relação de pré-requisito no banco de teste."""
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
    :param codigo: Código da disciplina.
    :param nome: Nome da disciplina.
    :param tipo: Tipo da disciplina (OB ou OP).
    :param periodo_oferta: Restrição de semestre PAR/IMPAR/AMBOS (None = sem restrição).
    :param periodo_sugerido: Período sugerido na grade curricular.
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

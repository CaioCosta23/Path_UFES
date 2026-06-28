"""
Testes dos endpoints POST /aluno/historico e GET /aluno/{matricula}/disponiveis.

Verifica o cadastro de histórico e a lógica de sugestão de disciplinas
baseada nos pré-requisitos já cumpridos pelo aluno.
"""
from sqlalchemy import insert

from app.models import Disciplina, TipoDisciplina, Departamento
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

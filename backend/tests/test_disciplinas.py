"""
Testes do endpoint GET /grafo.

Verifica a resposta sem matrícula (status nulo) e com matrícula
(status cumprida / disponivel / bloqueada por pré-requisito).
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


def _inserir_disciplina(db, codigo: str, nome: str):
    """
    Insere uma disciplina obrigatória mínima no banco de teste.

    :param db: Sessão do banco de teste.
    :param codigo: Código da disciplina.
    :type codigo: str
    :param nome: Nome da disciplina.
    :type nome: str
    """
    db.execute(insert(Disciplina).values({
        "codigo":           codigo,
        "nome":             nome,
        "creditos":         4,
        "carga_horaria":    60,
        "tipo_disciplina":  TipoDisciplina.OBRIGATORIA,
        "departamento":     Departamento.DI,
        "periodo_sugerido": 1,
    }))


def _inserir_prereq(db, disciplina: str, prereq: str):
    """
    Insere uma relação de pré-requisito no banco de teste.

    :param db: Sessão do banco de teste.
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


# ---------------------------------------------------------------------------
# GET /grafo
# ---------------------------------------------------------------------------

def test_grafo_sem_matricula_sem_status(client, db_session):
    """Sem matricula todos os nós devem ter status null."""
    _inserir_disciplina(db_session, "INF00001", "Prog I")
    db_session.commit()

    resp = client.get("/grafo")
    assert resp.status_code == 200
    nos = resp.json()["nos"]
    assert all(n["status"] is None for n in nos)


def test_grafo_status_cumprida(client, db_session):
    """Disciplina aprovada no histórico deve ter status 'cumprida'."""
    _inserir_disciplina(db_session, "INF00001", "Prog I")
    db_session.commit()

    client.post("/aluno/historico", json={**PAYLOAD_BASE, "disciplinas": [
        {"codigo": "INF00001", "media": 9.0, "ano": 2023, "semestre": 1},
    ]})

    resp = client.get(f"/grafo?matricula={MATRICULA}")
    assert resp.status_code == 200
    nos = resp.json()["nos"]
    no = next(n for n in nos if n["id"] == "INF00001")
    assert no["status"] == "cumprida"


def test_grafo_status_disponivel(client, db_session):
    """Disciplina sem pré-requisito e não aprovada deve ter status 'disponivel'."""
    _inserir_disciplina(db_session, "INF00001", "Prog I")
    db_session.commit()

    client.post("/aluno/historico", json=PAYLOAD_BASE)

    resp = client.get(f"/grafo?matricula={MATRICULA}")
    assert resp.status_code == 200
    nos = resp.json()["nos"]
    no = next(n for n in nos if n["id"] == "INF00001")
    assert no["status"] == "disponivel"


def test_grafo_status_bloqueada(client, db_session):
    """Disciplina com pré-requisito não cumprido deve ter status 'bloqueada'."""
    _inserir_disciplina(db_session, "INF00001", "Prog I")
    _inserir_disciplina(db_session, "INF00002", "Prog II")
    _inserir_prereq(db_session, "INF00002", "INF00001")
    db_session.commit()

    client.post("/aluno/historico", json=PAYLOAD_BASE)

    resp = client.get(f"/grafo?matricula={MATRICULA}")
    assert resp.status_code == 200
    nos = resp.json()["nos"]
    no = next(n for n in nos if n["id"] == "INF00002")
    assert no["status"] == "bloqueada"

"""
Testes do endpoint GET /grafo.

Verifica que o grafo de disciplinas e pré-requisitos é retornado
corretamente em diferentes estados do banco.
"""
from sqlalchemy import insert

from app.models import Disciplina, TipoDisciplina, Departamento
from app.models import prerequisitos as prereq_table


def _disciplina(codigo: str, nome: str, periodo: int = 1) -> dict:
    """Cria um dict com os campos mínimos para inserir uma Disciplina."""
    return {
        "codigo":          codigo,
        "nome":            nome,
        "creditos":        4,
        "carga_horaria":   60,
        "tipo_disciplina": TipoDisciplina.OBRIGATORIA,
        "departamento":    Departamento.DI,
        "periodo_sugerido": periodo,
    }


def test_grafo_vazio(client):
    """Banco sem disciplinas deve retornar listas vazias."""
    resp = client.get("/grafo")
    assert resp.status_code == 200
    assert resp.json() == {"nos": [], "arestas": []}


def test_grafo_com_disciplina_sem_prereq(client, db_session):
    """Uma disciplina sem pré-requisitos gera um nó e zero arestas."""
    db_session.execute(insert(Disciplina).values(_disciplina("INF00001", "Teste A")))
    db_session.commit()

    resp = client.get("/grafo")
    data = resp.json()

    assert resp.status_code == 200
    assert len(data["nos"]) == 1
    assert len(data["arestas"]) == 0
    assert data["nos"][0]["id"] == "INF00001"
    assert data["nos"][0]["nome"] == "Teste A"


def test_grafo_com_prereq(client, db_session):
    """Pré-requisito entre duas disciplinas deve gerar uma aresta."""
    db_session.execute(insert(Disciplina).values(_disciplina("INF00001", "Prog I", periodo=1)))
    db_session.execute(insert(Disciplina).values(_disciplina("INF00002", "Prog II", periodo=2)))
    db_session.execute(
        insert(prereq_table).values(
            codigo_disciplina="INF00002",
            codigo_prereq="INF00001",
            bloco=1,
        )
    )
    db_session.commit()

    resp = client.get("/grafo")
    data = resp.json()

    assert len(data["nos"]) == 2
    assert len(data["arestas"]) == 1
    aresta = data["arestas"][0]
    assert aresta["source"] == "INF00002"
    assert aresta["target"] == "INF00001"
    assert aresta["bloco"] == 1

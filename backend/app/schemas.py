"""
Schemas Pydantic do PathUFES.

Define os contratos de entrada e saída de cada endpoint da API.
FastAPI usa esses modelos para validar requests e serializar responses.
"""
from pydantic import BaseModel


# ---------------------------------------------------------------------------
# GET /grafo
# ---------------------------------------------------------------------------

class NoDisciplina(BaseModel):
    """Nó do grafo: representa uma disciplina."""
    id:               str
    nome:             str
    creditos:         int
    carga_horaria:    int
    tipo_disciplina:  str
    departamento:     str
    periodo_sugerido: int | None


class ArestaPrereq(BaseModel):
    """Aresta do grafo: representa um pré-requisito entre duas disciplinas."""
    source: str   # codigo da disciplina que exige
    target: str   # codigo da disciplina exigida
    bloco:  int


class GrafoResponse(BaseModel):
    """
    Resposta do endpoint GET /grafo.

    Formato compatível com Cytoscape.js para renderização no frontend.
    """
    nos:    list[NoDisciplina]
    arestas: list[ArestaPrereq]


# ---------------------------------------------------------------------------
# POST /aluno/historico
# ---------------------------------------------------------------------------

class DisciplinaAprovada(BaseModel):
    """Disciplina aprovada no histórico do aluno."""
    codigo:   str
    media:    float | None = None
    ano:      int
    semestre: int


class HistoricoInput(BaseModel):
    """
    Corpo da requisição POST /aluno/historico.

    Recebe os dados cadastrais do aluno e suas disciplinas aprovadas,
    normalmente obtidos via parse_historico.py.
    """
    matricula:          str
    nome:               str
    curso:              str
    ano_ingresso:       int
    semestre_ingresso:  int
    cr:                 float | None = None
    disciplinas:        list[DisciplinaAprovada]


class HistoricoResponse(BaseModel):
    """Resposta após salvar o histórico do aluno."""
    matricula:           str
    disciplinas_salvas:  int


# ---------------------------------------------------------------------------
# GET /aluno/{matricula}/disponiveis
# ---------------------------------------------------------------------------

class DisciplinaDisponivel(BaseModel):
    """
    Disciplina que o aluno pode cursar no próximo semestre.

    Uma disciplina é considerada disponível quando todos os seus
    pré-requisitos já foram aprovados no histórico do aluno.
    """
    codigo:           str
    nome:             str
    creditos:         int
    tipo_disciplina:  str
    periodo_sugerido: int | None

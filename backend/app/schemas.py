"""
Schemas Pydantic do PathUFES.

Define os contratos de entrada e saída de cada endpoint da API.
FastAPI usa esses modelos para validar requests e serializar responses.

Schemas por endpoint:
- ``GET /grafo``                       → NoDisciplina, ArestaPrereq, GrafoResponse
- ``POST /aluno/historico``            → DisciplinaAprovada, HistoricoInput, HistoricoResponse
- ``POST /aluno/upload-pdf``           → UploadPdfResponse
- ``GET /aluno/{matricula}/disponiveis`` → DisciplinaDisponivel
- ``GET /aluno/{matricula}/trilha``    → DisciplinaTrilha, OptativaPrevista,
                                          SemestreTrilha, TrilhaResponse
"""
from pydantic import BaseModel


# ---------------------------------------------------------------------------
# GET /grafo
# ---------------------------------------------------------------------------

class NoDisciplina(BaseModel):
    """
    Nó do grafo: representa uma disciplina.

    O campo ``status`` é preenchido apenas quando ``GET /grafo`` recebe
    ``?matricula=``: ``"cumprida"``, ``"disponivel"`` ou ``"bloqueada"``.
    """
    id:               str
    nome:             str
    creditos:         int
    carga_horaria:    int
    tipo_disciplina:  str
    departamento:     str
    periodo_sugerido: int | None
    status:           str | None = None


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
    """
    Disciplina aprovada no histórico do aluno.

    ``nome`` e ``carga_horaria`` são opcionais e preenchidos apenas quando
    a origem é o PDF do SIE. Se o ``codigo`` não existir no banco de dados,
    ``salvar_historico`` tenta localizar a disciplina pelo par
    ``(nome_normalizado, carga_horaria)`` para tratar disciplinas
    renomeadas ou recodificadas entre versões curriculares.
    """
    codigo:        str
    media:         float | None = None
    ano:           int
    semestre:      int
    nome:          str | None = None
    carga_horaria: int | None = None


class HistoricoInput(BaseModel):
    """
    Corpo da requisição POST /aluno/historico.

    Recebe os dados cadastrais do aluno e suas disciplinas aprovadas,
    normalmente obtidos via parse_historico.py.
    """
    matricula:        str
    nome:             str
    curso:            str
    ano_ingresso:     int
    periodo_ingresso: str
    cr:               float | None = None
    disciplinas:      list[DisciplinaAprovada]


class HistoricoResponse(BaseModel):
    """Resposta após salvar o histórico do aluno."""
    matricula:           str
    disciplinas_salvas:  int


# ---------------------------------------------------------------------------
# POST /aluno/upload-pdf
# ---------------------------------------------------------------------------

class UploadPdfResponse(BaseModel):
    """Resposta após importar o histórico acadêmico a partir de um PDF do SIE."""
    matricula:              str
    nome:                   str
    disciplinas_importadas: int


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


# ---------------------------------------------------------------------------
# GET /aluno/{matricula}/trilha
# ---------------------------------------------------------------------------

class AulaInfo(BaseModel):
    """
    Horário de um bloco de aula de uma disciplina.

    ``dias`` lista os valores do enum DiaSemana (ex.: ["SEGUNDA", "QUARTA"]).
    ``horarios`` lista os valores do enum Horario (ex.: ["H08_09", "H09_10"]).
    """
    dias:     list[str]
    horarios: list[str]


class DisciplinaTrilha(BaseModel):
    """
    Entrada de uma disciplina (ou placeholder de optativa) na trilha.

    Obrigatórias possuem ``codigo`` e ``nome`` reais. Placeholders de
    optativas têm ``codigo=None`` e ``nome`` no formato "OptativaXX".
    ``aulas`` é preenchido somente quando há horários cadastrados no banco.
    """
    codigo:          str | None
    nome:            str
    creditos:        int | None
    tipo_disciplina: str
    aulas:           list[AulaInfo] = []


class OptativaPrevista(BaseModel):
    """
    Optativa com chance de ser ofertada em um semestre da trilha.

    Listada separadamente abaixo das disciplinas do semestre para que o
    aluno possa escolher qual optativa cursar no lugar do placeholder.
    """
    codigo:   str
    nome:     str
    creditos: int


class SemestreTrilha(BaseModel):
    """
    Representa um semestre completo na trilha acadêmica sugerida.

    ``disciplinas`` contém obrigatórias nomeadas e placeholders de optativas.
    ``optativas_previstas`` lista as optativas que provavelmente serão
    ofertadas nesse semestre e cujos pré-requisitos já foram cumpridos.
    """
    semestre:            str
    tipo:                str
    disciplinas:         list[DisciplinaTrilha]
    optativas_previstas: list[OptativaPrevista]


class TrilhaResponse(BaseModel):
    """
    Resposta do endpoint GET /aluno/{matricula}/trilha.

    Contém a sequência de semestres com as disciplinas sugeridas para
    o aluno concluir o curso.
    ``optativas_faltantes`` indica quantas optativas o aluno ainda precisa
    cursar para atingir as 9 exigidas pelo currículo de CC/UFES.
    """
    matricula:           str
    semestres:           list[SemestreTrilha]
    optativas_faltantes: int

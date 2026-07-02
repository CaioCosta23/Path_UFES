"""
Modelos SQLAlchemy do PathUFES.

Cada classe mapeia uma tabela no banco de dados PostgreSQL e corresponde
a uma entidade do diagrama de classes do projeto.
"""
from sqlalchemy import (
    Column, String, Integer, Float, ForeignKey, Table, Enum
)
from sqlalchemy.orm import relationship
import enum

from app.database import Base


# ---------------------------------------------------------------------------
# Enumerações (espelham os enums do diagrama de classes)
# ---------------------------------------------------------------------------

class TipoDisciplina(str, enum.Enum):
    """Classificação da disciplina na grade curricular."""
    OBRIGATORIA = "OB"
    OPTATIVA    = "OP"


class Departamento(str, enum.Enum):
    """Departamento responsável pela disciplina."""
    DI   = "DI"
    DMAT = "DMAT"
    DEE  = "DEE"
    OUTRO = "OUTRO"


class PeriodoOferta(str, enum.Enum):
    """Semestre em que a disciplina é normalmente ofertada."""
    PAR   = "PAR"
    IMPAR = "IMPAR"
    AMBOS = "AMBOS"


class DiaSemana(str, enum.Enum):
    """Dia da semana em que uma aula ocorre."""
    SEGUNDA = "SEGUNDA"
    TERCA   = "TERCA"
    QUARTA  = "QUARTA"
    QUINTA  = "QUINTA"
    SEXTA   = "SEXTA"


class Horario(str, enum.Enum):
    """Faixa de horário em que uma aula ocorre."""
    H07_08 = "H07_08"
    H08_09 = "H08_09"
    H09_10 = "H09_10"
    H10_11 = "H10_11"
    H11_12 = "H11_12"
    H12_13 = "H12_13"
    H13_14 = "H13_14"
    H14_15 = "H14_15"
    H15_16 = "H15_16"
    H16_17 = "H16_17"
    H17_18 = "H17_18"
    H18_19 = "H18_19"


# ---------------------------------------------------------------------------
# Tabela associativa: pré-requisitos (auto-referência de Disciplina)
# Cada linha representa uma aresta do grafo: disciplina → pré-requisito
# ---------------------------------------------------------------------------

prerequisitos = Table(
    "prerequisitos",
    Base.metadata,
    Column(
        "codigo_disciplina",
        String,
        ForeignKey("disciplinas.codigo"),
        primary_key=True,
    ),
    Column(
        "codigo_prereq",
        String,
        ForeignKey("disciplinas.codigo"),
        primary_key=True,
    ),
    Column("bloco", Integer, nullable=False, default=1),
)


# ---------------------------------------------------------------------------
# Tabela associativa: disciplinas aprovadas no histórico
# ---------------------------------------------------------------------------

historico_disciplinas = Table(
    "historico_disciplinas",
    Base.metadata,
    Column(
        "historico_id",
        Integer,
        ForeignKey("historicos.id"),
        primary_key=True,
    ),
    Column(
        "codigo_disciplina",
        String,
        ForeignKey("disciplinas.codigo"),
        primary_key=True,
    ),
    Column("media", Float, nullable=True),
    Column("ano", Integer, nullable=False),
    Column("semestre", Integer, nullable=False),
)


# ---------------------------------------------------------------------------
# Disciplina
# ---------------------------------------------------------------------------

class Disciplina(Base):
    """
    Representa uma disciplina da grade curricular.

    A relação ``pre_requisitos`` é uma auto-referência muitos-para-muitos
    que forma o grafo de pré-requisitos do curso.
    """

    __tablename__ = "disciplinas"

    codigo           = Column(String, primary_key=True)
    nome             = Column(String, nullable=False)
    creditos         = Column(Integer, nullable=False)
    carga_horaria    = Column(Integer, nullable=False)
    tipo_disciplina  = Column(Enum(TipoDisciplina), nullable=False)
    departamento     = Column(Enum(Departamento), nullable=False)
    periodo_sugerido = Column(Integer, nullable=True)   # semestre sugerido (1–10)
    periodo_oferta   = Column(Enum(PeriodoOferta), nullable=True)  # PAR/IMPAR/AMBOS

    pre_requisitos = relationship(
        "Disciplina",
        secondary=prerequisitos,
        primaryjoin=lambda: Disciplina.codigo == prerequisitos.c.codigo_disciplina,
        secondaryjoin=lambda: Disciplina.codigo == prerequisitos.c.codigo_prereq,
        backref="requerida_por",
    )

    aulas = relationship("Aula", back_populates="disciplina", cascade="all, delete-orphan")


# ---------------------------------------------------------------------------
# Aula — horários de uma disciplina (DiaSemana × Horario)
# ---------------------------------------------------------------------------

class Aula(Base):
    """
    Representa um bloco de aula de uma disciplina.

    Cada Aula ocorre em um conjunto de dias da semana e faixas de horário.
    Um aluno que bloquear um dia pode ter disciplinas filtradas da trilha.
    """

    __tablename__ = "aulas"

    id                = Column(Integer, primary_key=True, autoincrement=True)
    codigo_disciplina = Column(String, ForeignKey("disciplinas.codigo"), nullable=False)
    tipo_semestre     = Column(String(6), nullable=True)

    disciplina = relationship("Disciplina", back_populates="aulas")
    dias       = relationship("AulaDia",     cascade="all, delete-orphan")
    horarios   = relationship("AulaHorario", cascade="all, delete-orphan")


class AulaDia(Base):
    """Associa uma Aula a um DiaSemana (ex.: SEGUNDA)."""

    __tablename__ = "aula_dias"

    aula_id    = Column(Integer, ForeignKey("aulas.id"), primary_key=True)
    dia_semana = Column(Enum(DiaSemana), primary_key=True)


class AulaHorario(Base):
    """Associa uma Aula a uma faixa de Horario (ex.: H08_09)."""

    __tablename__ = "aula_horarios"

    aula_id = Column(Integer, ForeignKey("aulas.id"), primary_key=True)
    horario = Column(Enum(Horario), primary_key=True)


# ---------------------------------------------------------------------------
# Currículo
# ---------------------------------------------------------------------------

class Curriculo(Base):
    """
    Versão do currículo do curso (ex: versão 2022 de CC da UFES).

    Agrupa todas as disciplinas obrigatórias e optativas de uma grade.
    """

    __tablename__ = "curriculos"

    id           = Column(Integer, primary_key=True, autoincrement=True)
    curso        = Column(String, nullable=False)
    ano_vigencia = Column(Integer, nullable=False)

    disciplinas = relationship("Disciplina", secondary="curriculo_disciplinas")


curriculo_disciplinas = Table(
    "curriculo_disciplinas",
    Base.metadata,
    Column("curriculo_id", Integer, ForeignKey("curriculos.id"), primary_key=True),
    Column("codigo_disciplina", String, ForeignKey("disciplinas.codigo"), primary_key=True),
)


# ---------------------------------------------------------------------------
# Aluno
# ---------------------------------------------------------------------------

class Aluno(Base):
    """
    Representa um estudante cadastrado no sistema.

    Cada aluno possui exatamente um histórico acadêmico.
    """

    __tablename__ = "alunos"

    matricula           = Column(String, primary_key=True)
    nome                = Column(String, nullable=False)
    curso               = Column(String, nullable=False)
    ano_ingresso        = Column(Integer, nullable=False)
    periodo_ingresso    = Column(String, nullable=False)
    quantidade_creditos = Column(Integer, default=0)

    historico = relationship("Historico", back_populates="aluno", uselist=False)


# ---------------------------------------------------------------------------
# Histórico
# ---------------------------------------------------------------------------

class Historico(Base):
    """
    Histórico acadêmico do aluno: disciplinas aprovadas, CR e créditos totais.

    A relação ``disciplinas_aprovadas`` representa o conjunto de nós já
    visitados no grafo de pré-requisitos.
    """

    __tablename__ = "historicos"

    id              = Column(Integer, primary_key=True, autoincrement=True)
    matricula       = Column(String, ForeignKey("alunos.matricula"), nullable=False)
    cr              = Column(Float, nullable=True)
    creditos_totais = Column(Integer, default=0)

    aluno = relationship("Aluno", back_populates="historico")

    disciplinas_aprovadas = relationship(
        "Disciplina",
        secondary=historico_disciplinas,
    )

"""
Script de seed do banco de dados PathUFES.

Lê os CSVs do currículo de CC e os insere no banco PostgreSQL via SQLAlchemy.
Seguro para rodar múltiplas vezes: disciplinas e pré-requisitos já existentes
são ignorados; periodo_oferta é sempre atualizado com o valor do CSV.

Uso: python scripts/seed_db.py
"""
import csv
import sys
from pathlib import Path

# Garante que o módulo app seja encontrado ao rodar direto da pasta backend
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from sqlalchemy.dialects.postgresql import insert as pg_insert

from app.database import SessionLocal, engine
from app.models import Base, Disciplina, TipoDisciplina, Departamento, PeriodoOferta
from app.models import prerequisitos as prereq_table
from app.models import Aula, AulaDia, AulaHorario, DiaSemana, Horario


SEED_DIR           = Path(__file__).parent / "seed"
DISCIPLINAS_CSV    = SEED_DIR / "disciplinas.csv"
PREREQS_CSV        = SEED_DIR / "prerequisitos.csv"
PERIODO_OFERTA_CSV = SEED_DIR / "periodo_oferta.csv"
AULAS_CSV          = SEED_DIR / "aulas.csv"


def _tipo(valor: str) -> TipoDisciplina:
    """
    Converte string do CSV para enum TipoDisciplina.

    :param valor: Valor bruto do CSV ('OB', 'OP' ou 'EC').
    :type valor: str
    :return: Enum correspondente.
    :rtype: TipoDisciplina
    """
    mapa = {"OB": TipoDisciplina.OBRIGATORIA, "OP": TipoDisciplina.OPTATIVA,
            "EC": TipoDisciplina.OPTATIVA}
    return mapa.get(valor.strip(), TipoDisciplina.OPTATIVA)


def _dept(valor: str) -> Departamento:
    """
    Converte string do CSV para enum Departamento.

    :param valor: Valor bruto do CSV ('DI', 'DMAT', 'DEE', etc.).
    :type valor: str
    :return: Enum correspondente.
    :rtype: Departamento
    """
    try:
        return Departamento(valor.strip())
    except ValueError:
        return Departamento.OUTRO


def seed_disciplinas(session) -> int:
    """
    Insere ou ignora disciplinas a partir do CSV.

    :param session: Sessão SQLAlchemy ativa.
    :return: Número de disciplinas processadas.
    :rtype: int
    """
    with open(DISCIPLINAS_CSV, encoding="utf-8") as f:
        rows = list(csv.DictReader(f))

    for row in rows:
        min_horas_raw = row.get("min_horas", "").strip()
        stmt = pg_insert(Disciplina).values(
            codigo          = row["codigo"].strip(),
            nome            = row["nome"].strip(),
            creditos        = int(row["creditos"]),
            carga_horaria   = int(row["chs"]),
            tipo_disciplina = _tipo(row["tipo"]),
            departamento    = _dept(row["departamento"]),
            periodo_sugerido= int(row["periodo_sugerido"]) if row.get("periodo_sugerido", "").strip().isdigit() else None,
            min_horas       = int(min_horas_raw) if min_horas_raw.isdigit() else None,
        ).on_conflict_do_nothing(index_elements=["codigo"])
        session.execute(stmt)

    session.commit()
    return len(rows)


def seed_prerequisitos(session) -> int:
    """
    Insere ou ignora pré-requisitos a partir do CSV.

    :param session: Sessão SQLAlchemy ativa.
    :return: Número de relações processadas.
    :rtype: int
    """
    with open(PREREQS_CSV, encoding="utf-8") as f:
        rows = list(csv.DictReader(f))

    for row in rows:
        stmt = pg_insert(prereq_table).values(
            codigo_disciplina = row["codigo_disciplina"].strip(),
            codigo_prereq     = row["codigo_prereq"].strip(),
            bloco             = int(row["bloco"]),
        ).on_conflict_do_nothing()
        session.execute(stmt)

    session.commit()
    return len(rows)


def seed_aulas(session) -> int:
    """
    Insere horários reais por semestre (PAR/ÍMPAR) lidos do arquivo aulas.csv.

    Deleta todas as aulas existentes antes de reinserir para garantir dados frescos.
    Cada linha do CSV gera um objeto Aula com seus AulaDia e AulaHorario associados.
    O valor 'AMBOS' em tipo_semestre é convertido para NULL no banco (aplica-se a
    ambos os semestres). Dados extraídos das grades oficiais de oferta dos
    departamentos DI, DMAT e DEE da UFES.

    :param session: Sessão SQLAlchemy ativa.
    :return: Número de Aulas inseridas.
    :rtype: int
    """
    from sqlalchemy import delete as sa_delete
    session.execute(sa_delete(AulaHorario))
    session.execute(sa_delete(AulaDia))
    session.execute(sa_delete(Aula))
    session.flush()

    total = 0
    with open(AULAS_CSV, encoding="utf-8") as f:
        rows = list(csv.DictReader(f))

    for row in rows:
        codigo           = row["codigo"].strip()
        tipo_semestre_raw = row["tipo_semestre"].strip()
        dias_raw         = [d.strip() for d in row["dias"].strip().split(":")]
        horarios_raw     = [h.strip() for h in row["horarios"].strip().split(":")]

        disc = session.get(Disciplina, codigo)
        if disc is None:
            continue

        tipo_semestre = None if tipo_semestre_raw == "AMBOS" else tipo_semestre_raw

        aula = Aula(codigo_disciplina=codigo, tipo_semestre=tipo_semestre)
        session.add(aula)
        session.flush()

        for dia_str in dias_raw:
            session.add(AulaDia(aula_id=aula.id, dia_semana=DiaSemana(dia_str)))
        for horario_str in horarios_raw:
            session.add(AulaHorario(aula_id=aula.id, horario=Horario(horario_str)))
        total += 1

    session.commit()
    return total


def seed_periodo_oferta(session) -> int:
    """
    Atualiza o campo periodo_oferta de cada disciplina a partir do CSV.

    Ao contrário das outras funções de seed, este método sempre sobrescreve
    o valor existente, pois o CSV é a fonte de verdade para essa classificação.

    :param session: Sessão SQLAlchemy ativa.
    :return: Número de disciplinas atualizadas.
    :rtype: int
    """
    with open(PERIODO_OFERTA_CSV, encoding="utf-8") as f:
        rows = list(csv.DictReader(f))

    atualizadas = 0
    for row in rows:
        disc = session.get(Disciplina, row["codigo"].strip())
        if disc:
            disc.periodo_oferta = PeriodoOferta(row["periodo_oferta"].strip())
            atualizadas += 1

    session.commit()
    return atualizadas


def main():
    """
    Ponto de entrada do script de seed.

    Cria as tabelas se não existirem e popula disciplinas, pré-requisitos
    e classificação de periodo_oferta (PAR/ÍMPAR/AMBOS).
    """
    Base.metadata.create_all(bind=engine)

    with SessionLocal() as session:
        n_disc   = seed_disciplinas(session)
        n_prereq = seed_prerequisitos(session)
        n_oferta = seed_periodo_oferta(session)
        n_aulas  = seed_aulas(session)

    print(f"{n_disc} disciplinas processadas.")
    print(f"{n_prereq} pre-requisitos processados.")
    print(f"{n_oferta} disciplinas com periodo_oferta atualizado.")
    print(f"{n_aulas} aulas inseridas (horarios reais extraidos das grades DI/DMAT/DEE).")


if __name__ == "__main__":
    main()

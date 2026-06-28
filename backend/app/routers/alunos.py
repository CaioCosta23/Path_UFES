"""
Router de alunos do PathUFES.

Endpoints para cadastro de histórico acadêmico e sugestão de disciplinas
disponíveis com base nos pré-requisitos já cumpridos.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, insert
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Aluno, Historico, Disciplina
from app.models import historico_disciplinas as hist_disc_table
from app.schemas import (
    HistoricoInput, HistoricoResponse, DisciplinaDisponivel
)

router = APIRouter(prefix="/aluno", tags=["aluno"])


@router.post("/historico", response_model=HistoricoResponse, status_code=201)
def salvar_historico(payload: HistoricoInput, db: Session = Depends(get_db)):
    """
    Salva ou atualiza o histórico acadêmico de um aluno.

    Cria o registro de Aluno e Historico caso não existam. Substitui
    as disciplinas aprovadas existentes pelas recebidas no payload.

    :param payload: Dados do aluno e disciplinas aprovadas.
    :type payload: HistoricoInput
    :param db: Sessão do banco de dados injetada pelo FastAPI.
    :type db: Session
    :return: Matrícula e quantidade de disciplinas salvas.
    :rtype: HistoricoResponse
    """
    aluno = db.get(Aluno, payload.matricula)
    if not aluno:
        aluno = Aluno(
            matricula         = payload.matricula,
            nome              = payload.nome,
            curso             = payload.curso,
            ano_ingresso      = payload.ano_ingresso,
            semestre_ingresso = payload.semestre_ingresso,
        )
        db.add(aluno)
        db.flush()

    historico = db.execute(
        select(Historico).where(Historico.matricula == payload.matricula)
    ).scalar_one_or_none()

    if not historico:
        historico = Historico(matricula=payload.matricula, cr=payload.cr)
        db.add(historico)
        db.flush()
    else:
        historico.cr = payload.cr
        # Remove disciplinas antigas para reinserir atualizadas
        db.execute(
            hist_disc_table.delete().where(
                hist_disc_table.c.historico_id == historico.id
            )
        )
        db.flush()

    codigos_validos = {
        row[0] for row in db.execute(select(Disciplina.codigo)).all()
    }

    for disc in payload.disciplinas:
        if disc.codigo not in codigos_validos:
            continue
        db.execute(
            insert(hist_disc_table).values(
                historico_id     = historico.id,
                codigo_disciplina = disc.codigo,
                media            = disc.media,
                ano              = disc.ano,
                semestre         = disc.semestre,
            )
        )

    db.commit()
    return HistoricoResponse(
        matricula          = payload.matricula,
        disciplinas_salvas = len(payload.disciplinas),
    )


@router.get("/{matricula}/disponiveis", response_model=list[DisciplinaDisponivel])
def get_disponiveis(matricula: str, db: Session = Depends(get_db)):
    """
    Retorna as disciplinas que o aluno pode cursar no próximo semestre.

    Uma disciplina está disponível quando ainda não foi aprovada e todos
    os seus pré-requisitos já constam no histórico do aluno.

    :param matricula: Matrícula do aluno.
    :type matricula: str
    :param db: Sessão do banco de dados injetada pelo FastAPI.
    :type db: Session
    :return: Lista de disciplinas disponíveis.
    :rtype: list[DisciplinaDisponivel]
    """
    historico = db.execute(
        select(Historico).where(Historico.matricula == matricula)
    ).scalar_one_or_none()

    if not historico:
        raise HTTPException(status_code=404, detail="Aluno não encontrado.")

    aprovadas = {
        row[0]
        for row in db.execute(
            select(hist_disc_table.c.codigo_disciplina).where(
                hist_disc_table.c.historico_id == historico.id
            )
        ).all()
    }

    todas = db.execute(select(Disciplina)).scalars().all()

    disponiveis = []
    for disc in todas:
        if disc.codigo in aprovadas:
            continue
        prereqs = {p.codigo for p in disc.pre_requisitos}
        if prereqs.issubset(aprovadas):
            disponiveis.append(
                DisciplinaDisponivel(
                    codigo           = disc.codigo,
                    nome             = disc.nome,
                    creditos         = disc.creditos,
                    tipo_disciplina  = disc.tipo_disciplina.value,
                    periodo_sugerido = disc.periodo_sugerido,
                )
            )

    disponiveis.sort(key=lambda d: (d.periodo_sugerido or 99, d.nome))
    return disponiveis

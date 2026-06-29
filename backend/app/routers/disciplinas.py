"""
Router de disciplinas do PathUFES.

Endpoints relacionados à grade curricular e ao grafo de pré-requisitos.
"""
from fastapi import APIRouter, Depends
from sqlalchemy import select, text
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Disciplina, prerequisitos as prereq_table
from app.schemas import GrafoResponse, NoDisciplina, ArestaPrereq

router = APIRouter(prefix="/grafo", tags=["grafo"])


@router.get("", response_model=GrafoResponse)
def get_grafo(db: Session = Depends(get_db)):
    """
    Retorna o grafo completo de disciplinas e pré-requisitos.

    Os nós representam disciplinas e as arestas representam relações de
    pré-requisito. O formato é compatível com Cytoscape.js.

    :param db: Sessão do banco de dados injetada pelo FastAPI.
    :type db: Session
    :return: Grafo com nós e arestas.
    :rtype: GrafoResponse
    """
    disciplinas = db.execute(select(Disciplina)).scalars().all()

    nos = [
        NoDisciplina(
            id               = d.codigo,
            nome             = d.nome,
            creditos         = d.creditos,
            carga_horaria    = d.carga_horaria,
            tipo_disciplina  = d.tipo_disciplina.value,
            departamento     = d.departamento.value,
            periodo_sugerido = d.periodo_sugerido,
        )
        for d in disciplinas
    ]

    arestas_rows = db.execute(select(prereq_table)).all()
    arestas = [
        ArestaPrereq(
            source = row.codigo_disciplina,
            target = row.codigo_prereq,
            bloco  = row.bloco,
        )
        for row in arestas_rows
    ]

    return GrafoResponse(nos=nos, arestas=arestas)

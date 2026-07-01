"""
Router de disciplinas do PathUFES.

Endpoints relacionados à grade curricular e ao grafo de pré-requisitos.
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Disciplina, Historico, prerequisitos as prereq_table
from app.models import historico_disciplinas as hist_disc_table
from app.schemas import GrafoResponse, NoDisciplina, ArestaPrereq

router = APIRouter(prefix="/grafo", tags=["grafo"])


@router.get("", response_model=GrafoResponse)
def get_grafo(
    matricula: str | None = Query(default=None),
    db: Session = Depends(get_db),
):
    """
    Retorna o grafo completo de disciplinas e pré-requisitos.

    Os nós representam disciplinas e as arestas representam relações de
    pré-requisito. O formato é compatível com Cytoscape.js.

    Quando ``matricula`` é informada, cada nó recebe um campo ``status``
    com valor ``"cumprida"``, ``"disponivel"`` ou ``"bloqueada"``,
    permitindo coloração personalizada no frontend.

    :param matricula: Matrícula do aluno para personalizar o status dos nós.
    :type matricula: str | None
    :param db: Sessão do banco de dados injetada pelo FastAPI.
    :type db: Session
    :return: Grafo com nós e arestas.
    :rtype: GrafoResponse
    """
    disciplinas = db.execute(select(Disciplina)).scalars().all()

    aprovadas: set[str] = set()
    if matricula:
        historico = db.execute(
            select(Historico).where(Historico.matricula == matricula)
        ).scalar_one_or_none()
        if historico:
            aprovadas = {
                row[0]
                for row in db.execute(
                    select(hist_disc_table.c.codigo_disciplina).where(
                        hist_disc_table.c.historico_id == historico.id
                    )
                ).all()
            }

    def _status(disc: Disciplina) -> str | None:
        """
        Calcula o status de uma disciplina para o aluno informado.

        :param disc: Disciplina a ser avaliada.
        :type disc: Disciplina
        :return: ``"cumprida"``, ``"disponivel"``, ``"bloqueada"`` ou ``None``.
        :rtype: str | None
        """
        if not matricula:
            return None
        if disc.codigo in aprovadas:
            return "cumprida"
        prereqs = {p.codigo for p in disc.pre_requisitos}
        return "disponivel" if prereqs.issubset(aprovadas) else "bloqueada"

    nos = [
        NoDisciplina(
            id               = d.codigo,
            nome             = d.nome,
            creditos         = d.creditos,
            carga_horaria    = d.carga_horaria,
            tipo_disciplina  = d.tipo_disciplina.value,
            departamento     = d.departamento.value,
            periodo_sugerido = d.periodo_sugerido,
            status           = _status(d),
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

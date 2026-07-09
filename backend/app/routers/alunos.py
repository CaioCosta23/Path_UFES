"""
Router de alunos do PathUFES.

Endpoints para cadastro de histórico acadêmico, sugestão de disciplinas
disponíveis e geração de trilha acadêmica otimizada.

O algoritmo de trilha usa o método do **caminho crítico em calendário**:
a cada semestre, entre as disciplinas disponíveis, são priorizadas aquelas
cuja cadeia de dependências exige mais semestres para ser concluída,
levando em conta esperas causadas por restrições de PAR/ÍMPAR.
"""
import io
import re
from collections import defaultdict

import pdfplumber
from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from sqlalchemy import select, insert
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Aluno, Historico, Disciplina, PeriodoOferta, TipoDisciplina
from app.models import historico_disciplinas as hist_disc_table
from app.schemas import (
    HistoricoInput, HistoricoResponse, UploadPdfResponse, DisciplinaDisponivel,
    AulaInfo, DisciplinaTrilha, OptativaPrevista, SemestreTrilha, TrilhaResponse,
)

OPTATIVAS_EXIGIDAS = 9

router = APIRouter(prefix="/aluno", tags=["aluno"])


# ---------------------------------------------------------------------------
# Helpers de parsing do PDF do SIE/UFES
# ---------------------------------------------------------------------------

def _parse_aluno_pdf(texto: str) -> dict:
    """
    Extrai os dados cadastrais do aluno do cabeçalho do histórico SIE.

    :param texto: Texto completo extraído do PDF.
    :type texto: str
    :return: Dicionário com matricula, nome, curso, ano_ingresso,
             semestre_ingresso e cr.
    :rtype: dict
    """
    def _buscar(pattern: str, default: str = "") -> str:
        """
        Aplica regex no texto e retorna o primeiro grupo capturado.

        :param pattern: Expressão regular com um grupo de captura.
        :type pattern: str
        :param default: Valor retornado quando não há correspondência.
        :type default: str
        :return: Grupo capturado ou default.
        :rtype: str
        """
        m = re.search(pattern, texto)
        return m.group(1).strip() if m else default

    cr_raw = _buscar(r"Coeficiente de Rendimento Acumulado:\s+([\d.,]+)")
    return {
        "matricula":         _buscar(r"Matr[íi]cula:\s+(\d+)"),
        "nome":              _buscar(r"Nome civil:\s+([^\n]+)"),
        "curso":             _buscar(r"Curso:\s+\d+\s+-\s+(.+?)\s+Vers[ãa]o:"),
        "ano_ingresso":      _buscar(r"Ano/Semestre de ingresso:\s+(\d{4})/"),
        "semestre_ingresso": _buscar(r"Ano/Semestre de ingresso:\s+\d{4}/(\d+)"),
        "cr":                cr_raw.replace(",", "."),
    }


def _parse_historico_pdf(texto: str) -> list[dict]:
    """
    Extrai as disciplinas aprovadas (situação AP) do histórico SIE.

    :param texto: Texto completo extraído do PDF.
    :type texto: str
    :return: Lista de dicionários com codigo, media, ano e semestre.
    :rtype: list[dict]
    """
    aprovadas: list[dict] = []

    sem_posicoes = [
        (m.start(), m.group(1), m.group(2))
        for m in re.finditer(r"(\d{4})/([12])", texto)
    ]

    for code_m in re.finditer(r"[A-Z]{3}\d{5}\b", texto):
        codigo = code_m.group(0)
        pos    = code_m.start()
        trecho = texto[pos: pos + 250]

        sit_m = re.search(
            r"\b(AP|RF|RN|IF|IN|MT|CA|DI|AD|AE|AL|ASC|CAN|TR)\b", trecho
        )
        if not sit_m or sit_m.group(1) != "AP":
            continue

        semestre_atual = None
        for s_pos, ano, semestre in sem_posicoes:
            if s_pos < pos:
                semestre_atual = (ano, semestre)
        if not semestre_atual:
            continue

        media_m = re.search(r"([\d]+[,.][\d]+)\s+AP\b", trecho)
        media   = media_m.group(1).replace(",", ".") if media_m else None

        aprovadas.append({
            "codigo":   codigo,
            "media":    media,
            "ano":      semestre_atual[0],
            "semestre": semestre_atual[1],
        })

    return aprovadas


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.post("/upload-pdf", response_model=UploadPdfResponse, status_code=201)
def upload_historico_pdf(
    file: UploadFile = File(...),
    db:   Session    = Depends(get_db),
):
    """
    Importa o histórico acadêmico de um aluno a partir do PDF do SIE/UFES.

    Extrai os dados cadastrais e as disciplinas aprovadas do PDF, cria ou
    atualiza o registro do aluno e seu histórico no banco de dados.

    :param file: Arquivo PDF do histórico parcial exportado pelo SIE.
    :type file: UploadFile
    :param db: Sessão do banco de dados injetada pelo FastAPI.
    :type db: Session
    :return: Matrícula, nome e quantidade de disciplinas importadas.
    :rtype: UploadPdfResponse
    :raises HTTPException 400: Se o PDF não puder ser processado.
    :raises HTTPException 422: Se a matrícula não for encontrada no PDF.
    """
    try:
        conteudo = file.file.read()
        with pdfplumber.open(io.BytesIO(conteudo)) as pdf:
            texto = "\n".join(page.extract_text() or "" for page in pdf.pages)
    except Exception:
        raise HTTPException(status_code=400, detail="Não foi possível ler o PDF.")

    dados_aluno  = _parse_aluno_pdf(texto)
    disciplinas  = _parse_historico_pdf(texto)

    if not dados_aluno["matricula"]:
        raise HTTPException(
            status_code=422,
            detail="Matrícula não encontrada no PDF. Verifique se é o histórico correto.",
        )

    payload = HistoricoInput(
        matricula        = dados_aluno["matricula"],
        nome             = dados_aluno["nome"] or "Aluno",
        curso            = dados_aluno["curso"] or "Não identificado",
        ano_ingresso     = int(dados_aluno["ano_ingresso"] or 0),
        periodo_ingresso = dados_aluno["semestre_ingresso"] or "1",
        cr               = float(dados_aluno["cr"]) if dados_aluno["cr"] else None,
        disciplinas      = [
            {"codigo": d["codigo"], "media": float(d["media"]) if d["media"] else None,
             "ano": int(d["ano"]), "semestre": int(d["semestre"])}
            for d in disciplinas
        ],
    )

    salvar_historico(payload, db)

    return UploadPdfResponse(
        matricula              = payload.matricula,
        nome                   = payload.nome,
        disciplinas_importadas = len(disciplinas),
    )


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
            matricula        = payload.matricula,
            nome             = payload.nome,
            curso            = payload.curso,
            ano_ingresso     = payload.ano_ingresso,
            periodo_ingresso = payload.periodo_ingresso,
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


# ---------------------------------------------------------------------------
# Funções auxiliares para o algoritmo de trilha
# ---------------------------------------------------------------------------

def _tem_conflito_horario(
    disc: Disciplina,
    horarios_bloqueados: list[str],
    semestre_atual: str,
) -> bool:
    """
    Verifica se a disciplina tem alguma aula em horário bloqueado pelo aluno
    no semestre em questão.

    Cada elemento de ``horarios_bloqueados`` aceita dois formatos:

    - ``"DIA:HORARIO"`` — restrição global, aplica-se a **todos** os semestres.
    - ``"SEMESTRE:DIA:HORARIO"`` — restrição específica, aplica-se **somente**
      ao semestre indicado (ex.: ``"2026/2:SEGUNDA:H08_09"``).

    Há conflito quando o dia E o horário bloqueados pertencem à mesma ``Aula``
    da disciplina. Disciplinas sem aulas cadastradas nunca conflitam.

    :param disc: Disciplina a verificar.
    :type disc: Disciplina
    :param horarios_bloqueados: Lista de restrições no formato descrito acima.
    :type horarios_bloqueados: list[str]
    :param semestre_atual: Semestre sendo avaliado (ex.: ``"2026/2"``).
    :type semestre_atual: str
    :return: True se houver conflito de horário neste semestre.
    :rtype: bool
    """
    if not horarios_bloqueados or not disc.aulas:
        return False
    tipo_atual = _tipo_semestre(semestre_atual)
    for aula in disc.aulas:
        # Aulas com tipo_semestre definido só se aplicam no semestre correto
        if aula.tipo_semestre is not None and aula.tipo_semestre != tipo_atual:
            continue
        dias_aula = {d.dia_semana.value for d in aula.dias}
        hors_aula = {h.horario.value for h in aula.horarios}
        for bloqueado in horarios_bloqueados:
            parts = bloqueado.split(":", 2)  # no máximo 3 partes
            if len(parts) == 2:
                # Global: "DIA:HORARIO" — aplica a todos os semestres
                dia, hora = parts
            elif len(parts) == 3:
                # Específica: "SEMESTRE:DIA:HORARIO" — só naquele semestre
                sem, dia, hora = parts
                if sem != semestre_atual:
                    continue
            else:
                continue
            if dia in dias_aula and hora in hors_aula:
                return True
    return False


def _aulas_conflitam_entre_si(disc1, disc2, tipo: str) -> bool:
    """
    Verifica se duas disciplinas têm aulas com conflito de horário em um mesmo semestre.

    Há conflito quando existe pelo menos um par de aulas (uma de cada disciplina,
    ambas válidas para ``tipo``) que ocorre no mesmo dia **e** na mesma faixa de horário.

    :param disc1: Primeira disciplina.
    :type disc1: Disciplina
    :param disc2: Segunda disciplina.
    :type disc2: Disciplina
    :param tipo: Tipo do semestre ('IMPAR' ou 'PAR').
    :type tipo: str
    :return: True se houver conflito de horário entre as duas disciplinas.
    :rtype: bool
    """
    aulas1 = [a for a in disc1.aulas if a.tipo_semestre is None or a.tipo_semestre == tipo]
    aulas2 = [a for a in disc2.aulas if a.tipo_semestre is None or a.tipo_semestre == tipo]
    for a1 in aulas1:
        dias1 = {d.dia_semana.value for d in a1.dias}
        hors1 = {h.horario.value for h in a1.horarios}
        for a2 in aulas2:
            dias2 = {d.dia_semana.value for d in a2.dias}
            hors2 = {h.horario.value for h in a2.horarios}
            if dias1 & dias2 and hors1 & hors2:
                return True
    return False


def _proximo_semestre(semestre: str) -> str:
    """
    Retorna o semestre imediatamente seguinte.

    :param semestre: Semestre atual no formato "AAAA/P" (ex: "2026/1").
    :type semestre: str
    :return: Próximo semestre no mesmo formato.
    :rtype: str
    """
    ano, periodo = semestre.split('/')
    return f"{ano}/2" if periodo == '1' else f"{int(ano) + 1}/1"


def _tipo_semestre(semestre: str) -> str:
    """
    Retorna o tipo do semestre: 'IMPAR' para primeiro semestre, 'PAR' para segundo.

    :param semestre: Semestre no formato "AAAA/P".
    :type semestre: str
    :return: 'IMPAR' ou 'PAR'.
    :rtype: str
    """
    return 'IMPAR' if semestre.endswith('/1') else 'PAR'


def _compativel(periodo_oferta, tipo: str) -> bool:
    """
    Verifica se uma disciplina pode ser ofertada no semestre do tipo dado.

    Disciplinas com periodo_oferta AMBOS ou None são sempre compatíveis.

    :param periodo_oferta: Valor do enum PeriodoOferta da disciplina.
    :type periodo_oferta: PeriodoOferta | None
    :param tipo: Tipo do semestre ('PAR' ou 'IMPAR').
    :type tipo: str
    :return: True se a disciplina pode ser cursada nesse tipo de semestre.
    :rtype: bool
    """
    if periodo_oferta is None or periodo_oferta == PeriodoOferta.AMBOS:
        return True
    return periodo_oferta.value == tipo


def _profundidade_calendario(
    codigo: str,
    tipo_deste: str,
    pendentes_set: set,
    requer_map: dict,
    disc_map: dict,
    memo: dict,
) -> int:
    """
    Calcula a profundidade em semestres de calendário da cadeia de
    dependências de uma disciplina, considerando esperas por PAR/ÍMPAR.

    O valor retornado é o número de semestres necessários a partir do
    semestre em que esta disciplina é cursada (inclusive) até a conclusão
    do último elo da sua cadeia. Disciplinas que desbloqueiam sucessoras
    com restrição PAR/ÍMPAR incompatível com o semestre imediatamente
    seguinte recebem uma penalidade de +1 semestre de espera.

    Este método é chamado para **ordenar** as disciplinas disponíveis:
    a que possui maior profundidade é a que mais atrasa o curso se for
    postergada, portanto deve ser priorizada.

    :param codigo: Código da disciplina cujo caminho crítico será calculado.
    :type codigo: str
    :param tipo_deste: Tipo do semestre em que esta disciplina está sendo
        agendada ('PAR' ou 'IMPAR').
    :type tipo_deste: str
    :param pendentes_set: Conjunto de códigos das disciplinas ainda pendentes.
    :type pendentes_set: set
    :param requer_map: Mapa ``{codigo → set de códigos que dependem dele}``.
    :type requer_map: dict
    :param disc_map: Mapa ``{codigo → Disciplina}`` para disciplinas pendentes.
    :type disc_map: dict
    :param memo: Cache de resultados já calculados para evitar recomputação.
    :type memo: dict
    :return: Profundidade em semestres de calendário (mínimo 1).
    :rtype: int
    """
    key = (codigo, tipo_deste)
    if key in memo:
        return memo[key]

    # Tipo do semestre imediatamente seguinte ao deste
    tipo_proximo = 'PAR' if tipo_deste == 'IMPAR' else 'IMPAR'

    # Disciplinas pendentes que dependem diretamente desta
    sucessoras = [
        disc_map[c]
        for c in requer_map.get(codigo, set())
        if c in pendentes_set
    ]

    if not sucessoras:
        memo[key] = 1
        return 1

    max_cadeia = 0
    for s in sucessoras:
        if _compativel(s.periodo_oferta, tipo_proximo):
            # S pode começar no semestre seguinte: sem espera adicional
            cadeia = _profundidade_calendario(
                s.codigo, tipo_proximo, pendentes_set, requer_map, disc_map, memo
            )
        else:
            # S precisa esperar mais um semestre por restrição PAR/ÍMPAR
            cadeia = 1 + _profundidade_calendario(
                s.codigo, tipo_deste, pendentes_set, requer_map, disc_map, memo
            )
        max_cadeia = max(max_cadeia, cadeia)

    result = 1 + max_cadeia
    memo[key] = result
    return result


# ---------------------------------------------------------------------------
# GET /aluno/{matricula}/trilha
# ---------------------------------------------------------------------------

@router.get("/{matricula}/trilha", response_model=TrilhaResponse)
def get_trilha(
    matricula: str,
    semestre_inicio: str = Query(
        ...,
        description='Semestre a partir do qual gerar a trilha, ex: "2026/2"',
    ),
    max_disciplinas: int = Query(5, ge=1, le=10),
    horarios_bloqueados: list[str] = Query(
        default=[],
        description=(
            "Pares DIA:HORARIO que o aluno não pode frequentar "
            "(ex: SEGUNDA:H08_09). Disciplinas sem aulas cadastradas nunca são excluídas."
        ),
    ),
    db: Session = Depends(get_db),
):
    """
    Gera a trilha acadêmica otimizada para o aluno concluir o curso no menor
    número de semestres possível.

    **Algoritmo — Caminho Crítico em Calendário:**

    A cada semestre, entre as disciplinas cujos pré-requisitos já foram
    cumpridos e cuja oferta é compatível com o tipo do semestre (PAR/ÍMPAR),
    o algoritmo prioriza aquelas com maior **profundidade de calendário**:
    o número de semestres necessários para concluir toda a cadeia de
    dependências abaixo delas, levando em conta esperas forçadas por
    restrições PAR/ÍMPAR nos sucessores.

    Isso garante que as disciplinas que mais atrasam o curso se postergadas
    sejam sempre agendadas primeiro. Os slots restantes até ``max_disciplinas``
    são preenchidos com placeholders de optativas ("Optativa01", ...) até o
    limite de ``OPTATIVAS_EXIGIDAS - optativas_já_aprovadas``. Quando todas as
    obrigatórias acabam e ainda faltam optativas, semestres extras exclusivos
    de optativas são criados até completar o total exigido. Para cada semestre
    é calculada também a lista de optativas prováveis compatíveis.

    :param matricula: Matrícula do aluno.
    :type matricula: str
    :param semestre_inicio: Primeiro semestre da trilha (ex: "2026/2").
    :type semestre_inicio: str
    :param max_disciplinas: Número máximo de disciplinas por semestre (1–10).
    :type max_disciplinas: int
    :param horarios_bloqueados: Pares "DIA:HORARIO" que o aluno não pode frequentar.
        Disciplinas cujos horários conflitem com algum par são excluídas da trilha.
        Disciplinas sem aulas cadastradas nunca são excluídas.
    :type horarios_bloqueados: list[str]
    :param db: Sessão do banco de dados injetada pelo FastAPI.
    :type db: Session
    :return: Trilha semestre a semestre com disciplinas, optativas previstas e
        quantidade de optativas que ainda faltam para completar o currículo.
    :rtype: TrilhaResponse
    """
    historico = db.execute(
        select(Historico).where(Historico.matricula == matricula)
    ).scalar_one_or_none()

    if not historico:
        raise HTTPException(status_code=404, detail="Aluno não encontrado.")

    # Disciplinas já aprovadas no histórico
    aprovadas = {
        row[0]
        for row in db.execute(
            select(hist_disc_table.c.codigo_disciplina).where(
                hist_disc_table.c.historico_id == historico.id
            )
        ).all()
    }

    todas = db.execute(select(Disciplina)).scalars().all()

    # Obrigatórias ainda não aprovadas
    pendentes = [
        d for d in todas
        if d.tipo_disciplina == TipoDisciplina.OBRIGATORIA
        and d.codigo not in aprovadas
    ]

    # Optativas ainda não aprovadas (usadas na lista de previstas)
    optativas = [
        d for d in todas
        if d.tipo_disciplina == TipoDisciplina.OPTATIVA
        and d.codigo not in aprovadas
    ]

    # Quantas optativas o aluno ainda precisa cursar
    optativas_aprovadas_count = sum(
        1 for d in todas
        if d.tipo_disciplina == TipoDisciplina.OPTATIVA
        and d.codigo in aprovadas
    )
    optativas_faltantes = max(0, OPTATIVAS_EXIGIDAS - optativas_aprovadas_count)
    optativas_agendadas = 0  # contador global de placeholders já incluídos na trilha

    # cumpridas acumula aprovadas + agendadas em semestres anteriores.
    # Cada iteração adiciona as escolhidas, desbloqueando novos pré-requisitos.
    cumpridas = set(aprovadas)

    # Horas cursadas: soma das cargas horárias das disciplinas já aprovadas.
    # Atualizada a cada semestre agendado para verificar o requisito de min_horas.
    todas_map = {d.codigo: d for d in todas}
    horas_cumpridas = sum(
        todas_map[c].carga_horaria
        for c in aprovadas
        if c in todas_map
    )

    semestres: list[SemestreTrilha] = []
    semestre_atual = semestre_inicio
    MAX_SEMESTRES = 20
    MAX_ITERACOES = 40  # guarda contra deadlock de PAR/ÍMPAR
    iteracoes     = 0

    while pendentes and len(semestres) < MAX_SEMESTRES and iteracoes < MAX_ITERACOES:
        iteracoes += 1
        tipo = _tipo_semestre(semestre_atual)

        # Mapas reconstruídos a cada iteração para refletir as pendentes atuais
        pendentes_set = {d.codigo for d in pendentes}
        disc_map      = {d.codigo: d for d in pendentes}
        requer_map: dict = defaultdict(set)
        for d in pendentes:
            for prereq in d.pre_requisitos:
                requer_map[prereq.codigo].add(d.codigo)
        memo: dict = {}

        # Disciplinas prontas: pré-req cumpridos, período compatível, sem conflito de horário,
        # e mínimo de horas cursadas atingido (quando exigido, ex: TCC I requer 2000h).
        prontas = [
            d for d in pendentes
            if all(p.codigo in cumpridas for p in d.pre_requisitos)
            and _compativel(d.periodo_oferta, tipo)
            and not _tem_conflito_horario(d, horarios_bloqueados, semestre_atual)
            and (d.min_horas is None or horas_cumpridas >= d.min_horas)
        ]

        # Ordena pelo caminho crítico em calendário (descendente).
        # Maior profundidade = mais atraso se postergada = deve ser feita primeiro.
        prontas.sort(
            key=lambda d: (
                -_profundidade_calendario(
                    d.codigo, tipo, pendentes_set, requer_map, disc_map, memo
                ),
                d.nome,
            )
        )

        # Seleção greedy: respeita prioridade do caminho crítico e evita
        # conflitos de horário entre disciplinas do mesmo semestre.
        escolhidas: list = []
        for d in prontas:
            if len(escolhidas) >= max_disciplinas:
                break
            if not any(_aulas_conflitam_entre_si(d, j, tipo) for j in escolhidas):
                escolhidas.append(d)

        # Semestre sem obrigatórias disponíveis: avança (bloqueio de PAR/ÍMPAR)
        if not escolhidas:
            semestre_atual = _proximo_semestre(semestre_atual)
            continue

        # Monta a lista de disciplinas do semestre com dados de aula
        disciplinas_semestre: list[DisciplinaTrilha] = [
            DisciplinaTrilha(
                codigo=d.codigo,
                nome=d.nome,
                creditos=d.creditos,
                tipo_disciplina=d.tipo_disciplina.value,
                aulas=[
                    AulaInfo(
                        dias=[ad.dia_semana.value for ad in a.dias],
                        horarios=[ah.horario.value for ah in a.horarios],
                    )
                    for a in d.aulas
                    if a.tipo_semestre is None or a.tipo_semestre == tipo
                ],
            )
            for d in escolhidas
        ]

        # Slots restantes viram placeholders de optativas, respeitando o total necessário
        slots_disponiveis = max_disciplinas - len(escolhidas)
        slots_op = min(slots_disponiveis, optativas_faltantes - optativas_agendadas)
        for _ in range(slots_op):
            optativas_agendadas += 1
            disciplinas_semestre.append(
                DisciplinaTrilha(
                    codigo=None,
                    nome=f"Optativa{optativas_agendadas:02d}",
                    creditos=None,
                    tipo_disciplina="OP",
                    aulas=[],
                )
            )

        # Optativas prováveis: pré-requisitos cumpridos E período compatível
        optativas_previstas: list[OptativaPrevista] = sorted(
            [
                OptativaPrevista(codigo=d.codigo, nome=d.nome, creditos=d.creditos)
                for d in optativas
                if all(p.codigo in cumpridas for p in d.pre_requisitos)
                and _compativel(d.periodo_oferta, tipo)
                and d.codigo not in cumpridas
            ],
            key=lambda o: o.nome,
        )

        semestres.append(SemestreTrilha(
            semestre=semestre_atual,
            tipo=tipo,
            disciplinas=disciplinas_semestre,
            optativas_previstas=optativas_previstas,
        ))

        # Adiciona escolhidas a cumpridas: desbloqueia pré-requisitos futuros
        for d in escolhidas:
            cumpridas.add(d.codigo)
            pendentes.remove(d)
            horas_cumpridas += d.carga_horaria

        semestre_atual = _proximo_semestre(semestre_atual)

    # Quando todas as obrigatórias acabam e ainda faltam optativas,
    # cria semestres extras exclusivos de placeholders até atingir o total exigido.
    while optativas_agendadas < optativas_faltantes and len(semestres) < MAX_SEMESTRES:
        tipo = _tipo_semestre(semestre_atual)
        slots_op = min(max_disciplinas, optativas_faltantes - optativas_agendadas)
        disciplinas_semestre = []
        for _ in range(slots_op):
            optativas_agendadas += 1
            disciplinas_semestre.append(
                DisciplinaTrilha(
                    codigo=None,
                    nome=f"Optativa{optativas_agendadas:02d}",
                    creditos=None,
                    tipo_disciplina="OP",
                    aulas=[],
                )
            )
        optativas_previstas: list[OptativaPrevista] = sorted(
            [
                OptativaPrevista(codigo=d.codigo, nome=d.nome, creditos=d.creditos)
                for d in optativas
                if all(p.codigo in cumpridas for p in d.pre_requisitos)
                and _compativel(d.periodo_oferta, tipo)
                and d.codigo not in cumpridas
            ],
            key=lambda o: o.nome,
        )
        semestres.append(SemestreTrilha(
            semestre=semestre_atual,
            tipo=tipo,
            disciplinas=disciplinas_semestre,
            optativas_previstas=optativas_previstas,
        ))
        semestre_atual = _proximo_semestre(semestre_atual)

    return TrilhaResponse(
        matricula=matricula,
        semestres=semestres,
        optativas_faltantes=optativas_faltantes,
    )

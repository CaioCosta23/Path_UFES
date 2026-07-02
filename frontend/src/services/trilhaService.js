import {api} from "./api";

export function fetchTrilha(matricula, semestre, maxDisc, horariosBloqueados) {
    const params = new URLSearchParams({
        semestre_inicio: semestre,
        max_disciplinas: maxDisc,
    });
    horariosBloqueados.forEach((h) => params.append("horarios_bloqueados", h));
    return api.get(`/aluno/${encodeURIComponent(matricula)}/trilha?${params.toString()}`);
}

import {api} from "./api";

export function fetchTrilha(matricula, semestre, maxDisc, diasBloqueados) {
    const params = new URLSearchParams({
        semestre_inicio: semestre,
        max_disciplinas: maxDisc,
    });
    diasBloqueados.forEach((d) => params.append("dias_bloqueados", d));
    return api.get(`/aluno/${encodeURIComponent(matricula)}/trilha?${params.toString()}`);
}

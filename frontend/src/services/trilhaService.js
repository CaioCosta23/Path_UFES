import {api} from "./api";

/**
 * Solicita ao backend a trilha acadêmica ideal (sequência de disciplinas
 * por semestre) para um aluno, considerando suas preferências.
 *
 * @param {string} matricula Matrícula do aluno.
 * @param {string} semestre Semestre de início do planejamento (ex.: "2026/2").
 * @param {number} maxDisc Número máximo de disciplinas por semestre.
 * @param {string[]} horariosBloqueados Horários indisponíveis para o aluno (formato "DIA:HORARIO" ou "SEMESTRE:DIA:HORARIO").
 * @returns {Promise<Object>} Trilha com a divisão de disciplinas por semestre.
 */
export function fetchTrilha(matricula, semestre, maxDisc, horariosBloqueados) {
    const params = new URLSearchParams({
        semestre_inicio: semestre,
        max_disciplinas: maxDisc,
    });
    horariosBloqueados.forEach((h) => params.append("horarios_bloqueados", h));
    return api.get(`/aluno/${encodeURIComponent(matricula)}/trilha?${params.toString()}`);
}

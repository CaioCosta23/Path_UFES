/**
 * Abreviações dos dias da semana usadas para exibir os horários das aulas.
 */
export const DIA_LABELS = {
    SEGUNDA: "Seg", TERCA: "Ter", QUARTA: "Qua", QUINTA: "Qui", SEXTA: "Sex",
};

/**
 * Rótulos exibidos para o tipo de período de um semestre.
 */
export const PERIODO_LABELS = {
    PAR: "Par", IMPAR: "Ímpar",
};

/**
 * Converte o tipo de período de um semestre em seu rótulo de exibição.
 * Qualquer valor diferente de "IMPAR" é tratado como "Par", como na tela.
 *
 * @param {string} tipo Tipo do semestre ("PAR" ou "IMPAR").
 * @returns {string} Rótulo ("Par" ou "Ímpar").
 */
export function rotuloPeriodo(tipo) {
    return tipo === "IMPAR" ? PERIODO_LABELS.IMPAR : PERIODO_LABELS.PAR;
}

/**
 * Formata a lista de aulas de uma disciplina em um texto legível,
 * agrupando dias e faixa de horário (ex.: "Seg/Qua 07-09h").
 *
 * @param {Array<{dias: string[], horarios: string[]}>} aulas Aulas da disciplina, com os dias e horários ocupados.
 * @returns {string|null} Texto formatado com os horários, ou `null` se não houver aulas.
 */
export function formatarAulas(aulas) {
    if (!aulas || aulas.length === 0) return null;
    return aulas.map(({dias, horarios}) => {
        const diasLabel = dias.map((d) => DIA_LABELS[d] ?? d).join("/");
        const sorted    = [...horarios].sort();
        const inicio    = sorted[0].slice(1, 3);      // "H07_08" → "07"
        const fim       = sorted.at(-1).slice(4, 6);  // "H08_09" → "09"
        return `${diasLabel} ${inicio}-${fim}h`;
    }).join(", ");
}

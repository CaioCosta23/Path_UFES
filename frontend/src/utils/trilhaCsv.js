import {formatarAulas, rotuloPeriodo} from "./trilhaFormat";

const SEPARADOR = ";";
const QUEBRA    = "\r\n";
const BOM       = "﻿";
const CABECALHO = ["Semestre", "Período", "Código", "Disciplina", "Créditos", "Horários", "Tipo"];

/**
 * Prepara um valor como célula CSV: ausente vira vazio e campos com `;`, `"`,
 * `\r` ou `\n` são envolvidos em aspas duplas, duplicando as aspas internas.
 *
 * @param {string|number|null|undefined} valor Valor da célula.
 * @returns {string} Célula pronta para ser unida às demais.
 */
function celula(valor) {
    if (valor === null || valor === undefined) return "";
    const texto = String(valor);
    return /[;"\r\n]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
}

/**
 * Converte a trilha exibida em texto CSV (sem BOM): um cabeçalho e uma linha
 * por disciplina agendada, incluindo placeholders de optativa. Optativas
 * previstas não são incluídas.
 *
 * @param {{semestres: Array}} trilha Trilha como retornada pela API.
 * @returns {string} Conteúdo do CSV, com linhas separadas por `\r\n`.
 */
export function trilhaParaCsv(trilha) {
    const linhas = [CABECALHO];
    for (const sem of trilha.semestres) {
        for (const disc of sem.disciplinas) {
            linhas.push([
                sem.semestre,
                rotuloPeriodo(sem.tipo),
                disc.codigo,
                disc.nome,
                disc.creditos,
                formatarAulas(disc.aulas),
                disc.tipo_disciplina,
            ]);
        }
    }
    return linhas.map((l) => l.map(celula).join(SEPARADOR)).join(QUEBRA) + QUEBRA;
}

/**
 * Monta o nome do arquivo `trilha_<matricula>_<semestre>.csv`, trocando `/`
 * por `-`. Sem semestres, usa `trilha_<matricula>.csv`.
 *
 * @param {{matricula: string, semestres: Array<{semestre: string}>}} trilha Trilha exibida.
 * @returns {string} Nome do arquivo.
 */
export function nomeArquivoTrilha(trilha) {
    const primeiro = trilha.semestres[0]?.semestre;
    return primeiro
        ? `trilha_${trilha.matricula}_${primeiro.replace(/\//g, "-")}.csv`
        : `trilha_${trilha.matricula}.csv`;
}

/**
 * Dispara o download de um CSV no navegador, com BOM UTF-8 para o Excel
 * reconhecer a acentuação.
 *
 * @param {string} nome Nome do arquivo.
 * @param {string} conteudo Conteúdo do CSV (sem BOM).
 * @returns {void}
 */
export function baixarCsv(nome, conteudo) {
    const blob = new Blob([BOM + conteudo], {type: "text/csv;charset=utf-8"});
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = nome;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}

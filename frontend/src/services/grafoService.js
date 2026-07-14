import {api} from "./api"

/**
 * Busca o grafo de disciplinas e pré-requisitos no backend. Se a matrícula
 * for informada, os nós retornam com o status do aluno (cursada/disponível/bloqueada).
 *
 * @param {string|null} [matricula=null] Matrícula do aluno, ou `null` para um grafo sem status.
 * @returns {Promise<Object>} Grafo com nós e arestas.
 */
export function fetchGrafo(matricula = null) {
    const url = matricula ? `/grafo?matricula=${encodeURIComponent(matricula)}` : "/grafo";
    return api.get(url);
}

/**
 * Envia o histórico em PDF do aluno para o backend extrair as disciplinas já cursadas.
 *
 * @param {File} file Arquivo PDF do histórico escolar.
 * @returns {Promise<Object>} Dados do aluno importado (matrícula, nome, disciplinas salvas).
 */
export function uploadPdf(file) {
    return api.postFile("/aluno/upload-pdf", file);
}
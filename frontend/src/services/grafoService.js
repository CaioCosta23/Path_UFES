import {api} from "./api"

export function fetchGrafo(matricula = null) {
    const url = matricula ? `/grafo?matricula=${encodeURIComponent(matricula)}` : "/grafo";
    return api.get(url);
}

export function uploadPdf(file) {
    return api.postFile("/aluno/upload-pdf", file);
}
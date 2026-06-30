import {api} from "./api"

export function fetchGrafo() {
    return api.get("/grafo");
}

export function uploadPdf(file) {
    return api.postFile("/upload-pdf", file);
}
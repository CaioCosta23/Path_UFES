import {api} from "./api"

export function fetchGrafo() {
    return api.get("/grafo");
}
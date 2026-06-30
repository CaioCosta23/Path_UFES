import {api} from "./api"

export function fetchMaterias() {
    return api.get("/materias");
}

export function fetchRelacionamentos() {
    return api.get("/relacionamentos");
}

export function fetchMateria(id) {
    return api.get(`/materias/${id}`);
}
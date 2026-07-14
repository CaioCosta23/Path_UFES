/**
 * URL base da API do backend. Pode ser sobrescrita pela variável de
 * ambiente `VITE_API_URL`; caso contrário, aponta para o backend local.
 */
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

/**
 * Trata a resposta de uma requisição fetch: lança um erro com a mensagem
 * do backend quando a resposta não for bem-sucedida, ou retorna o JSON.
 *
 * @param {Response} response Resposta da requisição `fetch`.
 * @returns {Promise<any>} Corpo da resposta já convertido em JSON.
 */
async function handleResponse(response) {
    if (!response.ok) {
        const erro = await response.text();
        throw new Error(erro || `Erro ${response.status}`);
    }
    return response.json();
}

/**
 * Cliente HTTP simples usado por todos os serviços da aplicação para se
 * comunicar com a API do backend.
 */
export const api = {
    get: (endpoint) =>
        fetch(`${BASE_URL}${endpoint}`).then(handleResponse),

    post: (endpoint, data) =>
        fetch(`${BASE_URL}${endpoint}`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(data),
        }).then(handleResponse),

    postFile: (endpoint, file) => {
        const formData = new FormData();
        formData.append("file", file);

        return fetch(`${BASE_URL}${endpoint}`, {
            method: "POST",
            body: formData,
        }).then(handleResponse);
    },
    
    put: (endpoint, data) =>
        fetch(`${BASE_URL}${endpoint}`, {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(data),
        }).then(handleResponse),

    delete: (endpoint) =>
        fetch(`${BASE_URL}${endpoint}`, {
            method: "DELETE"
        }).then(handleResponse),
};
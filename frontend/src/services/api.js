const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function handleResponse(response) {
    if (!response.ok) {
        const erro = await response.text();
        throw new Error(erro || `Erro ${response.status}`);
    }
    return response.json();
}

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
            headers: {"Content-Type": "application.json"},
            body: JSON.stringify(data),
        }).then(handleResponse),

    delete: (endpoint) =>
        fetch(`${BASE_URL}${endpoint}`, {
            method: "DELETE"
        }).then(handleResponse),
};
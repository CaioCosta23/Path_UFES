# Alterações realizadas nesta sessão

## 1. Correção de bugs no frontend (`frontend/src/hooks/useGrafo.js`)

Três bugs foram corrigidos no hook principal do grafo:

### Bug 1 — Typo: `.mao()` → `.map()`
```js
// ANTES (linha 141):
const arestas = relacionamentos.mao((rel) => ({ ... }));

// DEPOIS:
const arestas = grafo.arestas.map((aresta) => ({ ... }));
```

### Bug 2 — Estado errado resetado em `carregarDePdf`
```js
// ANTES (linha 159):
setArestas(null);  // resetava as arestas, não o erro

// DEPOIS:
setErro(null);
```

### Bug 3 — Endpoints inexistentes no backend
```js
// ANTES: chamava duas rotas que não existem no backend
const materias = await fetchMaterias();        // GET /materias ❌
const relacionamentos = await fetchRelacionamentos();  // GET /relacionamentos ❌

// DEPOIS: usa a rota real do backend
const grafo = await fetchGrafo();  // GET /grafo ✅
```

---

## 2. Correção do serviço de API (`frontend/src/services/grafoService.js`)

Substituídas as funções `fetchMaterias` e `fetchRelacionamentos` (que chamavam rotas inexistentes)
por `fetchGrafo`, que chama o endpoint correto `GET /grafo`.

```js
// ANTES:
export function fetchMaterias() { return api.get("/materias"); }
export function fetchRelacionamentos() { return api.get("/relacionamentos"); }
export function fetchMateria(id) { return api.get(`/materias/${id}`); }

// DEPOIS:
export function fetchGrafo() { return api.get("/grafo"); }
```

---

## 3. Correção do Dockerfile do backend (`backend/Dockerfile`)

O comando de inicialização apontava para um arquivo inexistente no container:

```dockerfile
# ANTES:
CMD ["fastapi", "run", "main.py", "--port", "8000"]
# ❌ /app/main.py não existe dentro do container

# DEPOIS:
CMD ["fastapi", "run", "app/main.py", "--port", "8000"]
# ✅ /app/app/main.py existe (o backend fica em backend/app/main.py)
```

---

## Como rodar o projeto

```bash
cd Path_UFES
docker compose up --build
```

- Frontend: http://localhost:5173
- Backend (API): http://localhost:8000
- Documentação da API: http://localhost:8000/docs

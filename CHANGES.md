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

## 4. Upload de histórico via PDF (`frontend/src/services/grafoService.js`)

Adicionada função `uploadPdf` que chama a nova rota do backend para importar
o histórico acadêmico do aluno a partir de um PDF do SIE/UFES:

```js
// ANTES: chamava rota inexistente
export function uploadPdf(file) {
    return api.postFile("/upload-pdf", file);  // ❌ rota não existia

// DEPOIS: chama a rota correta
export function uploadPdf(file) {
    return api.postFile("/aluno/upload-pdf", file);  // ✅
}
```

---

## 5. Importação de histórico via PDF (`frontend/src/hooks/useGrafo.js`)

A função `carregarDePdf` foi reescrita. Antes tentava montar o grafo a partir
do PDF (formato incompatível). Agora envia o arquivo ao backend e armazena os
dados do aluno importado no estado `alunoImportado`:

```js
// ANTES: tentava renderizar grafo a partir do PDF
const dados = await uploadPdf(file);
const nos = dados.materias.map(...);       // ❌ campo inexistente
const arestas = dados.relacionamentos.map(...); // ❌ campo inexistente

// DEPOIS: salva o aluno retornado pelo backend
const dados = await uploadPdf(file);
setAlunoImportado(dados);
// dados = { matricula, nome, disciplinas_importadas }
```

Também adicionado o estado `alunoImportado` ao retorno do hook para que
componentes possam exibir o resultado da importação.

---

## 6. Exibição do resultado de importação (`frontend/src/components/GrafoViewer.jsx`)

Após o upload do PDF, o painel de informações exibe o nome e matrícula do
aluno importado, e a quantidade de disciplinas salvas:

```
Histórico importado: MIGUEL ZON MURAD (matrícula: 2023100265) — 24 disciplinas salvas.
```

Isso é renderizado pelo campo `alunoImportado` exposto pelo hook `useGrafo`.

---

## 7. Novo endpoint: `POST /aluno/upload-pdf` (backend)

Endpoint que recebe o PDF do histórico parcial do SIE/UFES, extrai os dados
do aluno e suas disciplinas aprovadas usando `pdfplumber`, e salva tudo no
banco de dados.

**Arquivos alterados:** `backend/app/routers/alunos.py`, `backend/app/schemas.py`

**Resposta:**
```json
{
  "matricula": "2023100265",
  "nome": "MIGUEL ZON MURAD",
  "disciplinas_importadas": 24
}
```

---

## 8. Grafo personalizado: `GET /grafo?matricula=` (backend)

O endpoint `GET /grafo` passou a aceitar o parâmetro opcional `?matricula=`.
Quando informado, cada nó retorna o campo `status` indicando a situação da
disciplina para aquele aluno:

| status | significado |
|---|---|
| `"cumprida"` | Disciplina já aprovada no histórico |
| `"disponivel"` | Todos os pré-requisitos cumpridos |
| `"bloqueada"` | Algum pré-requisito ainda pendente |

Sem `?matricula=`, o campo `status` retorna `null` e o comportamento é
idêntico ao anterior.

**Arquivos alterados:** `backend/app/routers/disciplinas.py`, `backend/app/schemas.py`

---

## Como rodar o projeto

```bash
cd Path_UFES
docker compose up --build
```

Após subir os containers, popular o banco:
```bash
docker compose exec backend python scripts/seed_db.py
```

- Frontend: http://localhost:5173
- Backend (API): http://localhost:8000
- Documentação da API: http://localhost:8000/docs

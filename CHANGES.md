# Mudanças — Frontend (sessão 2026-07-01)

Registro das alterações feitas nos arquivos **fora da pasta `backend/`** nesta sessão de desenvolvimento.

---

## Correções de bugs

### `frontend/src/styles/variables.css`
- Corrigido `--color-sucess` → `--color-success` (2 ocorrências, tema claro e escuro)
- Corrigido `rgba(...)` com 5 argumentos → 4 argumentos (4 ocorrências)

### `frontend/src/styles/Sidebar.module.css`
- Corrigido `width: 300` → `width: 300px`
- Corrigido `background-color: none` → `background: none`

### `frontend/src/styles/Home.module.css`
- Corrigido `baclground-color` → `background-color`

### `frontend/src/styles/About.module.css`
- Corrigido `min-width: 900px` → `max-width: 900px` (container principal)
- Corrigido `min-width: 700px` → `max-width: 700px` (`.text`)
- Corrigido `.github:hover` → `.githubLink:hover` (classe CSS inexistente)

### `frontend/src/styles/Navbar.module.css`
- Corrigido `var (--color-primary)` → `var(--color-primary)` (espaço inválido)

### `frontend/src/services/api.js`
- Corrigido `"application.json"` → `"application/json"` no header do método PUT

### `frontend/src/components/GrafoViewer.jsx`
- Corrigido typo "Clieque" → "Clique"
- Corrigido rótulo do botão "Adicionar Aresta" → "Adicionar Nó"
- Removido bloco de código comentado desnecessário

### `frontend/src/hooks/useGrafo.js`
- Removido `console.log("containerRef:", containerRef.current)` de debug

### `frontend/src/pages/About.jsx`
- Corrigido "ferrameta..." → frase descritiva completa
- Corrigido "informçãoes" → "informações" (2 ocorrências)
- Corrigido card do Daniel Sbrocco: nome estava no `devAvatar` e "Nome 2" no `devName`

### `frontend/src/pages/Home.jsx`
- Removido "----" do texto do botão "Visualizar Grafo"
- Corrigido "ennteda" → "entenda"

### `frontend/src/pages/Grafo.jsx`
- Corrigido "Carregie" → "Carregue"

---

## Novas funcionalidades

### `frontend/src/services/grafoService.js` — modificado
- `fetchGrafo(matricula = null)` aceita matrícula opcional e passa `?matricula=` ao backend
- Com matrícula, o backend devolve `status` por nó (cumprida/disponivel/bloqueada)

### `frontend/src/hooks/useGrafo.js` — reescrito
- Novo estado `matricula` (inicializado do `localStorage`)
- Após upload do PDF, o grafo recarrega automaticamente com a matrícula, sem clicar em "Carregar matérias"
- Matrícula salva no `localStorage` (chave `pathufes_matricula`) para reutilização na página de Trilha
- Estilos Cytoscape adicionados por status:
  - `node[status='cumprida']` → verde (`#10b981`)
  - `node[status='disponivel']` → azul/índigo (`#4f46e5`)
  - `node[status='bloqueada']` → cinza (`#94a3b8`)

### `frontend/src/services/trilhaService.js` — NOVO
- `fetchTrilha(matricula, semestre, maxDisc, diasBloqueados)` chama `GET /aluno/{matricula}/trilha`
- `diasBloqueados` passados como múltiplos query params

### `frontend/src/hooks/useTrilha.js` — NOVO
- Hook `useTrilha()` expõe `{ trilha, loading, erro, gerarTrilha }`

### `frontend/src/pages/Trilha.jsx` — NOVO
Página principal de planejamento acadêmico com:
- **Formulário de preferências**: matrícula, semestre de início, slider de max disciplinas, checkboxes de dias bloqueados
- **Visualização em tabela por semestre**: card por semestre com cabeçalho (semestre + tipo + créditos), tabela de disciplinas e seção de optativas disponíveis

### `frontend/src/styles/Trilha.module.css` — NOVO
Estilos da página: formulário em grid 2 colunas, cards de semestre, tabela, badges OB/OP.

### `frontend/src/App.jsx` — modificado
- Adicionada rota `/trilha` → `<Trilha />`

### `frontend/src/components/Navbar.jsx` — modificado
- Adicionado link "Trilha" entre "Grafo" e "About"

### `frontend/src/components/GrafoViewer.jsx` — modificado
- Adicionada legenda de cores: verde = Cursada, azul = Disponível, cinza = Bloqueada

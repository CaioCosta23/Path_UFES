# Mudanças — sessão 2026-07-02 (horários reais e tipo_semestre)

## Dados reais de horários por semestre

### `backend/scripts/seed/aulas.csv` — NOVO
- Arquivo CSV com 52 linhas de horários reais extraídos das grades de oferta dos
  departamentos DI, DMAT e DEE para o currículo CC 2022
- Colunas: `codigo`, `tipo_semestre` (IMPAR/PAR/AMBOS), `dias` (separados por `:`),
  `horarios` (separados por `:`)
- AMBOS é convertido para NULL no banco (aula ocorre nos dois semestres)
- Fonte: PDFs oficiais de oferta DI 2026/1 e 2025/2, DMAT 2026/1 e 2025/2, DEE 2026/1 e 2025/2

### `backend/app/models.py` — modificado
- Adicionado campo `tipo_semestre = Column(String(6), nullable=True)` na classe `Aula`
- NULL = ambos os semestres; 'IMPAR' = apenas 1º semestre; 'PAR' = apenas 2º semestre

### `backend/alembic/versions/d1e2f3a4b5c6_add_aula_tables.py` — corrigido
- Reescrito para usar SQL puro (`op.execute(sa.text(...))`) em vez de `op.create_table` com `sa.Enum`
- `CREATE TYPE IF NOT EXISTS` não é suportado pelo PostgreSQL; substituído por bloco `DO $$`
- Uso do `op.create_table` com `sa.Enum(create_type=False)` disparava evento interno do SQLAlchemy que recriava os tipos mesmo assim; SQL puro resolve o problema definitivamente

### `backend/alembic/versions/e2f3a4b5c6d7_add_tipo_semestre_to_aulas.py` — NOVO
- Migração Alembic que adiciona a coluna `tipo_semestre VARCHAR(6) NULLABLE` à tabela `aulas`
- Revisão: `e2f3a4b5c6d7` → revisa `d1e2f3a4b5c6`

### `backend/scripts/seed_db.py` — modificado
- Removido `_AULAS_SEED` (lista de dados fictícios)
- Adicionado `AULAS_CSV` apontando para `seed/aulas.csv`
- `seed_aulas()` reescrito: deleta todas as aulas existentes e relê o CSV, criando
  `Aula` com `tipo_semestre` correto para cada linha
- Correção: delete agora respeita a ordem das FKs — apaga `AulaHorario` e `AulaDia`
  antes de `Aula` para evitar `ForeignKeyViolation`

### `backend/app/routers/alunos.py` — modificado
- `_tem_conflito_horario()`: agora filtra aulas por `tipo_semestre` antes de verificar
  conflitos — aulas IMPAR são ignoradas em semestres PAR e vice-versa
- Montagem de `DisciplinaTrilha`: filtra `aulas` pelo `tipo` do semestre atual, de modo
  que apenas os horários corretos aparecem na resposta (sem misturar PAR e ÍMPAR)

### `backend/tests/test_alunos.py` — modificado
- Corrigido `test_trilha_restricao_horario_por_semestre_especifico`: removido
  `assert len(semestres) == 1` (o pós-loop de optativas pode criar semestres extras);
  substituído por asserções mais precisas sobre quais semestres aparecem
- Adicionado `test_trilha_completa_9_optativas_apos_obrigatorias`: verifica que após
  todas as obrigatórias, o pós-loop gera exatamente 9 placeholders de optativas

---

# Mudanças — sessão 2026-07-02 (atualização)

## Novas funcionalidades

### `frontend/src/pages/Trilha.jsx` — modificado
- Substituído o seletor de dias inteiros (checkboxes) por uma **grade visual de horários** (5 dias × 12 faixas, de 07h a 18h)
- Cada célula da grade é um botão clicável; ao ativar, envia o par `DIA:HORARIO` para o backend
- Botão "Limpar seleção" e contador de slots bloqueados
- Adicionada coluna **Horários** na tabela de disciplinas: exibe ex. "Seg/Qua 08-10h" para disciplinas com aulas cadastradas; "—" para as demais
- Resumo pós-geração exibe `optativas_faltantes` com a frase "Faltam N optativa(s) de 9 exigidas"

### `frontend/src/styles/Trilha.module.css` — modificado
- Adicionados estilos para a grade de horários: `.scheduleWrapper`, `.scheduleTable`, `.scheduleBtn`, `.scheduleBtnBlocked`, `.scheduleDia`, `.formGroupFull`
- Adicionado `.tdHorario` para a coluna de horários na tabela
- Adicionado `.resumoOpt` para a linha de optativas no resumo
- `.resumo` agora usa flexbox coluna para separar as duas linhas de resumo

### `frontend/src/services/trilhaService.js` — modificado
- Parâmetro `diasBloqueados` → `horariosBloqueados`; query param `dias_bloqueados` → `horarios_bloqueados` (formato `DIA:HORARIO`)

### `frontend/src/hooks/useTrilha.js` — modificado
- Parâmetro `gerarTrilha(..., diasBloqueados)` → `gerarTrilha(..., horariosBloqueados)`

---

## Correções e melhorias adicionais (mesma sessão)

### `frontend/src/pages/Trilha.jsx` — modificado
- Adicionado campo "Aplicar restrição apenas nestes semestres" (aparece ao selecionar slots bloqueados)
- Aceita lista de semestres separados por vírgula (ex: `2026/2, 2027/1`); em branco = todos os semestres
- `handleGerar` constrói o formato correto: `DIA:HORARIO` (global) ou `SEMESTRE:DIA:HORARIO` (específico)

### `frontend/src/styles/Trilha.module.css` — modificado
- Adicionado `.fieldHint` para texto de ajuda abaixo do campo de semestres

---

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

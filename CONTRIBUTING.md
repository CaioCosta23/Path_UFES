# Guia de Contribuição — PathUFES

Este guia cobre tudo que um desenvolvedor precisa para configurar o ambiente, entender o fluxo de trabalho e seguir as convenções do projeto.

---

## Pré-requisitos

| Ferramenta | Para que serve |
|---|---|
| [Docker](https://docs.docker.com/get-docker/) | Rodar o banco de dados PostgreSQL em container |
| [Python 3.12+](https://www.python.org/) | Backend FastAPI |
| [Node.js 20+](https://nodejs.org/) | Frontend React/Vite |
| [Git](https://git-scm.com/) | Versionamento |

---

## Configuração inicial

### 1. Clone o repositório

```bash
git clone https://github.com/CaioCosta23/Path_UFES.git
cd Path_UFES
```

### 2. Suba o banco de dados

O PostgreSQL roda em Docker. Você não precisa instalar o banco localmente.

```bash
docker compose up -d db
```

O que esse comando faz: baixa a imagem `postgres:16`, cria o volume de dados e sobe o container na porta `5432`. O banco `pathufes` é criado automaticamente.

Para verificar se está rodando:

```bash
docker compose ps
```

### 3. Configure o backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate      # Linux/macOS
# venv\Scripts\activate       # Windows
pip install -r requirements.txt
```

### 4. Crie as tabelas no banco (migration)

O Alembic versiona o schema do banco, igual o Git versiona o código. O arquivo de migration já existe em `backend/alembic/versions/`. Basta aplicar:

```bash
alembic upgrade head
```

O que esse comando faz: conecta no PostgreSQL e executa os SQLs de criação de todas as tabelas definidas nos models.

> Se o banco estiver vazio e você rodar `alembic upgrade head`, todas as tabelas são criadas do zero. Se o banco já tiver tabelas de uma versão anterior, o Alembic aplica apenas o que ainda não foi aplicado.

### 5. Configure o frontend

```bash
cd ../frontend
npm install
```

---

## Fluxo de desenvolvimento diário

### Backend

```bash
cd backend
source venv/bin/activate
```

Para rodar o servidor de desenvolvimento:

```bash
fastapi dev app/main.py
```

A API fica disponível em `http://localhost:8000`. A documentação interativa (Swagger) em `http://localhost:8000/docs`.

#### Quando mudar um model (alterar tabela no banco)

Toda mudança em `backend/app/models.py` que afete o banco precisa de uma migration:

```bash
# 1. Gera o arquivo de migration automaticamente
alembic revision --autogenerate -m "descricao_da_mudanca"

# 2. Aplica no banco
alembic upgrade head
```

O que o `--autogenerate` faz: compara os models Python com o estado atual do banco e gera o SQL de diferença. **Sempre revise o arquivo gerado em `alembic/versions/` antes de commitar** — o autogenerate pode perder casos como renomeação de coluna.

Para desfazer a última migration:

```bash
alembic downgrade -1
```

### Frontend

```bash
cd frontend
npm run dev
```

---

## Convenções de código

### Backend — docstrings Sphinx

Todo módulo, classe e função Python deve ter docstring no seguinte formato (usado pelo Sphinx para gerar documentação automaticamente):

```python
def funcao(param: str) -> list[dict]:
    """
    Descrição do que a função faz.

    :param param: Descrição do parâmetro.
    :type param: str
    :return: Descrição do retorno.
    :rtype: list[dict]
    """
```

### Estrutura do backend

```
backend/
├── app/
│   ├── database.py      # engine, SessionLocal, Base, get_db()
│   ├── models.py        # todos os models SQLAlchemy (inclui enum PeriodoOferta)
│   ├── schemas.py       # schemas Pydantic de entrada e saída de cada endpoint
│   └── routers/
│       ├── disciplinas.py   # GET /grafo
│       └── alunos.py        # POST /historico, POST /upload-pdf, GET /disponiveis, GET /trilha
├── alembic/
│   └── versions/        # arquivos de migration — commitar sempre
├── scripts/
│   ├── parse_historico.py   # parser do PDF de histórico do SIE
│   ├── parse_curriculo.py   # parser do PDF de currículo do SIE
│   ├── seed_db.py           # popula o banco com disciplinas, pré-requisitos e periodo_oferta
│   └── seed/
│       ├── disciplinas.csv      # grade curricular CC 2022 (commitar)
│       ├── prerequisitos.csv    # arestas do grafo (commitar)
│       ├── periodo_oferta.csv   # classificação PAR/ÍMPAR/AMBOS por disciplina (commitar)
│       ├── aulas.csv            # horários reais por semestre (commitar)
│       └── aluno_*.csv          # dados pessoais — NÃO commitar (.gitignore)
├── tests/
│   ├── conftest.py          # fixtures: db_session, client (SQLite em memória)
│   ├── test_disciplinas.py  # testes de GET /grafo
│   └── test_alunos.py       # testes de POST /historico e GET /disponiveis
└── requirements.txt
```

### Commits

Use mensagens descritivas em português ou inglês, no imperativo:

```
Adiciona router de disciplinas
Corrige query de pré-requisitos
Implementa algoritmo de ordenação topológica
```

---

## Testes

### Backend (Pytest)

```bash
cd backend
source venv/bin/activate
pytest
```

Os testes ficam em `backend/tests/`. Testes de rotas usam SQLite em memória para não depender do PostgreSQL rodando.

### Frontend (Vitest)

```bash
cd frontend
npm run test
```

---

## Gerando a documentação

### Backend (Sphinx)

```bash
cd docs
sphinx-build -b html source build
```

Abre `docs/build/html/index.html` no navegador para visualizar.

### Frontend (JSDoc)

```bash
cd frontend
npm run docs
```

---

## Estrutura do banco de dados

O banco segue o diagrama de classes em `docs/assets/diagrams/class/class_diagram-v1.pdf`.

| Tabela | O que armazena |
|---|---|
| `disciplinas` | Cada disciplina da grade (nó do grafo), incluindo `periodo_oferta` |
| `prerequisitos` | Pré-requisitos entre disciplinas (arestas do grafo) |
| `curriculos` | Versões da grade curricular (ex: CC 2022) |
| `curriculo_disciplinas` | Quais disciplinas pertencem a qual currículo |
| `alunos` | Dados cadastrais do estudante |
| `historicos` | CR e créditos totais do aluno |
| `historico_disciplinas` | Disciplinas aprovadas pelo aluno (nós visitados no grafo) |
| `aulas` | Blocos de horário de uma disciplina; inclui `tipo_semestre` (IMPAR/PAR/NULL=ambos) |
| `aula_dias` | Quais dias da semana uma Aula ocorre (enum `DiaSemana`: SEGUNDA…SEXTA) |
| `aula_horarios` | Quais faixas de horário uma Aula ocorre (enum `Horario`: H07_08…H18_19) |
| `alembic_version` | Controle interno do Alembic — não modificar |

O campo `periodo_oferta` na tabela `disciplinas` indica em qual tipo de semestre a disciplina costuma ser ofertada (`PAR`, `IMPAR` ou `AMBOS`). Esse dado foi gerado analisando 7 semestres de PDFs de ofertas dos departamentos DI, DMAT e DEE (2023/1 a 2026/1) e é usado pelo algoritmo de trilha para evitar agendar disciplinas em semestres em que não são oferecidas.

O campo `tipo_semestre` na tabela `aulas` indica em qual tipo de semestre **aquele horário específico** é praticado. Isso é necessário porque uma disciplina pode ter horários diferentes no semestre PAR e no ÍMPAR. Valores possíveis: `'IMPAR'`, `'PAR'` ou `NULL` (aplica-se a ambos). O arquivo fonte é `backend/scripts/seed/aulas.csv`, com o formato:

```
codigo,tipo_semestre,dias,horarios
INF15927,IMPAR,SEGUNDA,H15_16:H16_17
INF15927,IMPAR,QUINTA,H13_14:H14_15
INF15927,PAR,QUARTA:SEXTA,H11_12:H12_13
INF15974,AMBOS,SEGUNDA:QUARTA,H15_16:H16_17
```

- Dias e horários são separados por `:` dentro do campo; cada combinação (linha) gera um objeto `Aula` separado.
- `AMBOS` no CSV é salvo como `NULL` no banco (a aula vale para qualquer semestre).
- Disciplinas com horários diferentes por dia da semana precisam de uma linha por dia (ex: INF15927 acima).
- Fontes: PDFs de oferta DI 2026/1, DI 2025/2, DMAT 2026/1, DMAT 2025/2, DEE 2026/1, DEE 2025/2.
  Só são incluídas turmas exclusivas de CC (Curso 11) ou com escopo ≥ 2, e a carga horária deve
  coincidir com o que o currículo CC 2022 exige.

> **Atenção ao repovoar aulas**: `seed_aulas()` faz um delete total antes de reinserir. Como
> `aula_dias` e `aula_horarios` referenciam `aulas` via FK, o delete deve seguir a ordem
> `AulaHorario → AulaDia → Aula`. O ORM cascade **não** é disparado por deletes em massa via SQL;
> a ordem manual é obrigatória.

> **Migrations com tipos enum**: `CREATE TYPE IF NOT EXISTS` não existe no PostgreSQL para enums.
> Use um bloco `DO $$ BEGIN IF NOT EXISTS (...) THEN CREATE TYPE ...; END IF; END $$` no
> `op.execute(sa.text(...))`. Evite usar `op.create_table` com `sa.Enum` para tipos já criados
> manualmente — o SQLAlchemy dispara um evento interno que tenta recriar o tipo mesmo com
> `create_type=False`.

A classificação usa regras diferentes por tipo de disciplina:
- **Obrigatórias**: se a disciplina aparece em ≥ 2 semestres de um tipo e ≤ 1 do outro, é classificada pelo tipo dominante (a ocorrência isolada é considerada atípica)
- **Optativas**: só é classificada como PAR ou ÍMPAR se aparece em **100%** dos semestres daquele tipo disponíveis; caso contrário, fica como AMBOS (não restringe o aluno)

---

## Guia de arquivos do backend

Esta seção explica o propósito de cada arquivo do backend, como eles se relacionam e por que existem. Leia isso antes de mexer no código.

---

### `app/database.py` — Conexão com o banco

Cria o **engine** (o objeto que sabe como se conectar ao PostgreSQL), o **SessionLocal** (fábrica de sessões — cada requisição HTTP abre e fecha uma sessão) e o **Base** (classe-pai de todos os models).

A função `get_db()` é uma dependência do FastAPI: ela abre uma sessão no início de cada requisição e fecha no final, mesmo que ocorra um erro. Todos os routers recebem essa sessão via `Depends(get_db)`.

```
database.py  →  fornece Base e get_db()
    ↓                  ↓
models.py         routers/*.py
(herda Base)    (usa get_db via Depends)
```

---

### `app/models.py` — Tabelas do banco (SQLAlchemy ORM)

Define as tabelas do banco como classes Python. O SQLAlchemy traduz essas classes para SQL automaticamente. Cada atributo da classe vira uma coluna.

Arquivos de models têm três tipos de objetos:

- **Enums** (`TipoDisciplina`, `Departamento`, `PeriodoOferta`, `DiaSemana`, `Horario`): valores fixos que uma coluna pode ter
- **Tabelas associativas** (`prerequisitos`, `historico_disciplinas`, `curriculo_disciplinas`): implementam relacionamentos muitos-para-muitos com colunas extras
- **Classes mapeadas** (`Disciplina`, `Aluno`, `Historico`, `Curriculo`, `Aula`, `AulaDia`, `AulaHorario`): as entidades principais

A tabela `prerequisitos` é a mais importante: ela representa as **arestas do grafo**. Cada linha diz "a disciplina X exige a disciplina Y como pré-requisito". O campo `bloco` indica se é obrigatório (1) ou co-requisito (2).

As classes `Aula`, `AulaDia` e `AulaHorario` implementam o modelo do diagrama de classes do projeto. Cada `Aula` pertence a uma `Disciplina` e ocorre em um ou mais `DiaSemana` e `Horario`. Esse modelo é usado pelo filtro `horarios_bloqueados` do endpoint `GET /aluno/{matricula}/trilha`: disciplinas cujo horário conflita com algum par `DIA:HORARIO` bloqueado pelo aluno são excluídas da trilha. O conflito ocorre quando o dia **e** o horário bloqueados pertencem à mesma `Aula`. Disciplinas sem aulas cadastradas nunca são filtradas.

---

### `app/schemas.py` — Contratos da API (Pydantic)

Define o formato exato de dados que a API aceita e retorna. Separado dos models por uma razão importante: **o que o banco armazena nem sempre é igual ao que a API expõe**.

Por exemplo, o banco tem `tipo_disciplina` como enum Python, mas a API retorna a string `"OB"` ou `"OP"`. O schema faz essa conversão.

Cada endpoint tem pelo menos um schema de entrada e um de saída:

| Endpoint | Schema de entrada | Schema de saída |
|---|---|---|
| `GET /grafo` | — | `GrafoResponse` |
| `POST /aluno/historico` | `HistoricoInput` | `HistoricoResponse` |
| `POST /aluno/upload-pdf` | `UploadFile` (multipart) | `UploadPdfResponse` |
| `GET /aluno/{matricula}/disponiveis` | — | `list[DisciplinaDisponivel]` |
| `GET /aluno/{matricula}/trilha` | — | `TrilhaResponse` |

**`NoDisciplina`** (nó do `GET /grafo`) possui o campo opcional `status`, preenchido apenas quando a rota recebe `?matricula=`. Os valores possíveis são `"cumprida"`, `"disponivel"` ou `"bloqueada"`, permitindo que o frontend colore os nós de acordo com o progresso do aluno.

**`UploadPdfResponse`** é retornado pelo `POST /aluno/upload-pdf` e contém `matricula`, `nome` e `disciplinas_importadas` — o suficiente para o frontend identificar o aluno sem precisar de uma rota separada de consulta.

Os schemas de trilha merecem atenção especial:

- **`AulaInfo`**: horário de um bloco de aula — lista de `dias` (valores de `DiaSemana`) e `horarios` (valores de `Horario`).
- **`DisciplinaTrilha`**: representa uma entrada em um semestre da trilha. Obrigatórias têm `codigo` e `nome` reais e incluem `aulas: list[AulaInfo]` com os horários cadastrados. Optativas aparecem como placeholders com `codigo=None` e `nome="Optativa01"`, `"Optativa02"` etc. — só são gerados até o limite de `OPTATIVAS_EXIGIDAS - aprovadas`.
- **`OptativaPrevista`**: optativa que provavelmente será ofertada em determinado semestre (baseada no campo `periodo_oferta`). Listada separadamente para que o aluno escolha qual colocar no lugar do placeholder.
- **`SemestreTrilha`**: agrupa um semestre completo — nome (`"2027/1"`), tipo (`"PAR"` ou `"IMPAR"`), a lista de disciplinas/placeholders e as optativas previstas.
- **`TrilhaResponse`**: resposta final com matrícula, lista de semestres e `optativas_faltantes` (quantas optativas o aluno ainda precisa cursar, considerando as 9 exigidas pelo currículo).

---

### `app/main.py` — Ponto de entrada da API

Cria a instância do FastAPI, configura o **CORS** e registra os routers.

**CORS** (Cross-Origin Resource Sharing): o navegador bloqueia por segurança requisições de um domínio para outro. Como o frontend React roda em `localhost:5173` e a API em `localhost:8000`, o CORS precisa ser liberado explicitamente. Em produção, substituir pelo domínio real.

---

### `app/routers/disciplinas.py` — Rota `GET /grafo`

Busca todas as disciplinas e todos os pré-requisitos do banco e retorna no formato `{ "nos": [...], "arestas": [...] }`, que o Cytoscape.js usa diretamente para renderizar o grafo no frontend.

Aceita o parâmetro opcional `?matricula=`. Quando informado, cada nó recebe o campo `status`:

| status | condição |
|---|---|
| `"cumprida"` | Disciplina consta no histórico aprovado do aluno |
| `"disponivel"` | Todos os pré-requisitos foram cumpridos, disciplina ainda não aprovada |
| `"bloqueada"` | Algum pré-requisito ainda pendente |

Sem o parâmetro, `status` retorna `null` e o comportamento é idêntico ao original.

---

### `app/routers/alunos.py` — Rotas de aluno

Contém três endpoints:

**`POST /aluno/upload-pdf`**: recebe o PDF do histórico parcial do SIE/UFES diretamente via `multipart/form-data`. Usa `pdfplumber` para extrair o texto do PDF e dois helpers internos (`_parse_aluno_pdf`, `_parse_historico_pdf`) para identificar a matrícula, nome e as disciplinas aprovadas (situação `AP`). Em seguida, chama internamente a mesma lógica do `POST /aluno/historico` para salvar os dados. Retorna `{ matricula, nome, disciplinas_importadas }`. Erros de leitura retornam 400; PDF sem matrícula retorna 422.

**`POST /aluno/historico`**: recebe os dados do aluno e disciplinas aprovadas em JSON e salva no banco. Cria o aluno e o histórico se não existirem, ou atualiza se já existirem. Disciplinas com códigos que não existem na grade são ignoradas silenciosamente.

**`GET /aluno/{matricula}/disponiveis`**: para cada disciplina da grade ainda não aprovada, verifica se todos os pré-requisitos estão no histórico do aluno. As disponíveis são ordenadas por período sugerido.

**`GET /aluno/{matricula}/trilha`**: gera a trilha acadêmica otimizada para o aluno concluir o curso no menor número de semestres. Recebe os seguintes parâmetros via query string:
- `semestre_inicio` (obrigatório): semestre a partir do qual planejar, ex: `"2026/2"`
- `max_disciplinas` (opcional, padrão 5): quantas disciplinas por semestre (1–10)
- `horarios_bloqueados` (opcional, lista, padrão vazio): aceita dois formatos:
  - `"DIA:HORARIO"` — restrição **global**, aplica-se a todos os semestres (ex.: `SEGUNDA:H08_09`)
  - `"SEMESTRE:DIA:HORARIO"` — restrição **por semestre**, aplica-se somente ao semestre indicado (ex.: `2026/2:SEGUNDA:H08_09`)
  
  O conflito ocorre quando o dia **e** o horário bloqueados pertencem à mesma `Aula`. Pode ser passado múltiplas vezes: `?horarios_bloqueados=2026/2:SEGUNDA:H08_09&horarios_bloqueados=SEXTA:H14_15`

O algoritmo usa o **método do caminho crítico em calendário**:

1. Carrega as disciplinas obrigatórias ainda não aprovadas como nós pendentes
2. A cada semestre, filtra as disciplinas cujos pré-requisitos já foram cumpridos (aprovados no histórico ou agendados em semestres anteriores) **e** cuja oferta é compatível com o tipo do semestre (PAR/ÍMPAR/AMBOS)
3. Ordena as disponíveis pela sua **profundidade de calendário** — quantos semestres são necessários para concluir toda a cadeia de dependências abaixo delas, incluindo penalidade de +1 semestre quando um sucessor tem restrição PAR/ÍMPAR incompatível com o semestre seguinte natural
4. Agenda as `max_disciplinas` com maior profundidade (as que mais atrasam o curso se postergadas)
5. Adiciona as disciplinas agendadas ao conjunto de "cumpridas", desbloqueando os pré-requisitos dos semestres seguintes
6. Preenche os slots restantes com placeholders de optativas e lista as optativas prováveis para aquele semestre
7. Repete até esgotar as obrigatórias (limite: 20 semestres, 40 iterações)

> **Por que não basta ordenar por `periodo_sugerido`?** Porque uma disciplina com poucos sucessores pode ter `periodo_sugerido` menor que outra cujos sucessores têm restrições PAR/ÍMPAR que forçariam esperas extras de semestre. O caminho crítico em calendário considera esse custo real.

A constante `OPTATIVAS_EXIGIDAS = 9` define o total de optativas exigidas pelo currículo CC/UFES. O algoritmo conta as optativas já aprovadas no histórico e só gera placeholders até o limite restante.

As funções auxiliares `_proximo_semestre`, `_tipo_semestre`, `_compativel`, `_profundidade_calendario` e `_tem_conflito_horario` ficam no mesmo arquivo, fora do router, por serem lógica pura sem efeitos colaterais. A função `_tem_conflito_horario(disc, horarios_bloqueados, semestre_atual)` verifica se alguma `Aula` da disciplina conflita com algum par bloqueado no semestre em questão, suportando restrições globais (`DIA:HORARIO`) e por semestre (`SEMESTRE:DIA:HORARIO`).

---

### `scripts/parse_historico.py` — Parser do PDF de histórico

Recebe o PDF do histórico parcial do SIE/UFES e extrai dois tipos de dado:
- Dados cadastrais do aluno (matrícula, nome, CR)
- Disciplinas com situação AP (Aprovado), com média e semestre

Gera dois CSVs: `aluno_<matricula>.csv` e `historico_<matricula>.csv`. Esses arquivos são pessoais e **não devem ser commitados** (já estão no `.gitignore`).

> A lógica de parsing deste script foi reaproveitada dentro do endpoint `POST /aluno/upload-pdf` (em `app/routers/alunos.py`), que faz o mesmo trabalho diretamente via API sem precisar gerar os CSVs intermediários.

---

### `scripts/parse_curriculo.py` — Parser do PDF de currículo

Recebe o PDF do currículo do curso do SIE/UFES e extrai:
- Todas as disciplinas com código, nome, créditos, tipo e período sugerido
- Todos os pré-requisitos entre disciplinas (com bloco)

Gera `disciplinas.csv` e `prerequisitos.csv`, que ficam em `scripts/seed/` e **são commitados** — são os dados públicos da grade curricular.

---

### `scripts/seed_db.py` — Popula o banco com o currículo

Lê `disciplinas.csv`, `prerequisitos.csv` e `periodo_oferta.csv` e insere/atualiza os dados no PostgreSQL via SQLAlchemy. Seguro para rodar múltiplas vezes: registros já existentes são ignorados ou atualizados (`ON CONFLICT DO NOTHING`).

Deve ser rodado uma vez após aplicar as migrations (`alembic upgrade head`).

---

### `scripts/seed/periodo_oferta.csv` — Classificação de oferta por semestre

Arquivo CSV com duas colunas (`codigo`, `periodo_oferta`) que classifica cada disciplina da grade em `PAR`, `IMPAR` ou `AMBOS`.

Gerado pela análise de PDFs de ofertas dos departamentos DI, DMAT e DEE de 7 semestres (2023/1 a 2026/1). A metodologia está documentada na seção "Banco de dados" acima. **Não edite manualmente** — reprocesse os PDFs se houver novos dados.

---

---

### `alembic/` — Versionamento do banco

Pasta criada e gerenciada pelo Alembic. Os arquivos dentro de `alembic/versions/` são o histórico de mudanças no schema do banco — equivalente ao `git log` do código.

- `alembic.ini`: configurações gerais (URL do banco, localização dos scripts)
- `alembic/env.py`: script que conecta o Alembic aos nossos models
- `alembic/versions/`: cada arquivo é uma migration (uma versão do banco)

**Nunca edite os arquivos de `versions/` manualmente.** Sempre use `alembic revision --autogenerate`.

---

### `tests/conftest.py` — Infraestrutura de testes

Arquivo especial do Pytest que define **fixtures** — funções que preparam recursos antes dos testes e os limpam depois.

As duas fixtures principais:

- **`db_session`**: cria um banco SQLite em memória, cria todas as tabelas, e destrói tudo ao final do teste. Cada teste começa com banco limpo.
- **`client`**: substitui o banco real (PostgreSQL) pelo banco de teste (SQLite) usando `dependency_overrides` do FastAPI, e retorna um cliente HTTP que chama os endpoints sem abrir porta de rede.

O `StaticPool` é necessário porque o SQLite em memória cria um banco diferente por conexão. Com `StaticPool`, todas as sessões compartilham a mesma conexão e enxergam as mesmas tabelas.

---

### `tests/test_disciplinas.py` e `tests/test_alunos.py` — Testes

Cada arquivo testa um router. Cada função que começa com `test_` é um teste independente.

O padrão seguido em todos os testes é o **AAA**:
1. **Arrange** (preparar): insere os dados necessários no banco de teste
2. **Act** (agir): chama o endpoint via `client.get()` ou `client.post()`
3. **Assert** (verificar): checa o status HTTP e o conteúdo da resposta

**`test_alunos.py`** cobre: `POST /aluno/historico` (3 casos), `POST /aluno/upload-pdf` (3 casos), `GET /aluno/{matricula}/disponiveis` (4 casos), `GET /aluno/{matricula}/trilha` (4 casos PAR/ÍMPAR e caminho crítico) e filtro `horarios_bloqueados` (5 casos: conflito exclui; sem aulas nunca filtrada; mesmo dia hora diferente não exclui; `optativas_faltantes` descontadas; restrição por semestre específico libera a disciplina no semestre seguinte).

**`test_disciplinas.py`** cobre: `GET /grafo` sem matrícula e com matrícula (3 casos de status).

Total: **23 testes**, todos passando.

---

---

## Guia de arquivos do frontend

O frontend é uma SPA (Single Page Application) em React + Vite. Os arquivos seguem a estrutura:

```
frontend/src/
├── App.jsx              # roteador raiz (BrowserRouter + Routes)
├── main.jsx             # ponto de entrada do Vite
├── components/
│   ├── Navbar.jsx       # barra de navegação com links e toggle de tema
│   ├── GrafoViewer.jsx  # visualização Cytoscape + controles do grafo
│   └── Sidebar.jsx      # painel lateral com detalhes do elemento selecionado
├── hooks/
│   ├── useGrafo.js      # estado e lógica do grafo (Cytoscape, matrícula, upload)
│   ├── useTrilha.js     # estado e lógica da trilha acadêmica
│   └── useTheme.js      # toggle de tema claro/escuro
├── pages/
│   ├── Home.jsx         # página inicial com cards de funcionalidades
│   ├── Grafo.jsx        # página /grafo: envolve GrafoViewer
│   ├── Trilha.jsx       # página /trilha: formulário + tabela de semestres
│   └── About.jsx        # página /about: equipe e descrição do projeto
├── services/
│   ├── api.js           # wrapper HTTP (get, post, postFile, put, delete)
│   ├── grafoService.js  # fetchGrafo(matricula?), uploadPdf(file)
│   └── trilhaService.js # fetchTrilha(matricula, semestre, maxDisc, horariosBloqueados)
└── styles/
    ├── variables.css    # CSS custom properties (cores, espaçamento, tipografia)
    ├── global.css       # reset e estilos globais
    ├── Grafo.module.css
    ├── GrafoViewer.module.css
    ├── Home.module.css
    ├── About.module.css
    ├── Navbar.module.css
    ├── Sidebar.module.css
    └── Trilha.module.css
```

### Fluxo principal do usuário

1. **Upload do PDF** (`GrafoViewer` → `useGrafo.carregarDePdf`):
   - Envia o PDF ao backend via `POST /aluno/upload-pdf`
   - Backend retorna `{ matricula, nome, disciplinas_importadas }`
   - Matrícula salva no `localStorage` (chave `pathufes_matricula`)
   - Grafo recarregado automaticamente via `GET /grafo?matricula=` — nós coloridos por status

2. **Visualização do grafo** (`/grafo`):
   - Verde = disciplina já cursada (`cumprida`)
   - Azul = disponível para cursar agora (`disponivel`)
   - Cinza = bloqueada por pré-requisito pendente (`bloqueada`)

3. **Trilha acadêmica** (`/trilha`):
   - Formulário pré-preenche a matrícula do `localStorage`
   - Aluno configura: semestre de início, máx. disciplinas e grade visual de horários bloqueados (5 dias × 12 faixas)
   - Backend calcula a trilha via `GET /aluno/{matricula}/trilha`
   - Resultado exibido em tabela por semestre com colunas: Código, Disciplina, Créd., Horários, Tipo
   - Resumo mostra quantas optativas ainda faltam (`optativas_faltantes` da resposta)

### Convenção de estilos

- Todos os componentes usam **CSS Modules** (`import styles from "../styles/X.module.css"`)
- Nomes de classes no arquivo CSS devem coincidir exatamente com os usados no JSX
- Variáveis CSS globais definidas em `variables.css` — não use valores hardcoded de cor ou espaçamento

---

## Dúvidas frequentes

**O banco não conecta.**
Verifique se o container está rodando: `docker compose ps`. Se o status não for `Up`, rode `docker compose up -d db`.

**`alembic upgrade head` dá erro de conexão.**
O container do banco precisa estar rodando antes de qualquer comando Alembic.

**Adicionei um campo no model mas a coluna não aparece no banco.**
Você precisa gerar e aplicar uma migration: `alembic revision --autogenerate -m "..."` seguido de `alembic upgrade head`.

**Como populo o banco com os dados do currículo?**
Rode o script de seed: `python scripts/seed_db.py` (após configurar o ambiente e aplicar as migrations).

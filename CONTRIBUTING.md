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
│   ├── models.py        # todos os models SQLAlchemy
│   └── routers/         # um arquivo por grupo de endpoints (ex: disciplinas.py, alunos.py)
├── alembic/
│   └── versions/        # arquivos de migration — commitar sempre
├── scripts/
│   ├── parse_historico.py   # parser do PDF de histórico do SIGAA
│   ├── parse_curriculo.py   # parser do PDF de currículo do SIGAA
│   └── seed/
│       ├── disciplinas.csv      # grade curricular CC 2022 (commitar)
│       ├── prerequisitos.csv    # arestas do grafo (commitar)
│       └── aluno_*.csv          # dados pessoais — NÃO commitar (.gitignore)
├── main.py              # instância FastAPI, registra routers
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
| `disciplinas` | Cada disciplina da grade (nó do grafo) |
| `prerequisitos` | Pré-requisitos entre disciplinas (arestas do grafo) |
| `curriculos` | Versões da grade curricular (ex: CC 2022) |
| `curriculo_disciplinas` | Quais disciplinas pertencem a qual currículo |
| `alunos` | Dados cadastrais do estudante |
| `historicos` | CR e créditos totais do aluno |
| `historico_disciplinas` | Disciplinas aprovadas pelo aluno (nós visitados no grafo) |
| `alembic_version` | Controle interno do Alembic — não modificar |

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

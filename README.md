# Path UFES :runner::books:

O _Path UFES_ é um sistema de gerenciamento e planejamento acadêmico baseado em análise de grafos e pré-requisitos de grade curricular,
voltado inicialmente, para alunos do curso de Ciência da Computação da Universidade Federal do Espírito Santo (UFES).

Este projeto visa, através da análise de algoritimos (baseada na estrutura de grafos), indicar qual o melhor caminho para que o aluno possa se formar,
da maneira mais rápida, tranquila e eficiente.

Para mais detalhes, acesse [aqui](docs/proposta_pathufes-CaioCosta_DanielSbrocco_MiguelMurad.pdf) nossa proposta de projeto completa.

---

## Funcionalidades :gear:

- Sugerir quais matérias cursar em semestres posteriores
- Organizar grade de horário do estudante
- Criar sugestão de trilha para quais matérias cursar nos próximos semestres

---

## Tecnologias :computer:

- **Prototipação :pencil2:**

    ![Figma](https://img.shields.io/badge/Figma-F24E1E?style=for-the-badge&logo=figma&logoColor=white)

- **Documentação :open_file_folder:**

    ![UML](https://img.shields.io/badge/Uml-FABD14?style=for-the-badge&logo=uml&logoColor=white)
    ![Sphinx](https://img.shields.io/badge/Sphinx-black?style=for-the-badge&logo=sphinx&logoColor=white)
    ![Swagger](https://img.shields.io/badge/Swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)

- **Infraestrutura :bricks:**

    ![Docker](https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white)
    ![npm](https://img.shields.io/badge/Npm-CB3837?style=for-the-badge&logo=npm&logoColor=white)
    ![Yarn](https://img.shields.io/badge/Yarn-2C8EBB?style=for-the-badge&logo=yarn&logoColor=white)
    ![Node.Js](https://img.shields.io/badge/NodeJS-5FA04E?style=for-the-badge&logo=nodedotjs&logoColor=white)

- **Frameworks :wrench:**

    ![Vite](https://img.shields.io/badge/Vite-9135FF?style=for-the-badge&logo=vite&logoColor=white)
    ![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
    ![Bootsrap](https://img.shields.io/badge/Bootstrap-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white)
    ![Cytoscape.js](https://img.shields.io/badge/CytoscapeJS-F7DF1E?style=for-the-badge&logo=cytoscapedotjs&logoColor=black)

- **Front-End :iphone:**

    ![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
    ![CSS](https://img.shields.io/badge/CSS-663399?style=for-the-badge&logo=css&logoColor=white)
    ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
    ![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)

- **Back-End :nut_and_bolt:**

    ![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=yellow)
    ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
    ![JSON](https://img.shields.io/badge/JSON-black?style=for-the-badge&logo=json&logoColor=white)
    ![GNU Bash](https://img.shields.io/badge/GnuBash-4EAA25?style=for-the-badge&logo=gnubash&logoColor=white)

- **Testes :bookmark_tabs:**

    ![Pytest](https://img.shields.io/badge/Pytest-0A9EDC?style=for-the-badge&logo=pytest&logoColor=white)
    ![Vitest](https://img.shields.io/badge/Vitest-00FF74?style=for-the-badge&logo=vitest&logoColor=yellow)

- **Versionamento :arrow_right:**

    ![Git](https://img.shields.io/badge/Git-F03C2E?style=for-the-badge&logo=git&logoColor=white)
    ![Github](https://img.shields.io/badge/Github-white?style=for-the-badge&logo=github&logoColor=181717)

---

### :page_facing_up: Descrição e Uso de Ferramentas

- Prototipação:
  - Figma: ferramenta de design de interfaces, prototipação e colaboração online, utilizada para a prototipação (de baixo nível) do projeto;
  
- Documentação:
  - UML (_Unfield Modeling Language_): linguagem de visual padronizada, utilizada para documentação e modelagem de projetos de sistemas de software. Neste projeto, a ferramenta a ser utilizada para a modelagem dos diagramas (de classes) desse sistema será o **Astah**, devido a sua versatilidade e fácilidade de uso;

  - Sphinx: Ferramenta de gerção automática de documentação de código, sendo muito utilizado para frameworks, APIs, bibliotecas python (junto as DOCSTRINGS - tipo de documentação de código a ser utilizada), entre outros.
  
  - Swagger: Conjunto de ferramentas e especificações utilizadas para documentar, testar e visualizar as APIs (REST - inclusive os chamados "_endpoits_").

- Infraestrutura:
  - Docker: plataforma que permitirá empacotar, distribuir e executar a aplicação em ambientes isolados (chamados _containers_). Isso permite que a aplicação execute as mesmas bibliotecas, depêndencias e configurações (conceito do que contém um _container_), independente do sistema operacional, ou servidor em que esteja rodando.
  
  - Node.Js: ambiente de execução ("_runtime_") que permite executar códigos em JavaScript fora do navegador (utilizado para desenvolvimento _Back-end_).
  
  - npm: Gerenciador de pacotes (conjunto de códigos reutilizáveis para resolver problemas específicos), padrão do ambiente de execução do Node.Js, utilizado para instalar, atualizar, remover e gerenciar pacotes em JavaScript usados no _Back-end_.

  - yarn: Gerenciador de pacotes Javascript que tem a mesma função do npm.

- Frameworks:
  - Vite: ferramenta de _build_ e servidor de desenvolvimento para aplicações web modernas, utilizado para empacotar e servir o _Front-end_ da aplicação com _Hot Module Replacement_ (HMR) rápido;

  - FastAPI: _framework_ web em Python para a construção de APIs _REST_ de alto desempenho, utilizado no desenvolvimento do _Back-end_ da aplicação. Possui validação automática de dados (via Pydantic) e geração automática de documentação interativa;

  - Bootstrap: _framework_ de _CSS_ que fornece um conjunto de componentes prontos (botões, formulários, _modais_, sistema de _grid_) e classes utilitárias responsivas, utilizado para estilizar e padronizar a interface do _Front-end_;

  - Cytoscape.js: biblioteca _JavaScript_ especializada na visualização e análise de grafos no navegador, utilizada para renderizar de forma interativa e organizada o grafo de disciplinas e pré-requisitos da grade curricular.

- Front-end:
  - HTML5: linguagem de marcação padrão para a estruturação de páginas web, responsável pela definição do conteúdo semântico (cabeçalhos, seções, formulários, listas, entre outros) exibido no navegador;

  - CSS (_Cascading Style Sheets_): linguagem de estilização utilizada para definir a aparência visual das páginas web (cores, fontes, _layout_, espaçamento, animações e responsividade);

  - JavaScript: linguagem de programação executada no navegador, utilizada para adicionar interatividade e dinamismo ao _Front-end_ da aplicação (manipulação de elementos, requisições assíncronas, tratamento de eventos);

  - React: biblioteca _JavaScript_ para a construção de interfaces de usuário baseadas em componentes reutilizáveis e reativos, utilizada para implementar as telas interativas do _Front-end_.

- Back-end:
  - Python: linguagem de programação de alto nível, utilizada no desenvolvimento da lógica de _back-end_ da aplicação, incluindo os algoritimos de análise de grafos e pré-requisitos da grade curricular;

  - PostgreSQL: sistema de gerenciamento de banco de dados relacional (_SGBD_), utilizado para o armazenamento e a manipulação dos dados da aplicação (como informações de alunos, disciplinas e grades curriculares);

  - JSON (_JavaScript Object Notation_): formato leve de troca de dados, utilizado para a comunicação entre o _Front-end_ e o _Back-end_ da aplicação (através das requisições e respostas da API);

  - GNU Bash: interpretador de linha de comando (_shell_), utilizado para a automação de tarefas e execução de _scripts_ no ambiente de desenvolvimento e produção da aplicação.

- Testes:
  - Pytest: _framework_ de testes para a linguagem Python, utilizado para a escrita e execução dos testes automatizados do _Back-end_ da aplicação;

  - Vitest: _framework_ de testes voltado para aplicações que utilizam Vite, utilizado para a escrita e execução dos testes automatizados do _Front-end_ da aplicação.

- Versionamento:
  - Git: sistema de controle de versão distribuído, utilizado para o gerenciamento do histórico de alterações do código-fonte da aplicação;

  - GitHub: plataforma de hospedagem de repositórios baseada em Git, utilizada para o armazenamento remoto do código, colaboração entre a equipe e gerenciamento de _pull requests_ e _issues_ do projeto.
  
Para mais informações sobre (uso e como instalar) cada ferramenta, visite as [referências](#referências-link) do repositório.

---

## Arquitetura e Diagramação de Projeto :building_construction:

Uma vez que o projeto será uma produção baseada no paradigma orientado à objetos, foi realizada a cosntrução de alguns diagramas foram necessários, sendo esses encontrados de maineira mais clara na pasta de [documentação](docs/assets/diagrams), onde estará disponível o diagrama de [classes](docs/assets//diagrams/class/class_diagram-v1.pdf).

---

## Pré-requisitos :white_check_mark:

- [Docker](https://docs.docker.com/get-docker/) >= 24
- [Docker Compose](https://docs.docker.com/compose/) >= 2.20

> **Linux:** após instalar o Docker, adicione seu usuário ao grupo `docker` para não precisar de `sudo` a cada comando:
> ```bash
> sudo usermod -aG docker $USER
> newgrp docker
> ```
> Isso é feito uma única vez na máquina.

---

## Instalação e Execução da Aplicação :arrow_forward:

Clone o repositório:

```GnuBash
git clone https://github.com/CaioCosta23/Path_UFES.git
cd Path_UFES
```

Suba os serviços (banco de dados, backend e frontend):

```GnuBash
docker compose up --build
```

> Na primeira execução o `--build` é obrigatório para construir as imagens. Nas execuções seguintes, `docker compose up` já é suficiente.
>
> O container do backend aguarda o banco subir, aplica as migrations e popula o banco automaticamente antes de iniciar a API.

Após subir, acesse:

- Frontend: `http://localhost:5173`
- API (backend): `http://localhost:8000`
- Swagger UI: `http://localhost:8000/docs`

Para parar os serviços:

```GnuBash
docker compose down
```

---

## Testes :test_tube:

Com os containers rodando (`docker compose up`), execute os testes em outro terminal:

**Backend:**

```GnuBash
docker compose exec backend pytest tests/
```

**Frontend:**

```GnuBash
docker compose exec frontend npm run test
```

---

## Gerando a Documentação :books:

- **Documentação do código - Back-end (Sphinx):**

    Crie e ative o ambiente virtual Python dentro da pasta `backend`, instale as dependências e gere a documentação:

    ```GnuBash
    cd backend
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    cd ../docs
    sphinx-build -b html source build
    ```

    Abra o arquivo `docs/build/index.html` no navegador para visualizar a documentação.

    > :bulb: Para sair do ambiente virtual após terminar, basta rodar `deactivate` no terminal.

- **Documentação do código - Front-end:**

    A documentação do _Front-end_ é gerada através do seguinte comando, executado na pasta do _Front-end_:

    ```GnuBash
    cd frontend
    npm install
    npm run docs
    ```

- **Documentação da API (Swagger):**

    Como o _Back-end_ é construído com FastAPI, a documentação interativa da API é gerada automaticamente e fica disponível assim que a aplicação está rodando, nos endereços:

  - Swagger UI: `http://localhost:8000/docs`
  - Redoc: `http://localhost:8000/redoc`

---

## Referências :link:

- Sites: [Figma](https://figma.com), [Astah](https://astah.net)
- Documentações oficiais: [UML](https://www.omg.org/uml/), [Sphinx](https://www.sphinx-doc.org/pt-br/master/), [Swagger](https://swagger.io/docs/), [Docker](https://docs.docker.com/), [NodeJs](https://nodejs.org/docs/latest/api/), [npm](https://docs.npmjs.com/), [yarn](https://classic.yarnpkg.com/lang/en/docs/), [Vite](https://pt.vite.dev/guide/), [FastAPI](https://fastapi.tiangolo.com/), [Bootstrap](https://getbootstrap.com/docs/4.1/getting-started/introduction/), [Thymeleaf](https://www.thymeleaf.org/documentation.html), [Cytoscape.Js](https://cytoscape.org/documentation_developers.html), [HTML5](https://html.spec.whatwg.org/), [CSS](https://developer.mozilla.org/pt-BR/docs/Web/CSS), [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript), [React](https://pt-br.react.dev/), [Python](https://docs.python.org/pt-br/3/), [PostegreSQL](https://www.postgresql.org/docs/), [JSON](https://www.json.org/json-pt.html), [GNUBash](https://www.gnu.org/savannah-checkouts/gnu/bash/manual/bash.html), [Pytest](https://docs.pytest.org/en/stable/), [Vitest](https://vitest.dev/guide/), [Git](https://git-scm.com/docs/git/pt_BR), [GitHub](https://docs.github.com/pt)

---

## Contrubuição :handshake:

- Para ser um colaborador do nosso projeto, siga os seguintes passos:

    1. Faça um _fork_
    2. Crie uma _branch_
    3. Faça _commit_ das alterações
    4. Abra um _pull request_

---

## Autores :man_technologist:

- Caio Costa Lopes
- Daniel Olimpio Sbrocco
- Miguel Zon Murad

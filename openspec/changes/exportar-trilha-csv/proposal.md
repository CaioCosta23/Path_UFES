# Proposal

## Why

Hoje o aluno só consegue ver a trilha acadêmica gerada na tela. Não há como guardar o resultado, abrir numa planilha ou compartilhar. Exportar a trilha em CSV resolve isso. Como a página já tem a trilha calculada em memória, o arquivo pode ser gerado sem recalcular nada e sem mudar a API.

## What Changes

- Novo botão "Baixar CSV" na página Trilha, visível apenas depois que uma trilha foi gerada.
- O CSV é montado no navegador a partir do mesmo objeto `trilha` que a página renderiza. Por isso reflete exatamente os parâmetros da última geração (semestre de início, máximo de disciplinas, horários bloqueados).
- Uma linha por disciplina agendada (obrigatórias e placeholders de optativas), com as colunas: Semestre, Período, Código, Disciplina, Créditos, Horários, Tipo.
- Formato compatível com Excel em pt-BR: separador `;`, UTF-8 com BOM e escape de campos.
- A formatação de horários (`formatarAulas`) sai da página e passa a ser compartilhada entre a tabela e o CSV.
- Fora do escopo:
  - mudanças no backend;
  - incluir `optativas_previstas` no CSV;
  - refatorar o cálculo da trilha no backend.

## Capabilities

### New Capabilities
- `exportacao-trilha`: exportação da trilha acadêmica exibida ao aluno para um arquivo (formato, conteúdo, nome do arquivo e disponibilidade na interface).

### Modified Capabilities

## Impact

- `frontend/src/pages/Trilha.jsx`: botão de download; `formatarAulas` passa a vir do util compartilhado.
- Novo `frontend/src/utils/` com a formatação de aulas e a geração/download do CSV.
- Testes vitest: novo teste do util e caso adicional em `frontend/src/tests/pages/Trilha.test.jsx`.
- Backend, API e dependências: sem alterações.

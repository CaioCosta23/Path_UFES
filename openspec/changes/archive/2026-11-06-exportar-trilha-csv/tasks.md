# Tasks

## 1. Formatação de horários compartilhada

- [x] 1.1 Criar `frontend/src/utils/trilhaFormat.js` e mover para ele `formatarAulas`, `DIA_LABELS` e um rótulo de período (`PAR`→"Par", `IMPAR`→"Ímpar") de `frontend/src/pages/Trilha.jsx`, com comentários JSDoc no padrão do projeto. Fazer a página importar dali. Verificar que `npx vitest run src/tests/pages/Trilha.test.jsx` continua passando sem alterações no teste.
- [x] 1.2 Criar `frontend/src/tests/utils/trilhaFormat.test.js`, cobrindo aulas vazias (`null`), um bloco ("Seg 07-09h") e múltiplos blocos/dias ("Seg/Qua 07-09h, Sex 10-12h"). Verificar com `npx vitest run src/tests/utils`.

## 2. Geração do CSV

- [x] 2.1 Criar `frontend/src/utils/trilhaCsv.js` com `trilhaParaCsv(trilha)`, que produz cabeçalho e uma linha por disciplina agendada, usando `;`, `\r\n`, células ausentes vazias e escape de `;`/`"`/quebras de linha, sem incluir optativas previstas. Incluir JSDoc. Verificar com o teste da tarefa 2.3.
- [x] 2.2 Adicionar `nomeArquivoTrilha(trilha)` (`trilha_<matricula>_<semestre com / → ->.csv`, com fallback `trilha_<matricula>.csv` quando não há semestres) e `baixarCsv(nome, conteudo)` (Blob com BOM `﻿`, `text/csv;charset=utf-8`, `<a download>` temporário, `revokeObjectURL`). Verificar com o teste da tarefa 2.3.
- [x] 2.3 Criar `frontend/src/tests/utils/trilhaCsv.test.js` cobrindo os cenários da spec:
  - linha de obrigatória `2026/2;Par;MAT001;Cálculo I;4;Seg 07-09h;OB`;
  - placeholder `2026/2;Par;;Optativa01;;;OP`;
  - optativas previstas ausentes;
  - escape de `;` e `"`;
  - nome do arquivo com e sem semestres;
  - `baixarCsv` com `URL.createObjectURL`/`revokeObjectURL` como `vi.fn()`: o `Blob` capturado tem tipo `text/csv;charset=utf-8`, seus três primeiros bytes (lidos com `arrayBuffer()`) são `EF BB BF`, o `<a>` recebe o nome do arquivo em `download` e a URL é revogada. Não usar `blob.text()` para checar o BOM, pois ele é descartado na decodificação.

  Verificar com `npx vitest run src/tests/utils/trilhaCsv.test.js`.

## 3. Botão na página Trilha

- [x] 3.1 Adicionar o botão "Baixar CSV" (`type="button"`) no bloco de resumo de `frontend/src/pages/Trilha.jsx`, chamando `baixarCsv(nomeArquivoTrilha(trilha), trilhaParaCsv(trilha))`, reaproveitando a classe `.button` de `Trilha.module.css`, sem CSS novo, e posicionando-o depois dos parágrafos do `.resumo`. Verificar com o teste da tarefa 3.2.
- [x] 3.2 Estender `frontend/src/tests/pages/Trilha.test.jsx`, usando `vi.mock` em `../../utils/trilhaCsv` com `importOriginal` para trocar só `baixarCsv` por `vi.fn()`. Verificar que:
  - o botão não aparece com `trilha: null`;
  - o botão aparece com `trilhaMock`;
  - cenário "Sem requisição adicional": com `fetch` espiado (`vi.spyOn(globalThis, "fetch")`), o clique não chama `fetch` nem `gerarTrilha`;
  - cenário "Formulário alterado após gerar": com `trilhaMock` exibido, o aluno altera a matrícula no formulário e clica no botão; `baixarCsv` recebe o nome `trilha_2023100265_2026-2.csv` e o conteúdo igual a `trilhaParaCsv(trilhaMock)`, sem refletir o valor digitado.

  Verificar com `npx vitest run src/tests/pages/Trilha.test.jsx`.

## 4. Verificação integrada

- [x] 4.1 Rodar a suíte completa do frontend (`npx vitest run`) e o lint (`npm run lint`, que executa `eslint .` como definido em `package.json`) sem falhas.
- [x] 4.2 Com o app rodando, gerar uma trilha, baixar o CSV e abri-lo numa planilha. Confirmar acentuação correta, colunas separadas e as mesmas linhas da tela.

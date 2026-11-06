# Tasks

## 1. Formatação de horários compartilhada

- [ ] 1.1 Mover `formatarAulas`, `DIA_LABELS` e um rótulo de período (`PAR`→"Par", `IMPAR`→"Ímpar") de `frontend/src/pages/Trilha.jsx` para um módulo em `frontend/src/utils/`, com comentários JSDoc no padrão do projeto. Fazer a página importar dali. Verificar que `npx vitest run src/tests/pages/Trilha.test.jsx` continua passando sem alterações no teste.
- [ ] 1.2 Criar um teste unitário do util de formatação em `frontend/src/tests/utils/`, cobrindo aulas vazias (`null`), um bloco ("Seg 07-09h") e múltiplos blocos/dias ("Seg/Qua 07-09h, Sex 10-12h"). Verificar com `npx vitest run src/tests/utils`.

## 2. Geração do CSV

- [ ] 2.1 Criar `frontend/src/utils/trilhaCsv.js` com `trilhaParaCsv(trilha)`, que produz cabeçalho e uma linha por disciplina agendada, usando `;`, `\r\n`, células ausentes vazias e escape de `;`/`"`/quebras de linha, sem incluir optativas previstas. Incluir JSDoc. Verificar com o teste da tarefa 2.3.
- [ ] 2.2 Adicionar `nomeArquivoTrilha(trilha)` (`trilha_<matricula>_<semestre com / → ->.csv`, com fallback `trilha_<matricula>.csv` quando não há semestres) e `baixarCsv(nome, conteudo)` (Blob com BOM `﻿`, `text/csv;charset=utf-8`, `<a download>` temporário, `revokeObjectURL`). Verificar com o teste da tarefa 2.3.
- [ ] 2.3 Criar `frontend/src/tests/utils/trilhaCsv.test.js` cobrindo os cenários da spec:
  - linha de obrigatória `2026/2;Par;MAT001;Cálculo I;4;Seg 07-09h;OB`;
  - placeholder `2026/2;Par;;Optativa01;;;OP`;
  - optativas previstas ausentes;
  - escape de `;` e `"`;
  - nome do arquivo com e sem semestres;
  - BOM no Blob, com `URL.createObjectURL` mockado.

  Verificar com `npx vitest run src/tests/utils/trilhaCsv.test.js`.

## 3. Botão na página Trilha

- [ ] 3.1 Adicionar o botão "Baixar CSV" (`type="button"`) no bloco de resumo de `frontend/src/pages/Trilha.jsx`, chamando `baixarCsv(nomeArquivoTrilha(trilha), trilhaParaCsv(trilha))`, com estilo em `frontend/src/styles/Trilha.module.css` coerente com o botão existente. Verificar com o teste da tarefa 3.2.
- [ ] 3.2 Estender `frontend/src/tests/pages/Trilha.test.jsx`. Verificar que:
  - o botão não aparece com `trilha: null`;
  - o botão aparece com `trilhaMock`;
  - o clique chama `baixarCsv` (mockado) com `trilha_2023100265_2026-2.csv` e não aciona `gerarTrilha` nem `fetch`.

  Verificar com `npx vitest run src/tests/pages/Trilha.test.jsx`.

## 4. Verificação integrada

- [ ] 4.1 Rodar a suíte completa do frontend (`npx vitest run`) e o lint (`npx eslint src`) sem falhas.
- [ ] 4.2 Com o app rodando, gerar uma trilha, baixar o CSV e abri-lo numa planilha. Confirmar acentuação correta, colunas separadas e as mesmas linhas da tela.

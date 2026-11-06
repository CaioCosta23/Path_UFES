# Design

## Context

A página `frontend/src/pages/Trilha.jsx` obtém a trilha pelo hook `useTrilha`, que chama `GET /aluno/{matricula}/trilha` e guarda o JSON (`TrilhaResponse`) em estado. A tabela é renderizada diretamente desse objeto. A formatação dos horários (`formatarAulas`) é hoje uma função privada da página. O cliente `api.get` sempre faz `response.json()`. Os requisitos estão em `specs/exportacao-trilha/spec.md`.

## Goals / Non-Goals

**Goals:**
- Gerar o CSV a partir do mesmo objeto `trilha` que a tela renderiza, para o conteúdo ser idêntico por construção.
- Deixar a geração do CSV como função pura, testável sem DOM.

**Non-Goals:**
- Endpoint de exportação no backend ou uso do CSV fora da página.
- Exportar outros formatos (XLSX, PDF).

## Decisions

### 1. Gerar no frontend, não no backend
O CSV é montado no navegador a partir de `trilha`.
- **Alternativa:** um endpoint `GET /aluno/{matricula}/trilha/csv`, que exigiria extrair o cálculo do handler `get_trilha` para um serviço.
- **Por que foi descartada:** o CSV não precisa existir sem a tela. O backend recalcularia algo que o cliente já tem e criaria um segundo ponto de divergência.

### 2. Util compartilhado para formatação e CSV
- `formatarAulas` sai de `Trilha.jsx` para `frontend/src/utils/trilhaFormat.js` (a pasta `utils/` ainda não existe e será criada). Esse módulo também guarda `DIA_LABELS` e o rótulo de período. A tabela e o CSV passam a importar a mesma função, o que garante o requisito "Horários iguais aos da tela".
- Um módulo `trilhaCsv` expõe:
  - `trilhaParaCsv(trilha)`: função pura que devolve a string do CSV, sem BOM;
  - `nomeArquivoTrilha(trilha)`: devolve o nome do arquivo;
  - `baixarCsv(nome, conteudo)`: efeito colateral isolado. Cria um `Blob` com BOM `﻿` e tipo `text/csv;charset=utf-8`, gera a URL com `URL.createObjectURL`, clica num `<a download>` temporário e chama `revokeObjectURL` em seguida.
- **Alternativa:** montar o CSV inline no componente. Descartada porque dificulta o teste e mistura apresentação com serialização.

### 3. Formato
- Separador `;` e BOM, pelo padrão do Excel em pt-BR.
- Quebra de linha `\r\n`, conforme a RFC 4180.
- Período "Par"/"Ímpar", igual ao rótulo da tela.
- Células ausentes vazias, em vez do "—" da tela, para a planilha poder somar e filtrar.
- Escape: o campo vai entre aspas se contiver `;`, `"`, `\r` ou `\n`, com `"` interno virando `""`.

### 4. Botão no bloco de resumo
O botão "Baixar CSV" fica dentro do bloco `.resumo`, depois dos dois parágrafos, que só é renderizado quando `trilha` existe. Usa `type="button"` para não submeter o formulário. Reaproveita a classe `.button` existente (ação primária, já com `align-self: flex-start`), sem CSS novo. `.limparBtn` foi descartada por ser um link sublinhado, adequado a ação secundária. O nome do arquivo usa `trilha.matricula` e `trilha.semestres[0].semestre`, e não os campos do formulário, que podem ter sido editados depois da geração.

## Risks / Trade-offs

- [Trilha com zero semestres (aluno já formado)] → `nomeArquivoTrilha` cai para `trilha_<matricula>.csv`, e o CSV contém só o cabeçalho.
- [jsdom não implementa `URL.createObjectURL`] → testar `trilhaParaCsv` diretamente. No teste de `baixarCsv`, definir `URL.createObjectURL`/`revokeObjectURL` como `vi.fn()` e capturar o `Blob` recebido. No teste da página, usar `vi.mock` no módulo `trilhaCsv` com `importOriginal`, trocando só `baixarCsv` por `vi.fn()` e mantendo `trilhaParaCsv` e `nomeArquivoTrilha` reais.
- [Verificar o BOM no Blob] → `blob.text()` e `FileReader.readAsText` decodificam UTF-8 e descartam o BOM, então não o provam. O teste lê os bytes com `blob.arrayBuffer()` (ou `FileReader.readAsArrayBuffer`, se o jsdom não tiver `arrayBuffer`) e confere que os três primeiros são `EF BB BF`.
- [Duplicação de rótulos de dia/período entre tela e CSV] → mitigada pela decisão 2. Os rótulos de período ficam no util junto com `formatarAulas`.

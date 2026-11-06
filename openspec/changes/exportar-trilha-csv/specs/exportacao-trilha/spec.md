# Spec Delta

## Purpose

Permite ao aluno baixar a trilha acadêmica exibida na tela em um arquivo CSV, para guardar, abrir em planilha ou compartilhar o planejamento.

## ADDED Requirements

### Requirement: Disponibilidade da exportação
A página de trilha SHALL oferecer uma ação "Baixar CSV" somente quando houver uma trilha gerada e exibida. Antes da primeira geração, a ação SHALL NOT estar disponível.

#### Scenario: Antes de gerar a trilha
- **WHEN** o aluno abre a página de trilha e ainda não gerou nenhuma trilha
- **THEN** a ação "Baixar CSV" não é exibida

#### Scenario: Depois de gerar a trilha
- **WHEN** uma trilha foi gerada e está exibida na tela
- **THEN** a ação "Baixar CSV" é exibida

### Requirement: Conteúdo idêntico ao exibido
O CSV SHALL conter exatamente as disciplinas exibidas na trilha da tela, na mesma ordem de semestres e de disciplinas. A exportação SHALL NOT recalcular a trilha nem fazer nova requisição ao servidor.

#### Scenario: Formulário alterado após gerar
- **WHEN** o aluno gera a trilha, altera um parâmetro do formulário sem gerar novamente e baixa o CSV
- **THEN** o CSV corresponde à trilha exibida, gerada com os parâmetros anteriores

#### Scenario: Sem requisição adicional
- **WHEN** o aluno aciona "Baixar CSV"
- **THEN** nenhuma requisição é enviada ao backend

### Requirement: Uma linha por disciplina agendada
O CSV SHALL ter uma linha de cabeçalho `Semestre;Período;Código;Disciplina;Créditos;Horários;Tipo` seguida de uma linha por disciplina agendada em cada semestre, incluindo os placeholders de optativas. As optativas previstas SHALL NOT ser incluídas.

#### Scenario: Disciplina obrigatória com aulas
- **WHEN** o semestre 2026/2 (PAR) contém a disciplina MAT001 "Cálculo I", 4 créditos, OB, com aula às segundas das 07h às 09h
- **THEN** o CSV contém a linha `2026/2;Par;MAT001;Cálculo I;4;Seg 07-09h;OB`

#### Scenario: Placeholder de optativa
- **WHEN** o semestre 2026/2 (PAR) contém o placeholder "Optativa01", sem código, créditos ou aulas
- **THEN** o CSV contém a linha `2026/2;Par;;Optativa01;;;OP`, com as células ausentes vazias

#### Scenario: Optativas previstas ignoradas
- **WHEN** um semestre lista optativas previstas
- **THEN** nenhuma delas aparece como linha no CSV

### Requirement: Horários iguais aos da tela
A coluna Horários SHALL usar o mesmo texto que a tela exibe para os horários da disciplina. Por exemplo: "Seg/Qua 07-09h", com blocos separados por ", ".

#### Scenario: Múltiplos blocos de aula
- **WHEN** uma disciplina tem dois blocos de aula exibidos na tela como "Seg/Qua 07-09h, Sex 10-12h"
- **THEN** a célula Horários do CSV contém "Seg/Qua 07-09h, Sex 10-12h"

### Requirement: Compatibilidade com planilhas em pt-BR
O arquivo SHALL ser codificado em UTF-8 com BOM e usar `;` como separador. Campos que contenham `;`, aspas duplas ou quebra de linha SHALL ser envolvidos em aspas duplas, com aspas internas duplicadas.

#### Scenario: Acentuação preservada
- **WHEN** o CSV contém a disciplina "Cálculo I"
- **THEN** o arquivo começa com o BOM UTF-8 e o nome aparece sem caracteres corrompidos ao ser aberto em planilha

#### Scenario: Campo com separador
- **WHEN** o nome de uma disciplina contém `;` ou `"`
- **THEN** o campo é emitido entre aspas duplas e as aspas internas aparecem duplicadas

### Requirement: Nome do arquivo
O arquivo baixado SHALL se chamar `trilha_<matricula>_<primeiro-semestre>.csv`, usando a matrícula e o primeiro semestre da trilha exibida, com `/` substituído por `-`.

#### Scenario: Nome derivado da trilha
- **WHEN** a trilha exibida é da matrícula 2023100265 e o primeiro semestre é 2026/2
- **THEN** o arquivo baixado se chama `trilha_2023100265_2026-2.csv`

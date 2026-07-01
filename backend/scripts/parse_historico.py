"""
Parser para o Histórico Parcial por Aluno (PDF do SIE/UFES).
Gera dois CSVs: dados cadastrais do aluno e disciplinas aprovadas.

Uso: python parse_historico.py <historico.pdf> <aluno.csv> <historico.csv>
"""
import re
import csv
import sys
from pathlib import Path

import pdfplumber


def extrair_texto(pdf_path: str) -> str:
    """
    Extrai o texto completo de um arquivo PDF página a página.

    :param pdf_path: Caminho para o arquivo PDF.
    :type pdf_path: str
    :return: Texto concatenado de todas as páginas.
    :rtype: str
    """
    with pdfplumber.open(pdf_path) as pdf:
        return "\n".join(page.extract_text() or "" for page in pdf.pages)


def parse_aluno(text: str) -> dict:
    """
    Extrai os dados cadastrais do aluno do cabeçalho do histórico.

    Captura matrícula, nome civil, curso, ano/semestre de ingresso e
    coeficiente de rendimento acumulado (CR).

    :param text: Texto completo extraído do PDF do histórico.
    :type text: str
    :return: Dicionário com os campos matricula, nome, curso,
             ano_ingresso, semestre_ingresso e cr.
    :rtype: dict
    """
    def buscar(pattern, default=""):
        m = re.search(pattern, text)
        return m.group(1).strip() if m else default

    matricula = buscar(r"Matrícula:\s+(\d+)")
    curso = buscar(r"Curso:\s+\d+\s+-\s+(.+?)\s+Versão:")
    ano_ingresso = buscar(r"Ano/Semestre de ingresso:\s+(\d{4})/")
    semestre_ingresso = buscar(r"Ano/Semestre de ingresso:\s+\d{4}/(\d+)")
    cr = buscar(r"Coeficiente de Rendimento Acumulado:\s+([\d.,]+)")

    # Nome ocupa linha própria no PDF; [^\n]+ captura até o fim da linha
    nome = buscar(r"Nome civil:\s+([^\n]+)")

    return {
        "matricula": matricula,
        "nome": nome,
        "curso": curso,
        "ano_ingresso": ano_ingresso,
        "semestre_ingresso": semestre_ingresso,
        "cr": cr.replace(",", "."),
    }


def parse_historico(text: str) -> list[dict]:
    """
    Extrai as disciplinas com situação AP (Aprovado) do histórico acadêmico.

    Utiliza a posição de cada código no texto para associar cada disciplina
    ao semestre correto, evitando erro na última disciplina de cada período.

    :param text: Texto completo extraído do PDF do histórico.
    :type text: str
    :return: Lista de dicionários com campos codigo, media, ano e semestre.
    :rtype: list[dict]
    """
    aprovadas = []

    # Mapeia posições de todos os cabeçalhos de semestre (ex: "2023/1")
    sem_posicoes = [
        (m.start(), m.group(1), m.group(2))
        for m in re.finditer(r"(\d{4})/([12])", text)
    ]

    # Itera sobre cada ocorrência de código de disciplina no texto.
    # Todos os códigos da UFES têm exatamente 3 letras maiúsculas + 5 dígitos.
    for code_m in re.finditer(r"[A-Z]{3}\d{5}\b", text):
        codigo = code_m.group(0)
        pos = code_m.start()

        # Trecho de 250 chars após o código: suficiente para conter média e situação
        trecho = text[pos : pos + 250]

        sit_m = re.search(
            r"\b(AP|RF|RN|IF|IN|MT|CA|DI|AD|AE|AL|ASC|CAN|TR)\b", trecho
        )
        if not sit_m or sit_m.group(1) != "AP":
            continue

        # Semestre correto = último cabeçalho que aparece ANTES da posição do código
        semestre_atual = None
        for s_pos, ano, semestre in sem_posicoes:
            if s_pos < pos:
                semestre_atual = (ano, semestre)

        if not semestre_atual:
            continue

        media_m = re.search(r"([\d]+[,.][\d]+)\s+AP\b", trecho)
        media = media_m.group(1).replace(",", ".") if media_m else ""

        aprovadas.append({
            "codigo": codigo,
            "media": media,
            "ano": semestre_atual[0],
            "semestre": semestre_atual[1],
        })

    return aprovadas


def main(pdf_path: str, aluno_csv: str, historico_csv: str):
    """
    Ponto de entrada do script. Lê o PDF e gera os dois arquivos CSV.

    :param pdf_path: Caminho para o PDF do histórico parcial.
    :type pdf_path: str
    :param aluno_csv: Caminho de saída para os dados cadastrais do aluno.
    :type aluno_csv: str
    :param historico_csv: Caminho de saída para as disciplinas aprovadas.
    :type historico_csv: str
    """
    texto = extrair_texto(pdf_path)
    aluno = parse_aluno(texto)
    historico = parse_historico(texto)

    saidas = [
        (
            aluno_csv,
            [aluno],
            ["matricula", "nome", "curso", "ano_ingresso", "semestre_ingresso", "cr"],
        ),
        (
            historico_csv,
            historico,
            ["codigo", "media", "ano", "semestre"],
        ),
    ]
    for path, rows, fields in saidas:
        Path(path).parent.mkdir(parents=True, exist_ok=True)
        with open(path, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=fields)
            writer.writeheader()
            writer.writerows(rows)

    print(f"Dados do aluno extraídos → {aluno_csv}")
    print(f"{len(historico)} disciplinas aprovadas extraídas → {historico_csv}")


if __name__ == "__main__":
    if len(sys.argv) != 4:
        print("Uso: python parse_historico.py <historico.pdf> <aluno.csv> <historico.csv>")
        sys.exit(1)
    main(sys.argv[1], sys.argv[2], sys.argv[3])

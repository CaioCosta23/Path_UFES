"""
Parser para o Currículo de Cursos (PDF do SIGAA/UFES).
Gera dois CSVs: disciplinas (com departamento inferido) e pré-requisitos.

Uso: python parse_curriculo.py <curriculo.pdf> <disciplinas.csv> <prerequisitos.csv>
"""
import re
import csv
import sys
from pathlib import Path

import pdfplumber

# Mapeamento de prefixo de código → departamento (conforme enum Departamento do diagrama)
DEPT_MAP = {
    "INF": "DI",
    "MAT": "DMAT",
    "STA": "DMAT",
    "ELE": "DEE",
}


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


def inferir_departamento(codigo: str) -> str:
    """
    Infere o departamento de uma disciplina a partir do prefixo do código.

    Utiliza o mapeamento ``DEPT_MAP`` conforme o enum ``Departamento``
    definido no diagrama de classes (DI, DMAT, DEE). Retorna ``'OUTRO'``
    para prefixos externos ao DI (ex: EPR, LET).

    :param codigo: Código da disciplina (ex: ``INF15927``, ``MAT15925``).
    :type codigo: str
    :return: Sigla do departamento.
    :rtype: str
    """
    return DEPT_MAP.get(codigo[:3], "OUTRO")


def parse(text: str) -> tuple[list[dict], list[dict]]:
    """
    Extrai disciplinas e pré-requisitos do texto do currículo.

    Detecta linhas de disciplina pelo padrão
    ``CODE NOME CRED T E L X CHS OB|OP|EC`` e linhas de pré-requisito
    pelo padrão ``Disciplina: BLOCO N CODE``.

    :param text: Texto completo extraído do PDF do currículo.
    :type text: str
    :return: Tupla ``(disciplinas, prerequisitos)``, onde cada elemento
             é uma lista de dicionários com os campos correspondentes.
    :rtype: tuple[list[dict], list[dict]]
    """
    disciplinas = []
    prerequisitos = []
    periodo_atual = None
    codigo_atual = None

    for linha in text.splitlines():
        linha = linha.strip()
        if not linha:
            continue

        # Detecta cabeçalho de período: "PERÍODO: 1" ou "PERÍODO: *"
        periodo_m = re.match(r"PERÍODO:\s+(\d+|\*)", linha)
        if periodo_m:
            periodo_atual = periodo_m.group(1)
            continue

        # Detecta linha de disciplina: CODE NOME CRED T E L X CHS OB|OP|EC
        # Ex: INF15927 PROGRAMAÇÃO I 3 30 0 30 0 60 OB
        disc_m = re.match(
            r"^([A-Z]{3}\d{5})\s+(.+?)\s+(\d+)\s+\d+\s+\d+\s+\d+\s+\d+\s+(\d+)\s+(OB|OP|EC)\s*$",
            linha,
        )
        if disc_m:
            codigo_atual = disc_m.group(1)
            disciplinas.append({
                "codigo": codigo_atual,
                "nome": disc_m.group(2).strip(),
                "creditos": disc_m.group(3),
                "chs": disc_m.group(4),
                "tipo": disc_m.group(5),
                "periodo_sugerido": periodo_atual,
                "departamento": inferir_departamento(codigo_atual),
            })
            continue

        # Detecta linha de pré-requisito: "Disciplina: BLOCO N CODE Nome"
        # Ex: Disciplina: BLOCO 1 INF15927 PROGRAMAÇÃO I
        prereq_m = re.match(
            r"^Disciplina:\s+BLOCO\s+(\d+)\s+([A-Z]{3}\d{5})\b",
            linha,
        )
        if prereq_m and codigo_atual:
            prerequisitos.append({
                "codigo_disciplina": codigo_atual,
                "codigo_prereq": prereq_m.group(2),
                "bloco": prereq_m.group(1),
            })

    return disciplinas, prerequisitos


def main(pdf_path: str, disc_csv: str, prereq_csv: str):
    """
    Ponto de entrada do script. Lê o PDF e gera os dois arquivos CSV.

    :param pdf_path: Caminho para o PDF do currículo do curso.
    :type pdf_path: str
    :param disc_csv: Caminho de saída para as disciplinas.
    :type disc_csv: str
    :param prereq_csv: Caminho de saída para os pré-requisitos.
    :type prereq_csv: str
    """
    texto = extrair_texto(pdf_path)
    disciplinas, prerequisitos = parse(texto)

    saidas = [
        (
            disc_csv,
            disciplinas,
            ["codigo", "nome", "creditos", "chs", "tipo", "periodo_sugerido", "departamento"],
        ),
        (
            prereq_csv,
            prerequisitos,
            ["codigo_disciplina", "codigo_prereq", "bloco"],
        ),
    ]
    for path, rows, fields in saidas:
        Path(path).parent.mkdir(parents=True, exist_ok=True)
        with open(path, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=fields)
            writer.writeheader()
            writer.writerows(rows)

    print(f"{len(disciplinas)} disciplinas extraídas → {disc_csv}")
    print(f"{len(prerequisitos)} pré-requisitos extraídos → {prereq_csv}")


if __name__ == "__main__":
    if len(sys.argv) != 4:
        print("Uso: python parse_curriculo.py <curriculo.pdf> <disciplinas.csv> <prerequisitos.csv>")
        sys.exit(1)
    main(sys.argv[1], sys.argv[2], sys.argv[3])

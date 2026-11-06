/**
 * Testes de "trilhaCsv": geração do CSV, nome do arquivo e download.
 */
import {describe, it, expect, vi, afterEach} from "vitest";
import {trilhaParaCsv, nomeArquivoTrilha, baixarCsv} from "../../utils/trilhaCsv";

const trilha = {
    matricula: "2023100265",
    semestres: [
        {
            semestre: "2026/2",
            tipo: "PAR",
            disciplinas: [
                {codigo: "MAT001", nome: "Cálculo I", creditos: 4, tipo_disciplina: "OB",
                    aulas: [{dias: ["SEGUNDA"], horarios: ["H07_08", "H08_09"]}]},
                {codigo: null, nome: "Optativa01", creditos: null, tipo_disciplina: "OP", aulas: []},
            ],
            optativas_previstas: [{codigo: "OPT001", nome: "Tópicos Especiais", creditos: 4}],
        },
    ],
};

describe("trilhaParaCsv", () => {
    const linhas = trilhaParaCsv(trilha).split("\r\n");

    it("gera cabeçalho", () => {
        expect(linhas[0]).toBe("Semestre;Período;Código;Disciplina;Créditos;Horários;Tipo");
    });

    it("gera linha de obrigatória", () => {
        expect(linhas[1]).toBe("2026/2;Par;MAT001;Cálculo I;4;Seg 07-09h;OB");
    });

    it("gera placeholder de optativa com células vazias", () => {
        expect(linhas[2]).toBe("2026/2;Par;;Optativa01;;;OP");
    });

    it("ignora optativas previstas", () => {
        expect(trilhaParaCsv(trilha)).not.toContain("Tópicos Especiais");
        expect(linhas.filter(Boolean)).toHaveLength(3);
    });

    it("faz escape de ; e aspas", () => {
        const t = {matricula: "1", semestres: [{semestre: "2026/1", tipo: "IMPAR", optativas_previstas: [],
            disciplinas: [{codigo: "X1", nome: 'A;B "C"', creditos: 2, tipo_disciplina: "OB", aulas: []}]}]};
        expect(trilhaParaCsv(t).split("\r\n")[1]).toBe('2026/1;Ímpar;X1;"A;B ""C""";2;;OB');
    });
});

describe("nomeArquivoTrilha", () => {
    it("usa matrícula e primeiro semestre", () => {
        expect(nomeArquivoTrilha(trilha)).toBe("trilha_2023100265_2026-2.csv");
    });

    it("cai para só a matrícula sem semestres", () => {
        expect(nomeArquivoTrilha({matricula: "2023100265", semestres: []})).toBe("trilha_2023100265.csv");
    });
});

describe("baixarCsv", () => {
    afterEach(() => vi.restoreAllMocks());

    it("cria Blob com BOM, aciona download e revoga a URL", async () => {
        const create = vi.fn(() => "blob:fake");
        const revoke = vi.fn();
        URL.createObjectURL = create;
        URL.revokeObjectURL = revoke;
        const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function () {
            expect(this.download).toBe("a.csv");
        });

        baixarCsv("a.csv", "x;y");

        const blob = create.mock.calls[0][0];
        expect(blob.type).toBe("text/csv;charset=utf-8");
        const bytes = new Uint8Array(await new Promise((res) => {
            const r = new FileReader();
            r.onload = () => res(r.result);
            r.readAsArrayBuffer(blob);
        }));
        expect([...bytes.slice(0, 3)]).toEqual([0xEF, 0xBB, 0xBF]);
        expect(click).toHaveBeenCalledTimes(1);
        expect(revoke).toHaveBeenCalledWith("blob:fake");
    });
});

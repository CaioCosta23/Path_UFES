/**
 * Testes de "trilhaFormat": formatação de horários e rótulo de período.
 */
import {describe, it, expect} from "vitest";
import {formatarAulas, rotuloPeriodo} from "../../utils/trilhaFormat";

describe("formatarAulas", () => {
    it("retorna null quando não há aulas", () => {
        expect(formatarAulas(null)).toBeNull();
        expect(formatarAulas([])).toBeNull();
    });

    it("formata um bloco", () => {
        expect(formatarAulas([{dias: ["SEGUNDA"], horarios: ["H07_08", "H08_09"]}])).toBe("Seg 07-09h");
    });

    it("formata múltiplos blocos e dias", () => {
        expect(formatarAulas([
            {dias: ["SEGUNDA", "QUARTA"], horarios: ["H07_08", "H08_09"]},
            {dias: ["SEXTA"], horarios: ["H10_11", "H11_12"]},
        ])).toBe("Seg/Qua 07-09h, Sex 10-12h");
    });
});

describe("rotuloPeriodo", () => {
    it("traduz PAR e IMPAR", () => {
        expect(rotuloPeriodo("PAR")).toBe("Par");
        expect(rotuloPeriodo("IMPAR")).toBe("Ímpar");
    });
});

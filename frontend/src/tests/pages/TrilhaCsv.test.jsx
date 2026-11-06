/**
 * Testes do botão "Baixar CSV" da página Trilha.
 */
import {describe, it, expect, vi, beforeEach} from "vitest";
import {render, screen, fireEvent} from "@testing-library/react";
import {MemoryRouter} from "react-router-dom";
import Trilha from "../../pages/Trilha";
import {useTrilha} from "../../hooks/useTrilha";
import {baixarCsv, trilhaParaCsv} from "../../utils/trilhaCsv";

vi.mock("../../hooks/useTrilha", () => ({useTrilha: vi.fn()}));
vi.mock("../../utils/trilhaCsv", async (importOriginal) => ({
    ...(await importOriginal()),
    baixarCsv: vi.fn(),
}));

const trilhaMock = {
    matricula: "2023100265",
    semestres: [{
        semestre: "2026/2", tipo: "PAR", optativas_previstas: [],
        disciplinas: [{codigo: "MAT001", nome: "Cálculo I", creditos: 4, tipo_disciplina: "OB",
            aulas: [{dias: ["SEGUNDA"], horarios: ["H07_08", "H08_09"]}]}],
    }],
    optativas_faltantes: 0,
};

const renderTrilha = () => render(<MemoryRouter><Trilha/></MemoryRouter>);

describe("Botão Baixar CSV", () => {
    const gerarTrilha = vi.fn();
    beforeEach(() => {
        vi.clearAllMocks();
        useTrilha.mockReturnValue({trilha: trilhaMock, loading: false, erro: null, gerarTrilha});
    });

    it("não aparece sem trilha", () => {
        useTrilha.mockReturnValue({trilha: null, loading: false, erro: null, gerarTrilha});
        renderTrilha();
        expect(screen.queryByRole("button", {name: "Baixar CSV"})).toBeNull();
    });

    it("aparece com trilha", () => {
        renderTrilha();
        expect(screen.getByRole("button", {name: "Baixar CSV"})).toBeTruthy();
    });

    it("não faz requisição ao clicar", () => {
        const fetchSpy = vi.spyOn(globalThis, "fetch");
        renderTrilha();
        fireEvent.click(screen.getByRole("button", {name: "Baixar CSV"}));
        expect(fetchSpy).not.toHaveBeenCalled();
        expect(gerarTrilha).not.toHaveBeenCalled();
        fetchSpy.mockRestore();
    });

    it("usa a trilha exibida mesmo com o formulário alterado", () => {
        renderTrilha();
        fireEvent.change(screen.getByPlaceholderText("ex: 2023100265"), {target: {value: "999"}});
        fireEvent.click(screen.getByRole("button", {name: "Baixar CSV"}));
        expect(baixarCsv).toHaveBeenCalledWith("trilha_2023100265_2026-2.csv", trilhaParaCsv(trilhaMock));
    });
});

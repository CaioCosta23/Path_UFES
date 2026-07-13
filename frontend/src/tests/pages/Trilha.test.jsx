import {describe, it, expect, vi, beforeEach} from "vitest";
import {render, screen, fireEvent} from "@testing-library/react";
import {MemoryRouter} from "react-router-dom";
import Trilha from "../../pages/Trilha";
import {useTrilha} from "../../hooks/useTrilha";

vi.mock("../../hooks/useTrilha", () => ({
    useTrilha: vi.fn(),
}));

const defaultState = {
    trilha: null,
    loading: false,
    erro: null,
    gerarTrilha: vi.fn(),
};

const trilhaMock = {
    matricula: "2023100265",
    semestres: [
        {
            semestre: "2026/2",
            tipo: "PAR",
            disciplinas: [
                {
                    codigo: "MAT001",
                    nome: "Cálculo I",
                    creditos: 4,
                    tipo_disciplina: "OB",
                    aulas: [
                        {dias: ["SEGUNDA"], horarios: ["H07_08", "H08_09"]},
                    ],
                },
                {
                    codigo: null,
                    nome: "Optativa Livre",
                    creditos: null,
                    tipo_disciplina: "OP",
                    aulas: [],
                },
            ],
            optativas_previstas: [
                {codigo: "OPT001", nome: "Tópicos Especiais", creditos: 4},
            ],
        },
    ],
    optativas_faltantes: 2,
};

const renderTrilha = () =>
    render(
        <MemoryRouter>
            <Trilha/>
        </MemoryRouter>
    );

describe("Trilha", () => {
    beforeEach(() => {
        vi.mocked(useTrilha).mockReturnValue({...defaultState, gerarTrilha: vi.fn()});
    });

    describe("Renderização inicial", () => {
        it("deve renderizar o título principal", () => {
            renderTrilha();
            expect(screen.getByText("Trilha Acadêmica")).toBeInTheDocument();
        });

        it("deve renderizar o subtítulo", () => {
            renderTrilha();
            expect(screen.getByText(/Configure suas preferências/i)).toBeInTheDocument();
        });

        it("deve renderizar o campo de matrícula", () => {
            renderTrilha();
            expect(screen.getByPlaceholderText("ex: 2023100265")).toBeInTheDocument();
        });

        it("deve renderizar o campo de semestre com valor padrão", () => {
            renderTrilha();
            expect(screen.getByPlaceholderText("ex: 2026/2")).toBeInTheDocument();
        });

        it("deve renderizar o slider de máximo de disciplinas", () => {
            renderTrilha();
            const slider = screen.getByRole("slider");
            expect(slider).toBeInTheDocument();
            expect(slider).toHaveAttribute("min", "1");
            expect(slider).toHaveAttribute("max", "10");
        });

        it("deve renderizar o botão de gerar trilha", () => {
            renderTrilha();
            expect(screen.getByText("Gerar Trilha")).toBeInTheDocument();
        });

        it("deve renderizar a grade de horário com os dias corretos", () => {
            renderTrilha();
            expect(screen.getByText("Seg")).toBeInTheDocument();
            expect(screen.getByText("Ter")).toBeInTheDocument();
            expect(screen.getByText("Qua")).toBeInTheDocument();
            expect(screen.getByText("Qui")).toBeInTheDocument();
            expect(screen.getByText("Sex")).toBeInTheDocument();
        });

        it("deve renderizar a grade de horário com os horários corretos", () => {
            renderTrilha();
            expect(screen.getByText("07h")).toBeInTheDocument();
            expect(screen.getByText("12h")).toBeInTheDocument();
            expect(screen.getByText("18h")).toBeInTheDocument();
        });
    });

    describe("Interações do formulário", () => {
        it("deve atualizar o campo de matrícula ao digitar", () => {
            renderTrilha();
            const input = screen.getByPlaceholderText("ex: 2023100265");
            fireEvent.change(input, {target: {value: "2023100265"}});
            expect(input.value).toBe("2023100265");
        });

        it("deve atualizar o campo de semestre ao digitar", () => {
            renderTrilha();
            const input = screen.getByPlaceholderText("ex: 2026/2");
            fireEvent.change(input, {target: {value: "2025/1"}});
            expect(input.value).toBe("2025/1");
        });

        it("deve atualizar o máximo de semestres ao mover o slider", () => {
            renderTrilha();
            const slider = screen.getByRole("slider");
            fireEvent.change(slider, {target: {value: "7"}});
            expect(screen.getByText("7")).toBeInTheDocument();
        });

        it("deve bloquear horário ao clicar na célula da grade", () => {
            renderTrilha();
            const botoes = screen.getAllByRole("button", {name: /Seg 07:00/i});
            fireEvent.click(botoes[0]);
            expect(screen.getByText(/1 bloqueado/i)).toBeInTheDocument();
        });

        it("deve desbloquear horário ao clicar novamente na célula", () => {
            renderTrilha();
            const botoes = screen.getAllByRole("button", {name: /Seg 07:00/i});
            fireEvent.click(botoes[0]);
            fireEvent.click(botoes[0]);
            expect(screen.queryByText(/bloqueado/i)).not.toBeInTheDocument();
        });

        it("deve mostrar botão de limpar seleção quando há horários bloqueados", () => {
            renderTrilha();
            const botoes = screen.getAllByRole("button", {name: /Seg 07:00/i});
            fireEvent.click(botoes[0]);
            expect(screen.getByText("Limpar seleção")).toBeInTheDocument();
        });

        it("deve limpar todos os horários bloqueados ao clicar em limpar", () => {
            renderTrilha();
            const botoes = screen.getAllByRole("button", {name: /Seg 07:00/i});
            fireEvent.click(botoes[0]);
            fireEvent.click(screen.getByText("Limpar seleção"));
            expect(screen.queryByText(/bloqueado/i)).not.toBeInTheDocument();
        });

        it("deve mostrar campo de semestres de restrição quando há horários bloqueados", () => {
            renderTrilha();
            const botoes = screen.getAllByRole("button", {name: /Seg 07:00/i});
            fireEvent.click(botoes[0]);
            expect(screen.getByPlaceholderText(/ou.*2027/i)).toBeInTheDocument();
        });

        it("não deve mostrar campo de semestres quando não há horários bloqueados", () => {
            renderTrilha();
            expect(screen.queryByPlaceholderText(/ou.*2027/i)).not.toBeInTheDocument();
        });
    });

    describe("Submissão de formulário", () => {
        it("deve chamar 'gerarTrilha' ao submeter o formulário", () => {
            const gerarTrilhaMock = vi.fn();
            vi.mocked(useTrilha).mockReturnValue({
                ...defaultState,
                gerarTrilha: gerarTrilhaMock,
            });

            const {container} = renderTrilha();
            fireEvent.submit(container.querySelector("form"));

            expect(gerarTrilhaMock).toHaveBeenCalled();
        });

        it("deve desabilitar o botão durante o loading", () => {
            vi.mocked(useTrilha).mockReturnValue({
                ...defaultState,
                loading: true,
            });
            renderTrilha();
            const botao = screen.getByRole("button", {name: "Calculando..."});
            expect(botao).toBeDisabled();
        });
    });

    describe("Exibição de erro", () => {
        it("deve mostrar mensagem de erro quando existir", () => {
            vi.mocked(useTrilha).mockReturnValue({
                ...defaultState,
                erro: "Informe a matrícula e o semestre de início.",
            });
            renderTrilha();
            expect(screen.getByText(/Informe a matrícula e o semestre de início\./i)).toBeInTheDocument();
        });
    });

    describe("Exibição dos resultados", () => {
        beforeEach(() => {
            vi.mocked(useTrilha).mockReturnValue({
                ...defaultState,
                trilha: trilhaMock,
            });
        });

        it("deve mostrar resumo da trilha gerada", () => {
            renderTrilha();
            expect(screen.getByText(/1 semestres/)).toBeInTheDocument();
            expect(screen.getByText(/2023100265/)).toBeInTheDocument();
        });

        it("deve mostrar optativas faltantes no resumo", () => {
            const {container} = renderTrilha();
            const paragrafos = Array.from(container.querySelectorAll("p"));
            expect(paragrafos.some((p) => /Faltam \d+ optativa/i.test(p.textContent))).toBe(true);
        });

        it("deve mostrar o semestre na tabela de resultados", () => {
            renderTrilha();
            expect(screen.getByRole("heading", {name: /2026\/2/i})).toBeInTheDocument();
        });

        it("deve mostrar as disciplinas na tabela", () => {
            renderTrilha();
            expect(screen.getByText("Cálculo I")).toBeInTheDocument();
            expect(screen.getByText("Optativa Livre")).toBeInTheDocument();
        });

        it("deve mostrar os badges OB e OP corretamente", () => {
            renderTrilha();
            expect(screen.getAllByText("OB").length).toBeGreaterThan(0);
            expect(screen.getAllByText("OP").length).toBeGreaterThan(0);
        });

        it("deve mostrar optativas previstas do semestre", () => {
            renderTrilha();
            expect(screen.getByText("Optativas disponíveis neste semestre:")).toBeInTheDocument();
            expect(screen.getByText("Tópicos Especiais")).toBeInTheDocument();
        });

        it("deve formatar horário das aulas corretamente", () => {
            renderTrilha();
            expect(screen.getByText("Seg 07-09h")).toBeInTheDocument();
        });

        it("deve mostrar '—' para disciplinas sem código", () => {
            renderTrilha();
            expect(screen.getAllByText("—").length).toBeGreaterThan(0);
        });
    });
});

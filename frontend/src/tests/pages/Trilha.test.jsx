import {describe, it, expect, vi, beforeEach} from "vitest";
import{render, screen, fireEvent} from "@testing-library/react";
import {MemoryRouter} from "react-router-dom";
import Trilha from "../../pages/Trilha";

vi.mock("../../hooks/useTrilha", () => ({
    useTrilha: () => ({
        trilha: null,
        loading: false,
        erro: null,
        gerarTrilha: vi.fn(),
    }),
}));

const renderTrilha = () => 
    render(
        <MemoryRiuter>
            <Trilha/>
        </MemoryRiuter>
    );

describe("Trilha", () => {
    describe("Renderização inicial", () => {
        it("deve renderizar o título principal", () => {
            renderTrilha();

            expect(screen.getByText("Trilha Acadêmica")).toBeInTheDocument();
        });

        it("deve renderizar o subtítulo", () => {
            renderTrilha();

            expect(screen.getByText("/Configure suas preferências/i")).toBeInTheDocument();
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

            const slider = screen.getByRole("slider")
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

            expect(screen.getByText("/1 bloqueado/i")).toBeInTheDocument();
        });

        it("deve desbloquear horário ao clicar novamente na célula", () => {
            renderTrilha();

            const botoes = screen.getAllByRole("button", {name: /Seg 07:00/i});

            fireEvent.click(botoes[0]);
            fireEvent.click(botoes[0]);

            expect(screen.queryByText("/1 bloqueado/i")).not.toBeInTheDocument();
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

            expect(screen.queryByText("/bloqueado/i")).not.toBeInTheDocument();
        });

        it("deve mostrar campo de semestres de restrição quando há horários bloqueados", () => {
            renderTrilha();

            const botoes = screen.getAllByRole("button", {name: /Seg 07:00/i});

            fireEvent.click(botoes[0]);

            expect(screen.getByPlaceholderText("/ex: 2026\/2 ou 2026\/2, 2027\/1/i")).toBeInTheDocument();
        });

        it("não deve mostrar campo de semestres quando não há horários bloqueados", () => {
            renderTrilha();

            expect(screen.queryByPlaceholderText("/ex: 2026\/2 ou 2026\/2, 2027\/1/i")).not.toBeInTheDocument();
        });
    });

    describe("subimissão de formulário", () => {
       it("deve chamar 'gerarTrilha' ao submeter o formulário", () => {
            const gerarTrilhaMock = vi.fn();
            vi.mock("../../hooks/useTrilha", () => ({
                useTrilha: () => ({
                    trilha: null,
                    loading: false,
                    erro: null,
                    gerarTrilha: gerarTrilhaMock,
                }),
            }));
            renderTrilha();

            fireEvent.submit(screen.getByRole("button", {name: "Gerar Trilha"}));

            expect(gerarTrilhaMock).toHaveBeenCalled();
       });

       it("deve desabilitar o botão durante o loading", () => {
            vi.mock("../../hooks/useTrilha", () => ({
                useTrilha: () => ({
                    trilha: null,
                    loading: true,
                    erro: null,
                    gerarTrilha: vi.fn(),
                }),
            }));
            renderTrilha();

            expect(screen.getByText("Calculando...")).toBeInTheDocument();
       });
    });

    describe("Exibição de erro", () => {
       it("deve mostrar mensagem de erro quando existir", () => {
            vi.mock("../../hooks/useTrilha", () => ({
                useTrilha: () => ({
                    trilha: null,
                    loading: false,
                    erro: "Informe a matrícula e o semestre de início.",
                    gerarTrilha: vi.fn(),
                }),
            }));
            renderTrilha();

            expect(screen.getByText("/Informe a matrícula e o semestre de início./i")).toBeInTheDocument();
       });
    });

    describe("Exibição dos resultados", () => {
        const trilhaMock = {
            matricula: "2023100265",
            semestres: [
                {
                    semestre: "2026/2",
                    tipo: PAR,
                    disciplinas: [
                        {
                            codigo: "MAT001",
                            nome: "Cálculo I",
                            créditos: 4,
                            tipo_disciplina: "OB",
                            aulas: [
                                {dias: ["SEGUNDA"], horarios: "H07_08", "H08_09"},
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
        
        it("deve mostrar resumo da trilha gerada", () => {
            vi.mock("../../hooks/useTrilha", () => ({
                useTrilha: () => ({
                    trilha: trilhaMock,
                    loading: false,
                    erro: null,
                    gerarTrilha: vi.fn(),
                }),
            }));
            renderTrilha();

            expect(screen.getByText("/1 semestre/i")).toBeInTheDocument();
            expect(screen.getByText("/2023100265/")).toBeInTheDocument();
       });

       it("deve mostrar optativas faltantes no resumo", () => {
            vi.mock("../../hooks/useTrilha", () => ({
                useTrilha: () => ({
                    trilha: trilhaMock,
                    loading: false,
                    erro: null,
                    gerarTrilha: vi.fn(),
                }),
            }));
            renderTrilha();

            expect(screen.getByText("/Faltam/i")).toBeInTheDocument();
            expect(screen.getByText("/2/")).toBeInTheDocument();
       });

       it("deve mostrar o semestre na tabela de resultados", () => {
            vi.mock("../../hooks/useTrilha", () => ({
                useTrilha: () => ({
                    trilha: trilhaMock,
                    loading: false,
                    erro: null,
                    gerarTrilha: vi.fn(),
                }),
            }));
            renderTrilha();

            expect(screen.getByText("/2026/2")).toBeInTheDocument();
       });

       it("deve mostrar as disciplinas na tabela", () => {
            vi.mock("../../hooks/useTrilha", () => ({
                useTrilha: () => ({
                    trilha: trilhaMock,
                    loading: false,
                    erro: null,
                    gerarTrilha: vi.fn(),
                }),
            }));
            renderTrilha();

            expect(screen.getByText("Cálculo I")).toBeInTheDocument();
            expect(screen.getByText("Optativa Livre")).toBeInTheDocument();
       });

       it("deve mostrar os 'badges OB e OP corretamente", () => {
            vi.mock("../../hooks/useTrilha", () => ({
                useTrilha: () => ({
                    trilha: trilhaMock,
                    loading: false,
                    erro: null,
                    gerarTrilha: vi.fn(),
                }),
            }));
            renderTrilha();

            const bagdes = screen.getAllByText("OB");
            expect(badges.length).toBeGreaterThan(0);
            expect(screen.getByText("OP")).toBeInTheDocument();
       });

       it("deve mostrar optaivas previstas do semestre", () => {
            vi.mock("../../hooks/useTrilha", () => ({
                useTrilha: () => ({
                    trilha: trilhaMock,
                    loading: false,
                    erro: null,
                    gerarTrilha: vi.fn(),
                }),
            }));
            renderTrilha();

            expect(screen.getByText("Optativas disponíveis neste semestre:")).toBeInTheDocument();
            expect(screen.getByText("Tópicos Especiais")).toBeInTheDocument();
       });

       it("deve formatar horário das aulas corretamente", () => {
            vi.mock("../../hooks/useTrilha", () => ({
                useTrilha: () => ({
                    trilha: trilhaMock,
                    loading: false,
                    erro: null,
                    gerarTrilha: vi.fn(),
                }),
            }));
            renderTrilha();

            expect(screen.getByText("Seg 07-09h")).toBeInTheDocument();
       });

       it("deve mostrar '- para disciplinas sem código", () => {
            vi.mock("../../hooks/useTrilha", () => ({
                useTrilha: () => ({
                    trilha: trilhaMock,
                    loading: false,
                    erro: null,
                    gerarTrilha: vi.fn(),
                }),
            }));
            renderTrilha();

            const tracos = screen.getAllByText("-")
            expect(tracos.length).toBeGreaterThan(0);
       });
    });
});
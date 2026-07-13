import {describe, it, expect, beforeEach, vi} from "vitest";
import {render, screen, fireEvent} from "@testing-library/react";
import {renderHook, act} from "@testing-library/react";
import {ThemeProvider, useTheme} from "../../contexts/ThemeContext";

describe("ThemeContext", () => {
    beforeEach(() => {
        // Limpa o "data-theme" antes de cada teste;
        document.documentElement.removeAttribute("data-theme");
    });

    describe("ThemeProvider", () => {
        it("deve renderizar os filhos corretamente", () => {
            render(
                <ThemeProvider>
                    <div data-testid = "filho">Conteúdo</div>
                </ThemeProvider>
            );
            expect(screen.getByTestId("filho")).toBeInTheDocument();
        });

        it("deve iniciar com tema light", () => {
            const {result} = renderHook(() => useTheme(), {wrapper: ThemeProvider});
            expect(result.current.theme).toBe("light");
        });

        it("deve aplicar 'data-theme' no html ao iniciar", () => {
            renderHook(() => useTheme(), {wrapper: ThemeProvider});

            expect(document.documentElement.getAttribute("data-theme")).toBe("light");
        });

        it("deve alternar para dark ao chamar toggleTheme", () => {
            const {result} = renderHook(() => useTheme(), {wrapper: ThemeProvider});

            act(() => {
                result.current.toggleTheme();
            });

            expect(result.current.theme).toBe("dark");
        });

        it("deve voltar para light ao chamar toggleTheme duas vezes", () => {
            const {result} = renderHook(() => useTheme(), {wrapper: ThemeProvider});

            act(() => {
                result.current.toggleTheme();
                result.current.toggleTheme();
            });

            expect(result.current.theme).toBe("light");
        });

        it("deve compartilhar o tema entre múltiplos consumidores", () => {
            const Consumidor1 = () => {
                const {theme} = useTheme();
                return <div data-testid = "consumidor1">{theme}</div>;
            };

            const Consumidor2 = () => {
                const {theme} = useTheme();
                return <div data-testid = "consumidor2">{theme}</div>;
            };

            render(
                <ThemeProvider>
                    <Consumidor1/>
                    <Consumidor2/>
                </ThemeProvider>
            );

            expect(screen.getByTestId("consumidor1").textContent).toBe("light");
            expect(screen.getByTestId("consumidor2").textContent).toBe("light");
        });

        it("deve atualizar todos os consumidores ao alternar o tema", () => {
            const BotaoTema = () => {
                const {toggleTheme} = useTheme();
                return <button onClick = {toggleTheme}>Toggle</button>;
            };

            const ExibirTema = () => {
                const {theme} = useTheme();
                return <div data-testid = "tema">{theme}</div>;
            };

            render(
                <ThemeProvider>
                    <BotaoTema/>
                    <ExibirTema/>
                </ThemeProvider>
            );

            fireEvent.click(screen.getByText("Toggle"));

            expect(screen.getByTestId("tema").textContent).toBe("dark");
        });
    });

    describe("useTheme - fora do Provider", () => {
        it("deve lançar erro quando usado fora do ThemeProvider", () => {
            const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

            expect(() => {
                renderHook(() => useTheme());
            }).toThrow("useTheme precisa ser usado dentro de um <ThemeProvider>");

            consoleError.mockRestore();
        });
    });
});

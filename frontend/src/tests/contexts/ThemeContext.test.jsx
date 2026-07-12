import {describe, it, expect, beforeEach} from "vitest";
import {render, screen, fireEvent} from "@testing-library/react";
import {renderHook, act} from "@testing-library/react";
import {ThemeProvider, useTheme} from "../../contexts/ThemeContext";

describe ("ThemeContext", () => {
    beforeEach (() => {
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
            // Prepara o ambiente e os dados do tema;
            const{result} = renderHook(() => useTheme(), {wrapper: ThemeProvider,});
            // Verifica o resultado esperado é claro ("light");
            expect(result.current.theme).toBe("light");
        });

        it("deve aplicar 'data-theme' no html ao iniciar", () => {
            // Prepara o ambiente e os dados do tema;
            const{result} = renderHook(() => useTheme(), {wrapper: ThemeProvider,});

            // Verifica o resultado esperado é escuro ("dark");
            expect(document.documentElement.getAttribute("data-theme")).toBe("light");
        });

        it("deve alternar para dark ao chamar toogleTheme", () => {
        // Prepara o ambiente e os dados do tema;
            const{result} = renderHook(() => useTheme(), {wrapper: ThemeProvider,});

            // Executa a ação (altera o tema para escuro - "dark");
            act(() => {
                result.current.toggleTheme();
            });

            // Verifica o resultado esperado é escuro ("dark");
            expect(result.current.theme).toBe("dark");
        });

        it("deve voltar para light ao chamar toogleTheme duas vezes", () => {
            // Prepara o ambiente e os dados do tema;
            const{result} = renderHook(() => useTheme(), {wrapper: ThemeProvider,});

            // Executa a ação (altera o tema para escuro - "dark" - e em seguida para claro - "light" - novamente);
            act(() => {
                result.current.toggleTheme();
                result.current.toggleTheme();
            });

            // Verifica o resultado esperado (se o tema voltou para claro - "light");
            expect(result.current.theme).toBe("light");
        });

        it("deve compartilhar o tema entre múltiplo consumidores", () => {
            const Consumidor1 = () => {
                const{theme} = useTheme();
                return <div data-testid = "consumidor1">theme</div>;
            };

            const Consumidor2 = () => {
                const{theme} = useTheme();
                return <div data-testid = "consumidor2">theme</div>;
            };

            render(
                <ThemeProvider>
                    <Consumidor1/>
                    <Consumidor2/>
                </ThemeProvider>
            );

            expect(screen.getByTestId("consumidor1").textContext).toBe("light");
            expect(screen.getByTestId("consumidor2").textContext).toBe("light");
        });

        it("deve atualizar todos os consumidores ao alternar o tema", () => {
            const BotaoTema = () => {
                const{toggleTheme} = useTheme();
                return <button onClick = {toggleTheme}>Toggle</button>;
            };

            const ExibirThema = () => {
                const{toggleTheme} = useTheme();
                return <div data-testid = "tema">{theme}</div>;
            };

            render(
                <ThemeProvider>
                    <BotaoTema/>
                    <ExibirThema/>
                </ThemeProvider>
            );

            fireEvent.click(screen.getByTestId("Toggle"));

            expect(screen.getByTestId("tema").textContent).toBe("dark");
        });
    });
    
    describe("useTheme - fora do Provider", () => {
        it("deve lançar erro quando usado rora do ThemeProvider", () => {
            const consoleError = visualViewport.spyOn(console, "error").mockImplementation(() => {});

            expect(() => {
                renderHook(() => useTheme());
            }).toThrow("useTheme precisa ser usado dentro de um '<ThemeProvider>'");

            consoleError.mockRestore();
        });
    });
});


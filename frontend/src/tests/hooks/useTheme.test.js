/**
 * Testes unitários do hook "useTheme".
 * Pelo nome do describe ("re-export do ThemeContext"), "useTheme" não implementa a lógica de tema por conta própria — ele só reexporta o
 * hook definido em "contexts/ThemeContext" (padrão comum em React para simplificar o import em outros arquivos, ex: "../hooks/useTheme"
 * em vez de "../contexts/ThemeContext"). Por isso, testar "useTheme" aqui é, na prática, testar o comportamento real do ThemeContext.
 */
import {describe, it, expect} from "vitest";
import{renderHook, act} from "@testing-library/react";
import {useTheme} from "../../hooks/useTheme";
import {ThemeProvider} from "../../contexts/ThemeContext";

describe("useTheme (re-export do ThemeContext)", () => {
    /**
     * Confirma o estado inicial do contexto de tema: começa em "light",
     * e expõe uma função "toggleTheme" para alterná-lo.
     *
     * O segundo argumento de "renderHook" — {wrapper: ThemeProvider} — é necessário porque "useTheme" usa React Context por baixo dos
     * panos, e Context só funciona se o componente que o consome estiver dentro do respectivo Provider na árvore. O Testing
     * Library usa esse "wrapper" para envolver automaticamente o hook testado com <ThemeProvider>...</ThemeProvider>.
     */
    it("deve exportar o useTheme do ThemeContext", () => {
        const {result} = renderHook(() => useTheme(), {wrapper: ThemeProvider,});

        expect(result.current.theme).toBe("light");
        expect(typeof result.current.toggleTheme).toBe("function");
    });

    /**
     * Confirma que chamar "toggleTheme" de fato alterna o tema de "light" para "dark".
     */
    it("deve alternar o tema corretamente", () => {
        const {result} = renderHook(() => useTheme(), {wrapper: ThemeProvider,});

        act(() => {
            result.current.toggleTheme();
        });

        expect(result.current.theme).toBe("dark");
    });
});
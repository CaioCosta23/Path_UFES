import {describe, it, expect} from "vitest";
import{renderHook, act} from "@testing-library/react";
import {useTheme} from "../../hooks/useTheme";
import {ThemeProvider} from "../../contexts/ThemeContext";

describe("useTheme (re-export do ThemeContext)", () => {
    it("deve exportar o useTheme do ThemeContext", () => {
        const {result} = renderHook(() => useTheme(), {wrapper: ThemeProvider,});

        expect(result.current.theme).toBe("light");
        expect(typeof result.current.toggleTheme).toBe("function");
    });

    it("deve alternar o tema corretamente", () => {
        const {result} = renderHook(() => useTheme(), {wrapper: ThemeProvider,});

        act(() => {
            result.current.toggleTheme();
        });

        expect(result.current.theme).toBe("dark");
    });
});
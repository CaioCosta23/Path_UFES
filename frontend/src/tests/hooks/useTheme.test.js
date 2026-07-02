import {describe, it, expect, beforeEach} from "vitest";
import{renderHook, act} from "@testing-library/react";
import {useTheme} from "../../hooks/useTheme";

describe ("UseTheme", () => {
    beforeEach(() => {
        document.documentElement.removeAttribute("data-theme");
    });

    it("deve iniciar com tema light", () => {
        const{result} = renderHook(() => useTheme());
        expect(result.current.theme).toBe("light");
    });

    it("deve alternar para dark ao chamar toogleTheme", () => {
        const{result} = renderHook(() => useTheme());

        act(() => {
            result.current.toggleTheme();
        });
        expect(result.current.theme).toBe("dark");
    });

    it("deve voltar para light ao chamar toogleTheme duas vezes", () => {
        const{result} = renderHook(() => useTheme());

        act(() => {
            result.current.toggleTheme();
            result.current.toggleTheme();
        });
        expect(result.current.theme).toBe("light");
    });

    it("deve aplicar data theme no elemento html", () => {
        const{result} = renderHook(() => useTheme());

        act(() => {
            result.current.toggleTheme();
        });
        expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    });
});
import {describe, it, expect, beforeEach} from "vitest";
import{renderHook, act} from "@testing-library/react";
import {useTheme} from "../../hooks/useTheme";

describe ("UseTheme", () => {
    beforeEach(() => {
        document.documentElement.removeAttribute("data-theme");
    });
    
    it("deve iniciar com tema light", () => {
        // Prepara o ambiente e os dados do tema;
        const{result} = renderHook(() => useTheme());
        // Verifica o resultado esperado é claro ("light");
        expect(result.current.theme).toBe("light");
    });

    it("deve alternar para dark ao chamar toogleTheme", () => {
        // Prepara o ambiente e os dados do tema;
        const{result} = renderHook(() => useTheme());

        // Executa a ação (altera o tema para escuro - "dark");
        act(() => {
            result.current.toggleTheme();
        });

        // Verifica o resultado esperado é escuro ("dark");
        expect(result.current.theme).toBe("dark");
    });

    it("deve voltar para light ao chamar toogleTheme duas vezes", () => {
        // Prepara o ambiente e os dados do tema;
        const{result} = renderHook(() => useTheme());

        // Executa a ação (altera o tema para escuro - "dark" - e em seguida para claro - "light" - novamente);
        act(() => {
            result.current.toggleTheme();
            result.current.toggleTheme();
        });

        // Verifica o resultado esperado (se o tema voltou para claro - "light");
        expect(result.current.theme).toBe("light");
    });

    it("deve aplicar data theme no elemento html", () => {
         // Prepara o ambiente e os dados do tema;
        const{result} = renderHook(() => useTheme());

        // Executa a ação (altera o tema para o padrão - que nesse caso, é claro - "light");
        act(() => {
            result.current.toggleTheme();
        });

        // Verifica o resultado esperado (se o tema está de acordo com o padrão, que nesse caso, é claro - "light");
        expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    });
});
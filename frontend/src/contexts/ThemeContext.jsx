import {createContext, useContext, useState, useEffect} from "react";

/**
 * Contexto React que guarda o tema atual (claro/escuro) da aplicação.
 */
const ThemeContext = createContext(null);

/**
 * Provedor do tema da aplicação: guarda o estado do tema atual, aplica-o
 * como atributo `data-theme` no `<html>` (para o CSS reagir) e disponibiliza
 * a troca de tema para todos os componentes filhos via `useTheme`.
 *
 * @param {Object} props
 * @param {import("react").ReactNode} props.children Componentes que terão acesso ao contexto de tema.
 * @returns {import("react").ReactElement} Provedor de contexto envolvendo os componentes filhos.
 */
export function ThemeProvider({children}) {
    const [theme, setTheme] = useState("light");

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);

    }, [theme]);

    const toggleTheme = () =>
        setTheme((prev) => (prev === "light" ? "dark" : "light"));

    return (
        <ThemeContext.Provider value = {{theme, toggleTheme}}>
            {children}
        </ThemeContext.Provider>
    );
}

/**
 * Hook para acessar o tema atual e a função de alternância, a partir do
 * `ThemeContext`. Precisa ser usado dentro de um componente descendente
 * de `<ThemeProvider>`.
 *
 * @returns {{theme: "light"|"dark", toggleTheme: () => void}} Tema atual e função para alterná-lo.
 */
export function useTheme() {
    const context = useContext(ThemeContext);

    if (!context) {
        throw new Error("useTheme precisa ser usado dentro de um <ThemeProvider>");
    }

    return context;
}
/*
import { useState, useEffect } from "react";

export function useTheme() {
    const[theme, setTheme] = useState("light");

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
    }, [theme]);

    const toggleTheme = () =>
        setTheme((prev) => (prev === "light" ? "dark" : "light"));
    return {theme, toggleTheme}
}*/

/**
 * Reexporta o hook `useTheme` definido em `ThemeContext`, permitindo
 * importá-lo a partir da pasta `hooks/` junto com os demais hooks da aplicação.
 */
export {useTheme} from "../contexts/ThemeContext";
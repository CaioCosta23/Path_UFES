import {describe, it, expect} from "vitest";
import {render, screen, fireEvent} from "@testing-library/react";
import {MemoryRouter} from "react-router-dom";
import {ThemeProvider} from "../../contexts/ThemeContext";
import Navbar from "../../components/Navbar";

const renderNavbar = () =>
    render(
        <ThemeProvider>
            <MemoryRouter>
                <Navbar/>
            </MemoryRouter>
        </ThemeProvider>
    );

describe("Navbar", () => {
    it("deve renderizar o logo", () => {
        renderNavbar();
        expect(screen.getByText("Path UFES")).toBeInTheDocument();
    });

    it("deve renderizar os links de navegação", () => {
        renderNavbar();
        expect(screen.getByText("Home")).toBeInTheDocument();
        expect(screen.getByText("Grafo")).toBeInTheDocument();
        expect(screen.getByText("Trilha")).toBeInTheDocument();
        expect(screen.getByText("About")).toBeInTheDocument();
    });

    it("deve renderizar o botão de tema", () => {
        renderNavbar();
        expect(screen.getByLabelText("Alternar tema")).toBeInTheDocument();
    });

    it("deve alternar o ícone do tema ao clicar", () => {
        renderNavbar();
        const botaoTema = screen.getByLabelText("Alternar tema");

        fireEvent.click(botaoTema);

        expect(botaoTema).toBeInTheDocument();
    });

    it("deve abrir o menu mobile ao clicar no hambúrguer", () => {
        renderNavbar();

        const botaoHamburguer = screen.getByLabelText("Abrir menu");

        fireEvent.click(botaoHamburguer);

        expect(botaoHamburguer.textContent).toBe("✕");
    });

    it("deve mostrar link Trilha no menu mobile", () => {
        renderNavbar();

        const botaoHamburguer = screen.getByLabelText("Abrir menu");

        fireEvent.click(botaoHamburguer);

        const linksTrilha = screen.getAllByText("Trilha");
        fireEvent.click(linksTrilha[1]);

        expect(botaoHamburguer.textContent).toBe("☰");
    });
});

import {describe, it, expect} from "vitest";
import {render, screen, fireEvent} from "@testing-library/react";
import {MemoryRouter} from "react-router-dom";
import Navbar from "../../components/Navbar";

const renderNavBar = () =>
    render(
        <MemoryRouter>
            <Navbar/>
        </MemoryRouter>
    );

describe("Navbar", () => {
    it("deve renderizar o logo", () => {
        renderNavBar();
        expect(screen.getByText("MyApp")).toBeInDocument();
    });

    it("deve renderizar os links de navegação", () => {
        renderNavBar();
        expect(screen.getByText("Home")).toBeInDocument();
        expect(screen.getByText("Grafo")).toBeInDocument();
        expect(screen.getByText("Trilha")).toBeInDocument();
        expect(screen.getByText("About")).toBeInDocument();
    });

    it("deve renderizar o botão de tema", () => {
        renderNavBar();
        expect(screen.getByText("Alternar Tema")).toBeInDocument();
    });

    it("deve abrir o menu mobile ao clicar no hambúrguer", () => {
        renderNavBar();

        const botaoTema = screen.getByLabelText("Alternar tema");

        // Ainda é necessário rever esse trecho de código!
        expect(botaoTema.textContent).toBe("moon");
        fireEvent.click(botaoHamburguer);
        expect(botaoTema.textContent).toBe("sun");
    });
    
    it("deve abrir o menu mobile ao clicar no hambúrguer", () => {
        renderNavBar();

        const botaoHamburguer = screen.getByLabelText("Barir menu");
        fireEvent.click(botaoHamburguer);
        expect(botaoHamburguer.textContent).toBe("X");
    });
})
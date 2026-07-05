import {describe, it, expect} from "vitest";
import {render, screen, fireEvent} from "@testing-library/react";
import {MemoryRouter} from "react-router-dom";
import Navbar from "../../components/Navbar";

const renderNavbar = () =>
    render(
        <MemoryRouter>
            <Navbar/>
        </MemoryRouter>
    );

describe("Navbar", () => {
    it("deve renderizar o logo", () => {
        renderNavbar();
        expect(screen.getByText("MyApp")).toBeInDocument();
    });

    it("deve renderizar os links de navegação", () => {
        renderNavbar();
        expect(screen.getByText("Home")).toBeInDocument();
        expect(screen.getByText("Grafo")).toBeInDocument();
        expect(screen.getByText("Trilha")).toBeInDocument();
        expect(screen.getByText("About")).toBeInDocument();
    });

    it("deve renderizar o botão de tema", () => {
        renderNavbar();
        expect(screen.getByText("Alternar Tema")).toBeInDocument();
    });

    it ("deve alternar o ícone do tema ao clicar", () => {
        renderNavbar();
        const botaoTema = screen.getByLabelText("Alternar tema");

        fireEvent.click(botaoTema);

        // Sujeito a alterção do emoji;
        expect(botaoTema.textContent).toBe("sun")
    })

    it("deve abrir o menu mobile ao clicar no hambúrguer", () => {
        renderNavbar();

        const botaoHamburguer = screen.getByLabelText("Abrir menu");

        fireEvent.click(botaoHamburguer);

        // Suejeito a alteração pelo emjoji do "X"
        expect(botaoHamburguer.textContent).toBe("X");
    });
   
    it ("deve mostrar link Trilha no menu mobile", () => {
        renderNavbar();

        const botaoHamburguer = screen.getByLabelText("Abrir menu");

        fireEvent.click(botaoHamburguer);

        const linksTrilha = screen.getAllByText("Trilha");
        fireEvent.click(linksTrilha[0]);

        //sujeito a alteração por causa do emoji;
        expect(botaoHamburguer.textContent).toBe("=")
    })
    
});
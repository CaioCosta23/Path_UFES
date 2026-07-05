import {describe, it, expect} from "vitest";
import {render, screen} from "@testing-library/react";
import {MemoryRouter} from "react-router-dom";
import About from "../../pages/About";

describe("About", () => {
    const renderAbout = () =>
        render(
            <MemoryRouter>
                <About/>
            </MemoryRouter>
        );
    
    it("deve renderizar o título principal", () => {
        renderAbout();

        expect(
            screen.getByText("Sobre o projeto")).toBeInDocument();
    });

    it ("deve renderizar a descrição do projeto", () => {
        renderAbout();

        expect(
            screen.getByText("/ferramenta acadêmica")).toBeInDocument();
    });

    it ("deve renderizar o link do GitHub do projeto", () => {
        renderAbout();

        const link = screen.getByText("Ver projeto no GitHub ->");
        expect(link).toBeInDocument();
        expect(link.closest("a")).toHaveAttribute(
            "href",
            "https://github.com/CaioCosta23/Path_UFES.git"
        );
    });

    it ("deve abrir o link do GitHub em nova aba", () => {
        renderAbout();

        const link = screen.getByText("Ver projeto no GitHub ->");
        expect(link).toBeInDocument();
        expect(link.closest("a")).toHaveAttribute("target", "_blank"
        );
    });

    
    it ("deve renderizar a seção de  desenvolvedores", () => {
        renderAbout();

        const nomes = screen.getAllByText("Nome do Dev");
        expect(nomes).toHaveLength(2);
    });

    it ("deve renderizar o link do GitHub de cada desenvolvedor", () => {
        renderAbout();

        const links = screen.getAllByText("GitHub ->");
        expect(links).toHaveLength(2);
        links.forEach((link) => {
            expect(link.closest("a")).toHaveAttribute("target", "_blank");
        });
    });
});
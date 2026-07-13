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

        expect(screen.getByText(/sobre o projeto/i)).toBeInTheDocument();
    });

    it("deve renderizar a descrição do projeto", () => {
        renderAbout();

        expect(screen.getByText(/ferramenta de planejamento acadêmico/i)).toBeInTheDocument();
    });

    it("deve renderizar o link do GitHub do projeto", () => {
        renderAbout();

        const link = screen.getByRole("link", {name: "GitHub."});
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute(
            "href",
            "https://github.com/CaioCosta23/Path_UFES.git"
        );
    });

    it("deve abrir o link do GitHub em nova aba", () => {
        renderAbout();

        const link = screen.getByRole("link", {name: "GitHub."});
        expect(link).toHaveAttribute("target", "_blank");
    });

    it("deve renderizar a seção de desenvolvedores", () => {
        renderAbout();

        expect(screen.getByText("Desenvolvedores")).toBeInTheDocument();
        expect(screen.getByText("Caio Costa Lopes")).toBeInTheDocument();
        expect(screen.getByText("Daniel Sbrocco Olimpio")).toBeInTheDocument();
        expect(screen.getByText("Miguel Zon Murad")).toBeInTheDocument();
    });

    it("deve renderizar três desenvolvedores", () => {
        const {container} = renderAbout();

        const devCards = container.querySelectorAll("[class*='devCard']");
        expect(devCards.length).toBe(3);
    });
});

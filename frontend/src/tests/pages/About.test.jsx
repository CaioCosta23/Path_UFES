/**
 * Importa as funções de teste, renderização e Roteamento/direcionamento de página;
 */
import {describe, it, expect} from "vitest";
import {render, screen} from "@testing-library/react";
import {MemoryRouter} from "react-router-dom";
import About from "../../pages/About";

/**
 * Função auxiliar de configuração para o teste;
 */
describe("About", () => {
    const renderAbout = () =>
        render(
            <MemoryRouter>
                <About/>
            </MemoryRouter>
        );
    
    // Busca o elemento que representa o título da página e o que espera visualizar;
    it("deve renderizar o título principal", () => {
        renderAbout();

        expect(screen.getByText(/sobre o projeto/i)).toBeInTheDocument();
    });

    // Busca o elemento que representa a descrição da página e o que espera visualizar;
    it("deve renderizar a descrição do projeto", () => {
        renderAbout();

        expect(screen.getByText(/ferramenta de planejamento acadêmico/i)).toBeInTheDocument();
    });

    // Busca o elemento que representa o link de repositório do projeto e o que espera visualizar;
    it("deve renderizar o link do GitHub do projeto", () => {
        renderAbout();

        const link = screen.getByRole("link", {name: "GitHub."});
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute(
            "href",
            "https://github.com/CaioCosta23/Path_UFES.git"
        );
    });

    // Busca o elemento que representa o link para o repositório GitHub do projeto e o que espera visualizar;
    it("deve abrir o link do GitHub em nova aba", () => {
        renderAbout();

        const link = screen.getByRole("link", {name: "GitHub."});
        expect(link).toHaveAttribute("target", "_blank");
    });

    // Busca o elemento que representa a seção de apresnetação dos desenvolvedores e o que espera visualizar;
    it("deve renderizar a seção de desenvolvedores", () => {
        renderAbout();

        expect(screen.getByText("Desenvolvedores")).toBeInTheDocument();
        expect(screen.getByText("Caio Costa Lopes")).toBeInTheDocument();
        expect(screen.getByText("Daniel Sbrocco Olimpio")).toBeInTheDocument();
        expect(screen.getByText("Miguel Zon Murad")).toBeInTheDocument();
    });

    // Busca o elemento que representa os "cards" (cartão/foto de apresentação) dos desenvolvedores e o que espera visualizar;
    it("deve renderizar três desenvolvedores", () => {
        // Container de redenrização da página;
        const {container} = renderAbout();

        // Área de renderização dos cartões de apresentação dos desenvolvedores;
        const devCards = container.querySelectorAll("[class*='devCard']");
        expect(devCards.length).toBe(3);
    });
});

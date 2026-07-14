/**
 * Testes de integração da página "About".
 * Verifica se o conteúdo estático (título, descrição, link do GitHub e seção de desenvolvedores) é renderizado corretamente — não há
 * nenhum hook ou serviço externo envolvido, então não é necessário nenhum mock aqui.
 */
import {describe, it, expect} from "vitest";
import {render, screen} from "@testing-library/react";
import {MemoryRouter} from "react-router-dom";
import About from "../../pages/About";

describe("About", () => {
    /**
     * Renderiza a página About dentro de um MemoryRouter (necessário porque componentes de rota, como o Navbar em App.jsx, podem
     * depender de um Router para funcionar).
     *
     * @returns {import("@testing-library/react").RenderResult}
     */
    const renderAbout = () =>
        render(
            <MemoryRouter>
                <About/>
            </MemoryRouter>
        );

    /**
     * Confirma a presença do <h1> principal da página.
     */
    it("deve renderizar o título principal", () => {
        renderAbout();

        expect(screen.getByText(/sobre o projeto/i)).toBeInTheDocument();
    });

    /**
     * Confirma a presença do texto descritivo do projeto, logo abaixo do título.
     */
    it("deve renderizar a descrição do projeto", () => {
        renderAbout();

        expect(screen.getByText(/ferramenta de planejamento acadêmico/i)).toBeInTheDocument();
    });

    /**
     * Confirma que o link para o repositório aponta para a URL correta do GitHub do projeto.
     */
    it("deve renderizar o link do GitHub do projeto", () => {
        renderAbout();

        const link = screen.getByRole("link", {name: "GitHub."});
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute(
            "href",
            "https://github.com/CaioCosta23/Path_UFES.git"
        );
    });

    /**
     * Confirma que o link do GitHub tem target="_blank", garantindo que ele abre em uma nova aba em vez de navegar para fora do
     * site na mesma aba.
     */
    it("deve abrir o link do GitHub em nova aba", () => {
        renderAbout();

        const link = screen.getByRole("link", {name: "GitHub."});
        expect(link).toHaveAttribute("target", "_blank");
    });

    /**
     * Confirma que a seção "Desenvolvedores" existe, junto com o nome de cada um dos três integrantes listados.
     */
    it("deve renderizar a seção de desenvolvedores", () => {
        renderAbout();

        expect(screen.getByText("Desenvolvedores")).toBeInTheDocument();
        expect(screen.getByText("Caio Costa Lopes")).toBeInTheDocument();
        expect(screen.getByText("Daniel Sbrocco Olimpio")).toBeInTheDocument();
        expect(screen.getByText("Miguel Zon Murad")).toBeInTheDocument();
    });

    /**
     * Confirma a quantidade de cards de desenvolvedor renderizados, checando pela classe CSS (Module) em vez de contar nomes —
     * cobre o caso de a estrutura ter um card "a mais ou a menos" mesmo que os nomes batam.
     */
    it("deve renderizar três desenvolvedores", () => {
        const {container} = renderAbout();

        // Usa seletor de atributo com "*=" porque o nome real da classe
        // vem "hasheado" pelo CSS Module (ex: "About_devCard__a1b2c"),
        // então buscamos qualquer classe que CONTENHA "devCard".
        const devCards = container.querySelectorAll("[class*='devCard']");
        expect(devCards.length).toBe(3);
    });
});
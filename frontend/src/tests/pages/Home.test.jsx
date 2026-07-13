/**
 * Importa funções de teste, renderização e roteamento de página;
 */
import {describe, it, expect} from "vitest";
import {render, screen} from "@testing-library/react";
import {MemoryRouter} from "react-router-dom";
import Home from "../../pages/Home";

/**
 * Configuração de descrição de teste;
 */
describe("Home", () => {
    const renderHome = () =>
        render(
            <MemoryRouter>
                <Home/>
            </MemoryRouter>
        );

    // Busca o elemento que representa o título na página e o que ele espera visualizar;
    it("deve renderizar o título principal", () => {
        renderHome();

        expect(
            screen.getByText("Visualizador de Grade Curricular")).toBeInTheDocument();
    });

    // Busca o elemento que representa a descrição da página e o que ele espera visualizar;
    it("deve renderizar a descrição do projeto", () => {
        renderHome();

        expect(
            screen.getByText(/Explore as matérias e seus respectivos pré-requisitos/i)).toBeInTheDocument();
    });

    // Busca o elemento que representa o botão do grafo e o que ele deve visualizar;
    it("deve renderizar o botão para o grafo", () => {
        renderHome();

        const botao = screen.getByText("Visualizar Grafo");
        expect(botao).toBeInTheDocument();
        expect(botao.closest("a")).toHaveAttribute("href", "/grafo");
    });

    // Busca o elemento que representa os "cards" das "features" e o que espera visualizar;
    it("deve renderizar os três cards de features", () => {
        renderHome();

        expect(screen.getByText("Upload de PDF")).toBeInTheDocument();
        expect(screen.getByText("Pré-Requisitos")).toBeInTheDocument();
        expect(screen.getByText("Interativo")).toBeInTheDocument();
    });

    // Busca os ícones SVG dos "cards" (renderizados pelo lucide-react);
    it("deve renderizar os ícones dos cards", () => {
        const {container} = renderHome();

        const svgs = container.querySelectorAll("svg");
        expect(svgs.length).toBeGreaterThanOrEqual(3);
    });
});

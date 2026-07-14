/**
 * Testes de integração da página "Home".
 * Verifica se o conteúdo estático (título, descrição, botão de navegação para o grafo e os três cards de features com seus
 * ícones) é renderizado corretamente — não há nenhum hook ou serviço externo envolvido, então não é necessário nenhum mock aqui.
 */
import {describe, it, expect} from "vitest";
import {render, screen} from "@testing-library/react";
import {MemoryRouter} from "react-router-dom";
import Home from "../../pages/Home";

describe("Home", () => {
    /**
     * Renderiza a página Home dentro de um MemoryRouter (necessário porque o botão "Visualizar Grafo" usa <Link>, do react-router-dom,
     * que exige estar dentro de um Router para funcionar).
     *
     * @returns {import("@testing-library/react").RenderResult}
     */
    const renderHome = () =>
        render(
            <MemoryRouter>
                <Home/>
            </MemoryRouter>
        );

    /**
     * Confirma a presença do <h1> principal da página.
     */
    it("deve renderizar o título principal", () => {
        renderHome();

        expect(
            screen.getByText("Visualizador de Grade Curricular")).toBeInTheDocument();
    });

    /**
     * Confirma a presença do texto descritivo logo abaixo do título.
     */
    it("deve renderizar a descrição do projeto", () => {
        renderHome();

        // Usa regex (em vez de string exata) para bater com um trecho
        // da frase completa, sem precisar reescrever o texto inteiro aqui.
        expect(screen.getByText(/Explore as matérias e seus pré-requisitos/i)).toBeInTheDocument();
    });

    /**
     * Confirma não só a presença do botão, mas também que ele realmente aponta (via href) para a rota "/grafo".
     */
    it("deve renderizar o botão para o grafo", () => {
        renderHome();

        const botao = screen.getByText("Visualizar Grafo");
        expect(botao).toBeInTheDocument();
        expect(botao.closest("a")).toHaveAttribute("href", "/grafo");
    });

    /**
     * Confirma o título e a descrição de cada um dos três cards de "features" (Upload de PDF, Pré-Requisitos, Interativo).
     */
    it("deve renderizar os três cards de features", () => {
        renderHome();

        expect(screen.getByText("Upload de PDF")).toBeInTheDocument();
        expect(screen.getByText(/Envie sua grade curicular/i)).toBeInTheDocument();

        expect(screen.getByText("Pré-Requisitos")).toBeInTheDocument();
        expect(screen.getByText(/Visualize as conexões entre as matérias/i)).toBeInTheDocument();

        expect(screen.getByText("Interativo")).toBeInTheDocument();
        expect(screen.getByText(/Clique nos nós para ver detalhes/i)).toBeInTheDocument();
    });

    /**
     * Confirma que os três ícones (SVG, da lucide-react) dos cards de features estão presentes.
     *
     * Verifica somente a QUANTIDADE de ícones, não qual ícone é qual — o Home.jsx atual não tem role/aria-label/data-testid nos ícones
     * para permitir uma checagem mais específica.
     *
     * OBS: Pode ser alterado futuramente junto ao arquivo "Home.jsx" para a resolução desse "problema" (ex: adicionando aria-label
     * em cada ícone, permitindo usar getByRole("img", {name: ...})).
     */
    it("deve renderizar os ícones dos cards", () => {
        const {container} = renderHome();

        const icones = container.querySelectorAll("svg");
        expect(icones.length).toBe(3);
    });
});
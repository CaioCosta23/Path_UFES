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
    it ("deve renderizar a descrição do projeto", () => {
        renderHome();

        // Busca essa string em específico na página;
        expect(screen.getByText(/Explore as matérias e seus pré-requisitos/i)).toBeInTheDocument();
    });

    // Busca o elemento que representa a o botão do grafo e o que ele deve visualizar;
    it ("deve renderizar o botão para o grafo", () => {
        renderHome();

        const botao = screen.getByText("Visualizar Grafo");
        expect(botao).toBeInTheDocument();
        expect(botao.closest("a")).toHaveAttribute("href", "/grafo");
    });

    // Busca o elemento que representa os "cards" das "features" o que espera visualizar;
    it("deve renderizar os três cards de features", () => {
        renderHome();

        expect(screen.getByText("Upload de PDF")).toBeInTheDocument();
        expect(screen.getByText(/Envie sua grade curicular/i)).toBeInTheDocument();

        expect(screen.getByText("Pré-Requisitos")).toBeInTheDocument();
        expect(screen.getByText(/Visualize as conexões entre as matérias/i)).toBeInTheDocument();

        expect(screen.getByText("Interativo")).toBeInTheDocument();
        expect(screen.getByText(/Clique nos nós para ver detalhes/i)).toBeInTheDocument();
    });

    // Busca os elementos que representam os ícones dos "cards" das páginas e o que espera visualizar;
    it ("deve renderizar os ícones dos cards", () => {
        const {container} = renderHome();

        /**
         * Verifica somente se a quantidade de ícones (em formato SVG - suportado pelo "lucide-react" está correto,
         * não verificando qual o emoji e/ou figura);
         * 
         * OBS: Pode ser alterado futuramente junto ao arquivo "Home.jsx" para a resolução desse 'problema';
         */
        const icones = container.querySelectorAll("svg");

        expect(icones.length()).toBe(3);
    });
});
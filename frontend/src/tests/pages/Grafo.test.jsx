/**
 * Importa as funções de teste, renderização e Roteamento/direcionamento de página;
 */
import {describe, it, expect, vi} from "vitest";
import {render, screen} from "@testing-library/react";
import {MemoryRouter} from "react-router-dom";
import Grafo from "../../pages/Grafo";

/**
 * Módulo que subistitui função pelo objeto real que seria inserido/utilizado na aplicação para fins de teste,
 * e verificando se o mesmo renderiza;
 */
vi.mock("../../components/GrafoViewer", () => ({
    default: () => <div data-testid = "grafo-viewer"/>
}));

/**
 * Função auxiliar de configuração para o teste;
 */
describe("Grafo", () => {
    const renderGrafo = () =>
        render(
            <MemoryRouter>
                <Grafo/>
            </MemoryRouter>
        );

    // Busca o elemento que representa o título da página e o que espera visualizar;
    it("deve renderizar o título da página", () => {
        renderGrafo();

        expect(
            screen.getByText("Visualizador de Grafo")).toBeInTheDocument();
    });

    // Busca o elemento que representa o subtítulo da página e o que espera visualizar;
    it("deve renderizar o subtítulo", () => {
        renderGrafo();

        expect(
            screen.getByText(/Carregue um PDF/i)).toBeInTheDocument();
    });

    // Busca o elemento que representa visualizador gráfico do Grafo na página e o que espera visualizar;
    it("deve renderizar o GrafoViewer", () => {
        renderGrafo();

        expect(
            screen.getByTestId("grafo-viewer")).toBeInTheDocument();
    });
});

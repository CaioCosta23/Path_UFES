/**
 * Testes de integração da página "Grafo".
 * Verifica se o cabeçalho estático (título e subtítulo) é renderizado corretamente, e se o "GrafoViewer" é incluído no lugar esperado —
 * sem testar o que acontece DENTRO do GrafoViewer (Cytoscape, upload de PDF, chamadas de API), já que isso é responsabilidade de um
 * arquivo de teste dedicado a ele.
 */
import {describe, it, expect, vi} from "vitest";
import {render, screen} from "@testing-library/react";
import {MemoryRouter} from "react-router-dom";
import Grafo from "../../pages/Grafo";

/**
 * Substitui o componente real "GrafoViewer" por uma versão mockada (uma <div> vazia, identificável via data-testid), isolando o teste
 * de "Grafo" de toda a complexidade interna do visualizador (Cytoscape manipulando o DOM diretamente, requisições ao backend, etc.).
 *
 * @returns {{default: () => import("react").ReactElement}}
 */
vi.mock("../../components/GrafoViewer", () => ({
    default: () => <div data-testid = "grafo-viewer"/>
}));

describe("Grafo", () => {
    /**
     * Renderiza a página Grafo dentro de um MemoryRouter (necessário porque componentes de rota, como o Navbar em App.jsx, podem
     * depender de um Router para funcionar).
     *
     * @returns {import("@testing-library/react").RenderResult}
     */
    const renderGrafo = () =>
        render(
            <MemoryRouter>
                <Grafo/>
            </MemoryRouter>
        );

    /**
     * Confirma a presença do <h1> principal da página.
     */
    it("deve renderizar o título da página", () => {
        renderGrafo();

        expect(
            screen.getByText("Visualizador de Grafo")).toBeInTheDocument();
    });

    /**
     * Confirma a presença do texto de instrução logo abaixo do título.
     */
    it("deve renderizar o subtítulo", () => {
        renderGrafo();

        expect(
            screen.getByText(/Carregue um PDF/i)).toBeInTheDocument();
    });

    /**
     * Confirma que "Grafo" de fato inclui o "GrafoViewer" (aqui, a versão mockada) em algum lugar do seu JSX — só isso, sem
     * verificar nada do comportamento interno do visualizador.
     */
    it("deve renderizar o GrafoViewer", () => {
        renderGrafo();

        expect(
            screen.getByTestId("grafo-viewer")).toBeInTheDocument();
    });
});
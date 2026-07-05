import {describe, it, expect, vi} from "vitest";
import {render, screen} from "@testing-library/react";
import {MemoryRouter} from "react-router-dom";
import Home from "../../pages/Grafo";

vi.mock("../../componets/GrafoViewer", () => ({
    default: () => <div data-testid = "grafo-viewer"/>
}));

describe("Grafo", () => {
    const renderGrafo = () =>
        render(
            <MemoryRouter>
                <Grafo/>
            </MemoryRouter>
        );
    
    it("deve renderizar o título da página", () => {
        renderGrafo();

        expect(
            screen.getByText("Visualizador de Grafo")).toBeInDocument();
    });

    it ("deve renderizar o subtítulo", () => {
        renderGrafo();

        expect(
            screen.getByText("Carregue um PDF ou um JSON para visualizar a grade curricular.")).toBeInDocument();
    });

    it ("deve renderizar o GrafoViewer", () => {
        renderGrafo();

        expect(
            screen.getByTestId("grafo-viewer.")).toBeInDocument();
    });
});
import {describe, it, expect, vi} from "vitest";
import {render, screen} from "@testing-library/react";
import {MemoryRouter} from "react-router-dom";
import Grafo from "../../pages/Grafo";

vi.mock("../../components/GrafoViewer", () => ({
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
            screen.getByText("Visualizador de Grafo")).toBeInTheDocument();
    });

    it("deve renderizar o subtítulo", () => {
        renderGrafo();

        expect(
            screen.getByText(/Carregue um PDF/i)).toBeInTheDocument();
    });

    it("deve renderizar o GrafoViewer", () => {
        renderGrafo();

        expect(
            screen.getByTestId("grafo-viewer")).toBeInTheDocument();
    });
});

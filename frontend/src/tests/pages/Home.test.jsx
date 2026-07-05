import {describe, it, expect} from "vitest";
import {render, screen} from "@testing-library/react";
import {MemoryRouter} from "react-router-dom";
import Home from "../../pages/Home";

describe("Home", () => {
    const renderHome = () =>
        render(
            <MemoryRouter>
                <Home/>
            </MemoryRouter>
        );
    
    it("deve renderizar o título principal", () => {
        renderHome();

        expect(
            screen.getByText("Visualizador de Grade Curricular")).toBeInDocument();
    });

    it ("deve renderizar a descrição do projeto", () => {
        renderHome();

        expect(
            screen.getByText("/Explore as matérias e seus pré-requisitos/i")).toBeInDocument();
    });

    it ("deve renderizar o botão para o grafo", () => {
        renderHome();

        const botao = screen.getByText("Visuializar Grafo ->");
        expect(botao).toBeInDocument();
        expect(botao.closest("a")).toHaveAttribute("href", "/grafo");

        it("deve renderizar os três cards de features", () => {
            renderHome();

            expect(screen.getByText("Upload de PDF")).toBeInDocument();
            expect(screen.getByText("Pré-Requisitos")).toBeInDocument();
            expect(screen.getByText("Interativo")).toBeInDocument();
        });

        it ("deve renderizar os ícones dos cards", () => {
            renderHome();

            // Sujeito a alterações por causa dos emojis;
            expect(screen.getByText("paper")).toBeInDocument();
            expect(screen.getByText("link")).toBeInDocument();
            expect(screen.getByText("search")).toBeInDocument();
        })
    });
});
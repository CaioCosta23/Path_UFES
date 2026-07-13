import {describe, it, expect, vi} from "vitest";
import {render, screen, fireEvent} from "@testing-library/react";
import Sidebar from "../../components/Sidebar";

describe("Sidebar", () => {
    it("deve renderizar fechada por padrão", () => {
        render(
            <Sidebar
                isOpen = {false}
                onClose = {vi.fn()}
                elementoSelecionado = {null}
            />
        );

        expect(screen.queryByText("Detalhes")).toBeInTheDocument();
        expect(screen.queryByRole("presentation")).not.toBeInTheDocument();
    });

    it("deve mostrar overlay quando aberta", () => {
        const {container} = render(
            <Sidebar
                isOpen = {true}
                onClose = {vi.fn()}
                elementoSelecionado = {null}
            />
        );

        expect(container.querySelector("[class*='overlay']")).toBeInTheDocument();
    });

    it("deve chamar o onClose ao clicar no overlay", () => {
        const onClose = vi.fn();
        const {container} = render(
            <Sidebar
                isOpen = {true}
                onClose = {onClose}
                elementoSelecionado = {null}
            />
        );

        fireEvent.click(container.querySelector("[class*='overlay']"));
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("deve chamar o onClose ao clicar X", () => {
        const onClose = vi.fn();
        render(
            <Sidebar
                isOpen = {true}
                onClose = {onClose}
                elementoSelecionado = {null}
            />
        );

        fireEvent.click(screen.getByLabelText("Fechar sidebar"));
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("deve mostrar mensagem quando nenhum elemento está selecionado", () => {
        render(
            <Sidebar
                isOpen = {true}
                onClose = {vi.fn()}
                elementoSelecionado = {null}
            />
        );

        expect(screen.getByText("Clique em um nó ou aresta do grafo para ver os detalhes aqui.")).toBeInTheDocument();
    });

    it("deve mostrar detalhes do nó quando selecionado", () => {
        render(
            <Sidebar
                isOpen = {true}
                onClose = {vi.fn()}
                elementoSelecionado = {{id: "1", label: "Cálculo I"}}
            />
        );

        expect(screen.getByText("Matérias")).toBeInTheDocument();
        expect(screen.getByText("1")).toBeInTheDocument();
        expect(screen.getByText("Cálculo I")).toBeInTheDocument();
    });

    it("deve mostrar detalhes da aresta quando selecionada", () => {
        render(
            <Sidebar
                isOpen = {true}
                onClose = {vi.fn()}
                elementoSelecionado = {{id: "1-2", source: "1", target: "2"}}
            />
        );

        expect(screen.getByText("Relação")).toBeInTheDocument();
        expect(screen.getByText("1")).toBeInTheDocument();
        expect(screen.getByText("2")).toBeInTheDocument();
    });
});

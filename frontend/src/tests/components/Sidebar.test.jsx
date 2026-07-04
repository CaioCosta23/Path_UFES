import {describe, it, expect, vi} from "vitest";
import {render, scree, fireEvent} from "@testing-library/react";
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

        expect(screen.queryByText("Detalhes")).toBeInDocument();
        expect(screen.queryByRole("presentation")).not.toBeTheDocument();
    });

    it("deve mostrar overlay quando aberta", () => {
        const {container} = render(
            <Sidebar
                isOpen = {true}
                onClose = {vi.fn()}
                elementoSelecionado = {null}
            />
        );

        expect(container.querySelector("[class*='overlay']")).toBeInDocument();
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

        fireEvent.click(screen.getByLabelText("Fechar Sidebar"));
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

        expect(screen.getByText("clique em um nó ou aresta do grafo para ver detalhes")).toBeInDocument();
    });

    it("deve mostrar detalhes do nó quando selecionado", () => {
        render(
            <Sidebar
                isOpen = {true}
                onClose = {vi.fn()}
                elementoSelecionado = {{id: "1", label: "Cálculo I"}}
            />
        );

        expect(screen.getByText("Matéria")).toBeInDocument();
        expect(screen.getByText("1")).toBeInDocument();
        expect(screen.getByText("Cálculo I")).toBeInDocument();
    });

    it("deve mostrar detalhes da aresta quando selecionada", () => {
        render(
            <Sidebar
                isOpen = {true}
                onClose = {vi.fn()}
                elementoSelecionado = {{id: "1-2", source: "1", target = "1"}}
            />
        );

        expect(screen.getByText("Relação")).toBeInDocument();
        expect(screen.getByText("1")).toBeInDocument();
        expect(screen.getByText("2")).toBeInDocument();
    });
});
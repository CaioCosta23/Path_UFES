import {describe, it, expect, vi, beforeEach} from "vitest";
import {render, screen, fireEvent} from "@testing-library/react";
import GrafoViewer from "../../components/GrafoViewer";
import {useGrafo} from "../../hooks/useGrafo";

vi.mock("../../hooks/useGrafo", () => ({
    useGrafo: vi.fn(),
}));

vi.mock("../../components/Sidebar", () => ({
    default: ({isOpen}) => (
        <div data-testid = "sidebar" data-open = {String(isOpen)}/>
    ),
}));

const defaultState = {
    containerRef: {current: null},
    nos: [],
    arestas: [],
    elementoSelecionado: null,
    alunoImportado: null,
    loading: false,
    erro: null,
    adicionarNo: vi.fn(),
    adicionarAresta: vi.fn(),
    carregarGrafo: vi.fn(),
    carregarDoBackend: vi.fn(),
    carregarDePdf: vi.fn(),
    removerSelecionado: vi.fn(),
    limparGrafo: vi.fn(),
    reorganizarLayout: vi.fn(),
};

describe("GrafoViewer", () => {
    beforeEach(() => {
        vi.mocked(useGrafo).mockReturnValue({...defaultState});
    });

    it("deve renderizar os botoes de controle", () => {
        render(<GrafoViewer/>);
        expect(screen.getByText("Detalhes")).toBeInTheDocument();
        expect(screen.getByText("Carregar matérias")).toBeInTheDocument();
        expect(screen.getByText("Reorganizar")).toBeInTheDocument();
        expect(screen.getByText("Limpar Grafo")).toBeInTheDocument();
    });

    it("deve mostrar contagem de nós e arestas", () => {
        render(<GrafoViewer/>);
        expect(screen.getByText(/Nós: 0 \| Arestas: 0/)).toBeInTheDocument();
    });

    it("deve abrir a sidebar ao clicar em Detalhes", () => {
        render(<GrafoViewer/>);

        const sidebar = screen.getByTestId("sidebar");
        expect(sidebar.getAttribute("data-open")).toBe("false");

        fireEvent.click(screen.getByText("Detalhes"));
        expect(sidebar.getAttribute("data-open")).toBe("true");
    });

    it("deve mostrar erro quando existir", () => {
        vi.mocked(useGrafo).mockReturnValueOnce({
            ...defaultState,
            erro: "Erro de conexão",
        });

        render(<GrafoViewer/>);
        expect(screen.queryByText(/Erro:/)).toBeInTheDocument();
    });

    it("deve desabilitar o botão ao carregar", () => {
        render(<GrafoViewer/>);

        const botao = screen.getByText("Carregar matérias");
        expect(botao).not.toBeDisabled();
    });
});

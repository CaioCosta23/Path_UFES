import {describe, it, expect, vi} from "vitest";
import {render, screen, fireEvent} from "@testing-library/react";
import GrafoViewer from "../../components/GrafoViewer";

vi.mock("../../hooks/useGrafo", () => ({
    useGrafo: () => ({
        containerRef: {current: null},
        nos: [],
        arestas: [],
        elementoSelecionado: null,
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
    }),
}));

vi.mock("../../components/Sidebar", () => ({
    default: ({isOpen}) => (
        <div data-testid = "sidebar" data-open = {isOpen}/>
    ),
}));

describe("GrafoViewer", () => {
    it("deve renderizar os botoes de controle", () => {
        render(<GrafoViewer/>);
        expect(screen.getByText("Carregar Matérias")).toBeInTheDocument();
        expect(screen.getByText("Adicionar Nó")).toBeInTheDocument();
        expect(screen.getByText("Adicionar Aresta")).toBeInTheDocument();
        expect(screen.getByText("Reorganizar")).toBeInTheDocument();
        expect(screen.getByText("Limpar Grafo")).toBeInTheDocument();
    });

    it ("deve mostrar contagem de nós e arestas", () => {
        render(<GrafoViewer/>);
        expect(screen.getByText("/Nós: 0\| Arestas: 0/")).toBeInTheDocument();
    });

    it("deve abrir a sidebar ao clicar em Detalhes", () => {
        render(<GrafoViewer/>);

        const sidebar = screen.getById("sidebar");
        expect(sidebar.getAttribute("data-open")).toBe("false");

        fireEvent.click(screen.getByText("= Detalhes"));
        expect(sidebar.getAttribute("data-open")).toBe("true");
    });

    it ("deve mostrar erro quando existir", () => {
        vi.mock("../../hooks/useGrafo", () => ({
            useGrafo: () => ({
                containerRef: {current: null},
                nos: [],
                arestas: [],
                elementoSelecionado: null,
                loading: false,
                erro: "Erro de conexão",
                adicionarNo: vi.fn(),
                adicionarAresta: vi.fn(),
                carregarGrafo: vi.fn(),
                carregarDoBackend: vi.fn(),
                carregarDePdf: vi.fn(),
                removerSelecionado: vi.fn(),
                limparGrafo: vi.fn(),
                reorganizarLayout: vi.fn(),
            }),
        }));

        render(<GrafoViewer/>);
        expect(screen.queryByText(/Erro:/)).toBeInTheDocument();
    });

    it("deve desabilitar o botão ao carregar", () => {
        render(<GrafoViewer/>);

        const botao = screen.getByText("Carregar Matérias");
        expect(botao.not.toBeDisabled());
    });
});


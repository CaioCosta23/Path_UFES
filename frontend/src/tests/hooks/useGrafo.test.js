import {describe, it, expect, vi, beforeEach} from "vitest";
import {renderHook, act} from "@testing-library/react";
import {useGrafo} from "../../hooks/useGrafo";

vi.mock("cytoscape", () => ({
    default: vi.fn(() => ({
        on: vi.fn(),
        add: vi.fn(),
        elements: vi.fn(() => ({
            remove: vi.fn(),
            length: 0,
            filter: vi.fn(() => []),
            boundingBox: vi.fn(() => ({x1: 0, x2: 100, y1: 0, y2: 100})),
        })),
        layout: vi.fn(() => ({run: vi.fn()})),
        fit: vi.fn(),
        center: vi.fn(),
        zoom: vi.fn(() => 1),
        pan: vi.fn(() => ({x: 0, y: 0})),
        width: vi.fn(() => 800),
        height: vi.fn(() => 600),
        $: vi.fn(() => ({remove: vi.fn()})),
        destroy: vi.fn(),
    })),
}));

vi.mock("../../services/grafoService", () => ({
    fetchGrafo: vi.fn(),
    uploadPdf: vi.fn(),
}));

import {fetchGrafo, uploadPdf} from "../../services/grafoService";

describe("useGrafo", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("deve iniciar com estados vazios", () => {
        const {result} = renderHook(() => useGrafo());

        expect(result.current.nos).toEqual([]);
        expect(result.current.arestas).toEqual([]);
        expect(result.current.elementoSelecionado).toBeNull();
        expect(result.current.loading).toBe(false);
        expect(result.current.erro).toBeNull();
    });

    it("deve adicionar um nó corretamente", () => {
        const {result} = renderHook(() => useGrafo());

        act(() => {
            result.current.adicionarNo("1", "Cálculo I");
        });

        expect(result.current.nos).toHaveLength(1);
        expect(result.current.nos[0].data.id).toBe("1");
        expect(result.current.nos[0].data.label).toBe("Cálculo I");
    });

    it("não deve adicionar um nó sem id ou label", () => {
        const {result} = renderHook(() => useGrafo());

        act(() => {
            result.current.adicionarNo("", "");
        });

        expect(result.current.nos).toHaveLength(0);
    });

    it("deve adicionar uma aresta corretamente", () => {
        const {result} = renderHook(() => useGrafo());

        act(() => {
            result.current.adicionarAresta("1", "2");
        });

        expect(result.current.arestas).toHaveLength(1);
        expect(result.current.arestas[0].data.source).toBe("1");
        expect(result.current.arestas[0].data.target).toBe("2");
    });

    it("deve limpar o grafo corretamente", () => {
        const {result} = renderHook(() => useGrafo());

        act(() => {
            result.current.adicionarNo("1", "Cálculo I");
            result.current.adicionarNo("2", "Cálculo II");
            result.current.limparGrafo();
        });

        expect(result.current.nos).toHaveLength(0);
        expect(result.current.arestas).toHaveLength(0);
        expect(result.current.elementoSelecionado).toBeNull();
    });

    it("deve carregar matérias do backend com sucesso", async () => {
        fetchGrafo.mockResolvedValueOnce({nos: [], arestas: []});

        const {result} = renderHook(() => useGrafo());

        await act(async () => {
            await result.current.carregarDoBackend();
        });

        expect(result.current.loading).toBe(false);
        expect(result.current.erro).toBeNull();
    });

    it("deve definir erro quando carregarDoBackend falhar", async () => {
        fetchGrafo.mockRejectedValueOnce(new Error("Erro de conexão"));

        const {result} = renderHook(() => useGrafo());

        await act(async () => {
            await result.current.carregarDoBackend();
        });

        expect(result.current.erro).toBe("Erro de conexão");
        expect(result.current.loading).toBe(false);
    });

    it("deve carregar grafo de PDF com sucesso", async () => {
        uploadPdf.mockResolvedValueOnce({
            matricula: "123", nome: "Test", disciplinas_importadas: 1,
        });
        fetchGrafo.mockResolvedValueOnce({nos: [], arestas: []});

        const {result} = renderHook(() => useGrafo());
        const arquivo = new File(["conteudo"], "grade.pdf");

        await act(async () => {
            await result.current.carregarDePdf(arquivo);
        });

        expect(result.current.loading).toBe(false);
        expect(result.current.erro).toBeNull();
    });
});

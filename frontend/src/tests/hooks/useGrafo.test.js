import {describe, it, expect, vi, beforeEach} from "vitest";
import {renderHook, act} from "@testing-library/react";
import {useGrafo} from "../../hooks/useGrafo";

vi.mock("cytoscape", () => ({
    default: vi.fn(() => ({
        on: vi.fn(),
        add: vi.fn(),
        elements: vi(() => ({
            remove: vi.fn(),
        })),
        layout: vi.fn(() => ({run: vi.fn()})),
        fit: vi.fn(),
        center: vi.fn(),
        $: vi.fn(() => ({remove:vi.fn()})),
        destroy: vi.fn(),
    })),
}));

vi.mock("../../services/grafoService", () => ({
    fetchMaterias: vi.fn(),
    fetchRelacionamentos: vi.fn(),
    uploadPdf: vi.fn(),
}));

import {
    fetchMaterias,
    fetchRelacionamentos,
    uploadPdf,
}from "../../services/grafoService";


describe ("useGrafo", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("deve iniciar com estados vazios", () => {
        const {result} = renderHook(() => useGrafo());

        expect(result.current.nos).toEqual([]);
        expect(result.current.arestas).toEqual([]);
        expect(result.current.elementoSelecionado).toBeNull([]);
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

    it ("deve carregar matérias do backend com sucesso", async () => {
        fetchMaterias.mockResolvedValueOnce([
            {id: 1, nome: "Cálculo I"},
            {id: 2, nome: "Cálculo II"},
        ]);
        fetchRelacionamentos.mockResolvedValueOnce([
            {origem: 1, destino: 2},
        ]);

        const {result} = renderHook(() => useGrafo());

        await act (async () => {
            await result.current.carregarDoBackend();
        });

        expect(result.current.loading).toBe(false);
        expect(result.current.erro).toBeNull();
    });

    it ("deve definir erro quando carregarDoBackend falhar", async () => {
        fetchMaterias.mockRejectedValueOnce(new Error ("Erro de conexão"));

        const {result} = renderHook(() => useGrafo());

        await act (async () => {
            await result.current.carregarDoBackend();
        });

        expect(result.current.erro).toBe("Erro de conexão");
        expect(result.current.loading).toBe(false);
    });

    it ("deve carregar grafo de PDF com sucesso", async () => {
        uploadPdf.mockResolvedValueOnce({
            materias: [{id: 1, nome: "Cálculo I"}],
            relacionamentos: [],
        });

        const {result} = renderHook(() => useGrafo());
        const arquivo = new File(["conteudo"], "grade.pdf");

        await act (async () => {
            await result.current.carregarDePdf(arquivo);
        });

        expect(result.current.loading).toBe(false);
        expect(result.current.erro).toBeNull();
    });
});

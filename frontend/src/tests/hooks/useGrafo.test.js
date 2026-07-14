/**
 * Testes unitários do hook "useGrafo".
 * Verifica a lógica de estado do hook (nós, arestas, elemento selecionado, loading, erro) e sua integração com "grafoService"
 * (fetchGrafo/uploadPdf) — ambos mockados, isolando o hook de requisições de rede reais. A biblioteca "cytoscape" também é
 * mockada por completo, já que ela manipula o DOM diretamente e não teria como funcionar de verdade no ambiente simulado (jsdom) de teste.
 */
import {describe, it, expect, vi, beforeEach} from "vitest";
import {renderHook, act} from "@testing-library/react";
import {useGrafo} from "../../hooks/useGrafo";

/**
 * Substitui o módulo "cytoscape" por uma fábrica falsa: toda vez que o hook chamar "cytoscape({...})" (dentro do useEffect), em vez de
 * criar uma instância real (que tentaria desenhar em um <div> de verdade), recebe de volta esse objeto com métodos "vazios" (vi.fn()),
 * só o suficiente para o hook conseguir chamar cada método sem quebrar.
 *
 * @returns {{default: import("vitest").Mock}}
 */
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

/**
 * Substitui o módulo real "grafoService" por uma versão mockada, isolando o hook da implementação real de "fetchGrafo"/"uploadPdf"
 * (que por sua vez dependem de "api"/"fetch").
 *
 * @returns {{fetchGrafo: import("vitest").Mock, uploadPdf: import("vitest").Mock}}
 */
vi.mock("../../services/grafoService", () => ({
    fetchGrafo: vi.fn(),
    uploadPdf: vi.fn(),
}));

import {fetchGrafo, uploadPdf} from "../../services/grafoService";

describe("useGrafo", () => {
    // Diferente de outros arquivos de teste deste projeto (que usam
    // "afterEach"), aqui a limpeza dos mocks é feita em "beforeEach" —
    // funcionalmente equivalente (garante mocks "zerados" antes de
    // cada teste), só muda o momento em que a limpeza acontece.
    beforeEach(() => {
        vi.clearAllMocks();
    });

    /**
     * Confirma o estado inicial do hook, antes de qualquer interação: nenhum nó/aresta, nada selecionado, sem loading, sem erro.
     */
    it("deve iniciar com estados vazios", () => {
        const {result} = renderHook(() => useGrafo());

        expect(result.current.nos).toEqual([]);
        expect(result.current.arestas).toEqual([]);
        expect(result.current.elementoSelecionado).toBeNull();
        expect(result.current.loading).toBe(false);
        expect(result.current.erro).toBeNull();
    });

    /**
     * Confirma que "adicionarNo" insere um novo nó no estado "nos", com o id e o label corretos.
     */
    it("deve adicionar um nó corretamente", () => {
        const {result} = renderHook(() => useGrafo());

        act(() => {
            result.current.adicionarNo("1", "Cálculo I");
        });

        expect(result.current.nos).toHaveLength(1);
        expect(result.current.nos[0].data.id).toBe("1");
        expect(result.current.nos[0].data.label).toBe("Cálculo I");
    });

    /**
     * Validação de entrada: id e label vazios não devem gerar nenhum nó novo (guarda de segurança dentro de "adicionarNo").
     */
    it("não deve adicionar um nó sem id ou label", () => {
        const {result} = renderHook(() => useGrafo());

        act(() => {
            result.current.adicionarNo("", "");
        });

        expect(result.current.nos).toHaveLength(0);
    });

    /**
     * Confirma que "adicionarAresta" insere uma nova aresta no estado "arestas", com origem e destino corretos.
     */
    it("deve adicionar uma aresta corretamente", () => {
        const {result} = renderHook(() => useGrafo());

        act(() => {
            result.current.adicionarAresta("1", "2");
        });

        expect(result.current.arestas).toHaveLength(1);
        expect(result.current.arestas[0].data.source).toBe("1");
        expect(result.current.arestas[0].data.target).toBe("2");
    });

    /**
     * Confirma que "limparGrafo" zera os estados de nós, arestas e elemento selecionado.
     */
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

    /**
     * Caso de sucesso: confirma que, após "carregarDoBackend" concluir com sucesso, o hook termina sem erro e com loading desativado.
     */
    it("deve carregar matérias do backend com sucesso", async () => {
        fetchGrafo.mockResolvedValueOnce({nos: [], arestas: []});

        const {result} = renderHook(() => useGrafo());

        await act(async () => {
            await result.current.carregarDoBackend();
        });

        expect(result.current.loading).toBe(false);
        expect(result.current.erro).toBeNull();
    });

    /**
     * Caminho de erro: confirma que uma falha em "fetchGrafo" é capturada, preenchendo "erro" com a mensagem da exceção.
     */
    it("deve definir erro quando carregarDoBackend falhar", async () => {
        fetchGrafo.mockRejectedValueOnce(new Error("Erro de conexão"));

        const {result} = renderHook(() => useGrafo());

        await act(async () => {
            await result.current.carregarDoBackend();
        });

        expect(result.current.erro).toBe("Erro de conexão");
        expect(result.current.loading).toBe(false);
    });

    /**
     * Caso de sucesso do upload de PDF: confirma que, após "carregarDePdf" concluir, o hook termina sem erro e com loading
     * desativado.
     */
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
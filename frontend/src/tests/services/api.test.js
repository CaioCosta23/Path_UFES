/**
 * Testes unitários do módulo "api" (camada de comunicação HTTP com o backend).
 * Cobre os quatro métodos (get, post, postFile, delete), incluindo tanto o caminho de sucesso quanto o de erro, sem depender de rede real —
 * a função global "fetch" é mockada em cada teste.
 */
import {describe, it, expect, vi, beforeEach, afterEach} from "vitest";
import {api} from "../../services/api";

describe("api", () => {
    /**
     * Antes de cada teste, substitui o "fetch" global por uma função mock (vi.fn()), permitindo controlar exatamente o que cada
     * chamada de "fetch" devolve, sem fazer requisições de verdade.
     */
    beforeEach(() => {
        vi.stubGlobal("fetch", vi.fn());
    });

    /**
     * Depois de cada teste, desfaz o stub e restaura o "fetch" original, evitando que a configuração de um teste vaze para o próximo.
     */
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    /**
     * Testes do método api.get(endpoint).
     */
    describe("get", () => {
        /**
         * Caso de sucesso: simula uma resposta HTTP "ok", e confirma que api.get devolve os dados já processados (via .json()), sem nenhuma transformação adicional.
         */
        it("deve retornar dados quando a requisição for bem sucedida", async() => {
            const dadosMock = [{id: 1, nome: "Cálculo I"}];

            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => dadosMock,
            });

            const resultado = await api.get("/materias");
            expect(resultado).toEqual(dadosMock);
        });

        /**
         * Caminho de erro: simula uma resposta HTTP mal sucedida (ok: false) e confirma que api.get propaga um erro com a
         * mensagem vinda do corpo da resposta (via .text()), em vez de silenciar a falha.
         */
        it("deve lançar erro quando a requisição falhar", async() => {

            fetch.mockResolvedValueOnce({
                ok: false,
                status: 404,
                text: async () => "Not Found",
            });

            await expect(api.get("/materias")).rejects.toThrow("Not Found");
        });

        /**
         * Confirma que api.get chama o "fetch" com a URL correta (contendo o endpoint informado), sem se importar com o valor exato de BASE_URL.
         */
        it("deve chamar a URL correta", async() => {

            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => [],
            });

            await api.get("/materias");
            expect(fetch).toHaveBeenCalledWith(expect.stringContaining("/materias"));
        });
    });

    /**
     * Testes do método api.post(endpoint, data).
     */
    describe ("post", () => {
        /**
         * Confirma que api.post: (1) devolve os dados de resposta do backend corretamente, e (2) chama "fetch" com o método,
         * headers e body (JSON serializado) esperados.
         */
        it("deve enviar dados corretamente", async() => {
            const dados = {nome: "Cálculo I"};

            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({id: 1, ...dados}),
            });

            const resultado = await api.post("/materias", dados);
            expect(resultado).toEqual({id: 1, ...dados});
            expect(fetch).toHaveBeenCalledWith(
                expect.stringContaining("/materias"), expect.objectContaining({
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(dados),
                })
            );
        });
    });

    /**
     * Testes do método api.postFile(endpoint, file).
     */
    describe ("postFile", () => {
        /**
         * Confirma que api.postFile: (1) chama "fetch" com o método e endpoint corretos, e (2) de fato envia o arquivo dentro de
         * um FormData (chave "file"), não como o arquivo "cru" nem como JSON — checagem feita inspecionando diretamente os
         * argumentos registrados na chamada mockada.
         */
        it("deve enviar arquivo como FormData", async() => {
            const arquivo = new File(["conteudo"], "grade.pdf", {
                type: "application/pdf",
            })

            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({materias: [], relacionamentos: []}),
            });

            await api.postFile("/upload-pdf", arquivo);
            expect(fetch).toHaveBeenCalledWith(
                expect.stringContaining("/upload-pdf"), 
                expect.objectContaining({
                method: "POST"})
            );

            const [, opcoesEnviadas] = fetch.mock.calls[0];
            expect(opcoesEnviadas.body).toBeInstanceOf(FormData);
            expect(opcoesEnviadas.body.get("file")).toBe(arquivo);
        });
    });

    /**
     * Testes do método api.delete(endpoint).
     */
    describe ("delete", () => {
        /**
         * Confirma que api.delete chama "fetch" com o endpoint e o método "DELETE" corretos.
         */
        it("deve chamar o endpoint correto com o método delete", async() => {

            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({sucess: true}),
            });

            await api.delete("/materias/1");
            expect(fetch).toHaveBeenCalledWith(
                expect.stringContaining("/materias/1"), 
                expect.objectContaining({
                method: "DELETE"})
            );
        });
    });
});
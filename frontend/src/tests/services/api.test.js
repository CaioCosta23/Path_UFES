/**
 * Importa as funções de teste;
 */
import {describe, it, expect, vi, beforeEach, afterEach} from "vitest";
import {api} from "../../services/api";


/**
 * Função de configuração/definção para os testes;
 */
describe("api", () => {
    // Função que substitui cada "fetch" por uma função ("fake") nova;
    beforeEach(() => {
        vi.stubGlobal("fetch", vi.fn());
    });

    // 'Desfaz' as funções "fakes" após cada teste para a função original da aplicação em si;
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    /**
     * Configuração/descrição para testes de requisição ("GET");
     */
    describe("get", () => {
        // Simula uma requisição bem sucedida e confirma que o "GET" devolve os dados corretamente;
        it("deve retornar dados quando a requisição for bem sucedida", async() => {
            const dadosMock = [{id: 1, nome: "Cálculo I"}];

            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => dadosMock,
            });

            const resultado = await api.get("/materias");
            expect(resultado).toEqual(dadosMock);
        });

        // Simula um erro de requisição e informa problema (resposta HTTP com err) no retorno dos dados; 
        it("deve lançar erro quando a requisição falhar", async() => {

            fetch.mockResolvedValueOnce({
                ok: false,
                status: 404,
                text: async () => "Not Found",
            });
            // Função assyncrona  que lança o erro (com mensagem específica);
            await expect(api.get("/materias")).rejects.toThrow("Not Found");
        });

        // Testa a URL verificando como a mesma chamou o "fetch", se ela foi chamada ao menos uma vez e se ela está exatamente como específicada;
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
     * Configuração/descrição para testes de requisição ("POST");
     */
    describe ("post", () => {
        // Verifica se a requisição de "POST" foi feita corretamente, simulando um o recebimento do objeto e as propriedades corretas;
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
     * Configuração/descrição para testes de requisição ("POSTFILE");
     */
    describe ("postFile", () => {
        // Simula o recebimento de arquivos  e seus conteúdos;
        it("deve enviar arquivo como formatoData", async() => {
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
     * Configuração/descrição para testes de requisição ("DELETE");
     */
    describe ("delete", () => {
        // Realiza a chamadas de "endpoint" com método correto;
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
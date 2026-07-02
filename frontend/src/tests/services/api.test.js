import {describe, it, expect, vi, beforeEach, afterEach} from "vitest";
import {api} from "../../services/api";

describe("api", () => {
    beforeEach(() => {
        vi.stubGlobal("fetch", vi.fn());
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    describe("get", () => {
        it("deve retornar dados quando a requisição for bem sucedida", async() => {
            const dadosMock = [{id: 1, nome: "Cálculo I"}];

            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => dadosMock,
            });

            const resultado = await api.get("/materias");
            expect(resultado).toEqual(dadosMock);
        });

        it("deve lançar erro quando a requisição falhar", async() => {

            fetch.mockResolvedValueOnce({
                ok: false,
                status: 404,
                text: async () => "Not Found",
            });

            await expect(api.get("/materias")).rejects.toThrow("Not Found");
        });

        it("deve chamar a URL correta", async() => {

            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => [],
            });

            await api.get("/materias");
            expect(fetch).toHaveBeenCalledWith(expect.stringContaining("/materias"));
        });
    });

    describe ("post", () => {
        it("deve enviiar dados corretamente", async() => {
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

    describe ("postFile", () => {
        it("deve enviar arquivo como formatoData", async() => {
            const arquivo = new File(["conteudo"], "grade.pdf", {
                type: "application.pdf",
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
        });
    });

    describe ("DELETE", () => {
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
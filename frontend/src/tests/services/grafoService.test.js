import {describe, it, expect, vi, afterEach} from "vitest";
import {fetchGrafo, uploadPdf} from "../../services/grafoService";
import {api} from "../../services/api";

vi.mock("../../services/api", () => ({
    api: {
        get: vi.fn(),
        postFile: vi.fn(),
    },
}));

describe("grafoService", () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    describe("fetchGrafo", () => {
        it("deve buscar o grafo sem matrícula", async () => {
            const grafoMock = {nos: [], arestas: []};
            api.get.mockResolvedValueOnce(grafoMock);

            const resultado = await fetchGrafo();

            expect(api.get).toHaveBeenCalledWith("/grafo");
            expect(resultado).toEqual(grafoMock);
        });

        it("deve buscar o grafo com matrícula", async () => {
            const grafoMock = {nos: [{id: "MAT001", nome: "Cálculo I", status: "cumprida"}], arestas: []};
            api.get.mockResolvedValueOnce(grafoMock);

            const resultado = await fetchGrafo("2023100265");

            expect(api.get).toHaveBeenCalledWith("/grafo?matricula=2023100265");
            expect(resultado).toEqual(grafoMock);
        });

        it("deve propagar erro quando a requisição falhar", async () => {
            api.get.mockRejectedValueOnce(new Error("Erro de conexão"));

            await expect(fetchGrafo()).rejects.toThrow("Erro de conexão");
        });
    });

    describe("uploadPdf", () => {
        it("deve enviar o PDF corretamente", async () => {
            const arquivo = new File(["conteudo"], "grade.pdf", {type: "application/pdf"});
            const respostaMock = {matricula: "2023100265", nome: "Aluno", disciplinas_importadas: 10};
            api.postFile.mockResolvedValueOnce(respostaMock);

            const resultado = await uploadPdf(arquivo);

            expect(api.postFile).toHaveBeenCalledWith("/aluno/upload-pdf", arquivo);
            expect(resultado).toEqual(respostaMock);
        });

        it("deve propagar erro quando o upload falhar", async () => {
            const arquivo = new File([""], "grade.pdf");
            api.postFile.mockRejectedValueOnce(new Error("Falha no upload"));

            await expect(uploadPdf(arquivo)).rejects.toThrow("Falha no upload");
        });
    });
});

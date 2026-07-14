/**
 * Testes unitários do módulo "grafoService".
 * Verifica se "fetchGrafo" e "uploadPdf" chamam a camada "api" com os parâmetros corretos e repassam corretamente os retornos/erros,
 * sem depender de uma requisição de rede real.
 */
import {describe, it, expect, vi, afterEach} from "vitest";
import {fetchGrafo, uploadPdf} from "../../services/grafoService";
import {api} from "../../services/api";

/**
 * Substitui o módulo real "services/api" por uma versão mockada.
 * Isso isola o "grafoService" da implementação real de "api" (que por sua vez depende do "fetch" do navegador) — aqui só nos importa SE e COMO
 * "grafoService" chama "api.get"/"api.postFile", não o que acontece dentro deles.
 *
 * @returns {{api: {get: import("vitest").Mock, postFile: import("vitest").Mock}}}
 */
vi.mock("../../services/api", () => ({
    api: {
        get: vi.fn(),
        postFile: vi.fn(),
    },
}));

describe("grafoService", () => {
    /**
     * Depois de cada teste, limpa o histórico de chamadas e os valores configurados (mockResolvedValueOnce/mockRejectedValueOnce) dos mocks,
     * evitando que a configuração de um teste "vaze" para o próximo.
     */
    afterEach(() => {
        vi.clearAllMocks();
    });

    /**
     * Testes da função fetchGrafo(matricula?), responsável por buscar o grafo curricular no backend — com ou sem filtro de matrícula.
     */
    describe("fetchGrafo", () => {
        /**
         * Caso base: nenhuma matrícula informada.
         * Espera-se que "api.get" seja chamado com a rota "/grafo" pura, sem query string, e que o retorno seja repassado sem alterações.
         */
        it("deve buscar o grafo sem matrícula", async () => {
            const grafoMock = {nos: [], arestas: []};
            api.get.mockResolvedValueOnce(grafoMock);

            const resultado = await fetchGrafo();

            expect(api.get).toHaveBeenCalledWith("/grafo");
            expect(resultado).toEqual(grafoMock);
        });

        /**
         * Caso com filtro: matrícula informada.
         * Espera-se que "fetchGrafo" monte a query string corretamente (?matricula=...) antes de repassar para "api.get".
         */
        it("deve buscar o grafo com matrícula", async () => {
            const grafoMock = {nos: [{id: "MAT001", nome: "Cálculo I", status: "cumprida"}], arestas: []};
            api.get.mockResolvedValueOnce(grafoMock);

            const resultado = await fetchGrafo("2023100265");

            expect(api.get).toHaveBeenCalledWith("/grafo?matricula=2023100265");
            expect(resultado).toEqual(grafoMock);
        });

        /**
         * Caminho de erro: garante que, se "api.get" rejeitar a Promise (ex.: falha de rede/backend), "fetchGrafo" NÃO engole o erro —
         * ele deve propagar a mesma rejeição para quem chamou.
         */
        it("deve propagar erro quando a requisição falhar", async () => {
            api.get.mockRejectedValueOnce(new Error("Erro de conexão"));

            await expect(fetchGrafo()).rejects.toThrow("Erro de conexão");
        });
    });

    /**
     * Testes da função uploadPdf(file), responsável por enviar o PDF do histórico escolar para o backend processar.
     */
    describe("uploadPdf", () => {
        /**
         * Caso de sucesso: confirma que o arquivo é repassado para "api.postFile" com o endpoint correto, e que a resposta
         * do backend (dados do aluno importado) é devolvida sem alterações.
         */
        it("deve enviar o PDF corretamente", async () => {
            const arquivo = new File(["conteudo"], "grade.pdf", {type: "application/pdf"});
            const respostaMock = {matricula: "2023100265", nome: "Aluno", disciplinas_importadas: 10};
            api.postFile.mockResolvedValueOnce(respostaMock);

            const resultado = await uploadPdf(arquivo);

            expect(api.postFile).toHaveBeenCalledWith("/aluno/upload-pdf", arquivo);
            expect(resultado).toEqual(respostaMock);
        });

        /**
         * Caminho de erro: garante que falhas no upload (ex.: PDF inválido, erro do backend) sejam propagadas por "uploadPdf", em vez de
         * serem silenciadas.
         */
        it("deve propagar erro quando o upload falhar", async () => {
            const arquivo = new File([""], "grade.pdf");
            api.postFile.mockRejectedValueOnce(new Error("Falha no upload"));

            await expect(uploadPdf(arquivo)).rejects.toThrow("Falha no upload");
        });
    });
});
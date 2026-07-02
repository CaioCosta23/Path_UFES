import {describe, it , expect, vi, afterEach} from "vitest";
import{fetchMaterias, fetchRelacionamentos, fetchMateria, uploadPdf,} from "../../services/grafServices";
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

    describe("fetchMaterias", () => {
        it("deve buscar todas as matérias", async () => {
            const materiasMock = [
                {id: 1, nome: "Cálculo I"},
                {id: 2, nome: "Cálculo II"},
            ];
            
            api.get.mockResolvedValueOnce(materiasMock);

            const resultado = await fetchMaterias();

            expect(api.get).toHaveBeenCalledWith("/materias");
            expect(resultado).toEqual(materiasMock);
        });

        it("deve lançar erro quando a busca falhar", async () => {
            api.get.mockResolvedValueOnce(new Error("Erro ao buscar matérias"));

            await expect(fetchMaterias()).rejects.toThrow("Erro ao buscar matérias");
        });
    });

    describe("fetchRelacionamentos", () => {
        it("deve buscar todas os relacionamentos", async () => {
            const relacionamentosMock = [
                {origem: 1, destino: 2},
            ];
            
            api.get.mockResolvedValueOnce(relacionamentosMock);

            const resultado = await fetchRelacionamentos();

            expect(api.get).toHaveBeenCalledWith("/relacionamentos");
            expect(resultado).toEqual(relacionamentosMock);
        });
    });

    describe("fetchMateria", () => {
        it("deve buscar uma matéria específica por ID", async () => {
            const materiaMock = [{id: 1, nome: "Cálculo I"},
            ];
            
            api.get.mockResolvedValueOnce(materiaMock);

            const resultado = await fetchMateria(1);

            expect(api.get).toHaveBeenCalledWith("/materias/1");
            expect(resultado).toEqual(materiaMock);
        });
    });

    describe("uploadPdf", () => {
        it("deve enviar o PDF corretamente", async () => {
            const arquivo = new File(["conteudo"], "grade.pdf",{
                type: "application/pdf"
            });

            const respostaMock = {
                materias: [{id: 1, nome: "Cálculo I"}],
            }
            
            api.postFile.mockResolvedValueOnce(respostaMock);

            const resultado = await uploadPdf(arquivo);

            expect(api.postFile).toHaveBeenCalledWith("/upload-pdf", arquivo);
            expect(resultado).toEqual(respostaMock);
        });
    });
});
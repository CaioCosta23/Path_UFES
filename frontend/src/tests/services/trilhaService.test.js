import {describe, it, expect, vi, afterEach} from "vitest";
import {fetchTrilha} from "../../services/trilhaService";
import {api} from "../../services/api";

vi.mock("../service/api", () => ({
    api: {
        get: vi.fn(),
    },
}));

describe("trilhaService", () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    describe("fetchTrilha", () => {
        it("deve chamar o endpoint correto com os parâmetros obrigatórios", async () => {
            const trilhaMock = {disciplinas: []};
            
            api.get.mockResolvedValueOnce(trilhaMock);

            await fetchTrilha("12345", "2024.1", 5, []);

            expect(api.get).toHaveBeenCalledWith(expect.StringContaining("/aluno/12345/trilha"));
        });

        it("deve incluir semestre_inicio nos parâmetros", async () => {
            
            api.get.mockResolvedValueOnce({});

            await fetchTrilha("12345", "2024.1", 5, []);

            expect(api.get).toHaveBeenCalledWith(expect.StringContaining("semestre_inicio=2024.1"));
        });

        it("deve incluir max_disciplinas nos parâmetros", async () => {
            
            api.get.mockResolvedValueOnce({});

            await fetchTrilha("12345", "2024.1", 5, []);

            expect(api.get).toHaveBeenCalledWith(expect.StringContaining("max_disciplinas=5"));
        });

        it("deve incluir horarios_bloqueados nos parâmetros", async () => {
            
            api.get.mockResolvedValueOnce({});

            await fetchTrilha("12345", "2024.1", 5, ["seg-manha", "terc-tarde"]);

            const urlChamada = api.get.mock.calls[0][0]
            expect(urlChamada).toContain("horarios_bloqueados=seg-manha");
            expect(urlChamada).toContain("horarios_bloqueados=tec-tarde");
        });

        it("deve funcionar sem horarios bloqueados", async () => {
            
            api.get.mockResolvedValueOnce({});

            await expect(fetchTrilha("12345", "2024.1", 5, [])).resolves.not.toThrow();
        });

        it("deve codificar a matrícula na URL", async () => {
            
            api.get.mockResolvedValueOnce({});

            await fetchTrilha("123/45", "2024.1", 5, []);

            expect(api.get).toHaveBeenCalledWith(expect.stringContaining("123%2F45"));
        });

        it("deve retornar dados da trilha corretamente", async () => {

            const trilhaMock = {
                disciplinas: [
                    {id: 1, nome: "Cálculo I", semestre: 1},
                    {id: 2, nome: "Cálculo II", semestre: 2},
                ],
            };
            
            api.get.mockResolvedValueOnce({});

            const resultado = await fetchTrilha("12345", "2024.1", 5, []);

            expect(resultado).toEqual(trilhaMock);
        });

        it("deve propagar erro quando a requisição falhar", async () => {
            api.get.mockRejectedValueOnce(new Error("Erro de conexão"));

            await expect(fetchTrilha("12345", "2024.1", 5, [])).rejects.toThrow("Erro de conexão");
        });
    });
});
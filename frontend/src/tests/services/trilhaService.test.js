/**
 * Testes unitários do módulo "trilhaService".
 * Verifica se "fetchTrilha" monta a URL/query string corretamente (matrícula, semestre de início, máximo de disciplinas e horários
 * bloqueados) e repassa corretamente os retornos/erros de "api.get", sem depender de uma requisição de rede real.
 */
import {describe, it, expect, vi, afterEach} from "vitest";
import {fetchTrilha} from "../../services/trilhaService";
import {api} from "../../services/api";

/**
 * Substitui o módulo real "services/api" por uma versão mockada, isolando "trilhaService" da implementação real de "api" (que depende
 * do "fetch" do navegador).
 *
 * @returns {{api: {get: import("vitest").Mock}}}
 */
vi.mock("../../services/api", () => ({
    api: {
        get: vi.fn(),
    },
}));

describe("trilhaService", () => {
    /**
     * Depois de cada teste, limpa o histórico de chamadas e os valores configurados (mockResolvedValueOnce/mockRejectedValueOnce) dos mocks.
     */
    afterEach(() => {
        vi.clearAllMocks();
    });

    /**
     * Testes da função fetchTrilha(matricula, semestreInicio, maxDisciplinas, horariosBloqueados),
     * responsável por buscar a trilha (grade sugerida de disciplinas) de um aluno específico.
     */
    describe("fetchTrilha", () => {
        /**
         * Confirma que a URL base do endpoint inclui a matrícula do aluno no caminho (path), no formato "/aluno/{matricula}/trilha".
         */
        it("deve chamar o endpoint correto com os parâmetros obrigatórios", async () => {
            const trilhaMock = {disciplinas: []};

            api.get.mockResolvedValueOnce(trilhaMock);

            await fetchTrilha("12345", "2024.1", 5, []);

            expect(api.get).toHaveBeenCalledWith(expect.stringContaining("/aluno/12345/trilha"));
        });

        /**
         * Confirma que o parâmetro "semestre_inicio" é incluído corretamente na query string da URL.
         */
        it("deve incluir semestre_inicio nos parâmetros", async () => {

            api.get.mockResolvedValueOnce({});

            await fetchTrilha("12345", "2024.1", 5, []);

            expect(api.get).toHaveBeenCalledWith(expect.stringContaining("semestre_inicio=2024.1"));
        });

        /**
         * Confirma que o parâmetro "max_disciplinas" é incluído corretamente na query string da URL.
         */
        it("deve incluir max_disciplinas nos parâmetros", async () => {

            api.get.mockResolvedValueOnce({});

            await fetchTrilha("12345", "2024.1", 5, []);

            expect(api.get).toHaveBeenCalledWith(expect.stringContaining("max_disciplinas=5"));
        });

        /**
         * Confirma que, quando há horários bloqueados, cada um deles aparece como uma entrada separada (horarios_bloqueados=valor)
         * na query string — não como uma lista concatenada em um único valor.
         */
        it("deve incluir horarios_bloqueados nos parâmetros", async () => {

            api.get.mockResolvedValueOnce({});

            await fetchTrilha("12345", "2024.1", 5, ["seg-manha", "ter-tarde"]);

            const urlChamada = api.get.mock.calls[0][0];
            expect(urlChamada).toContain("horarios_bloqueados=seg-manha");
            expect(urlChamada).toContain("horarios_bloqueados=ter-tarde");
        });

        /**
         * Caso de borda: array de horários bloqueados vazio não deveria impedir a função de completar normalmente.
         */
        it("deve funcionar sem horarios bloqueados", async () => {

            api.get.mockResolvedValueOnce({});

            await expect(fetchTrilha("12345", "2024.1", 5, [])).resolves.toBeDefined();
        });

        /**
         * Confirma que caracteres especiais na matrícula (aqui, uma barra "/") são corretamente codificados via encodeURIComponent (ou equivalente)
         * antes de compor a URL — evitando que a barra seja interpretada como separador de rota.
         */
        it("deve codificar a matrícula na URL", async () => {

            api.get.mockResolvedValueOnce({});

            await fetchTrilha("123/45", "2024.1", 5, []);

            expect(api.get).toHaveBeenCalledWith(expect.stringContaining("123%2F45"));
        });

        /**
         * Confirma que o retorno de "api.get" (a trilha já processada pelo backend) é devolvido por "fetchTrilha" sem nenhuma
         * transformação adicional.
         */
        it("deve retornar dados da trilha corretamente", async () => {

            const trilhaMock = {
                disciplinas: [
                    {id: 1, nome: "Cálculo I", semestre: 1},
                    {id: 2, nome: "Cálculo II", semestre: 2},
                ],
            };

            api.get.mockResolvedValueOnce(trilhaMock);

            const resultado = await fetchTrilha("12345", "2024.1", 5, []);

            expect(resultado).toEqual(trilhaMock);
        });

        /**
         * Caminho de erro: garante que falhas em "api.get" (rede/backend) sejam propagadas por "fetchTrilha", em vez de serem silenciadas.
         */
        it("deve propagar erro quando a requisição falhar", async () => {
            api.get.mockRejectedValueOnce(new Error("Erro de conexão"));

            await expect(fetchTrilha("12345", "2024.1", 5, [])).rejects.toThrow("Erro de conexão");
        });
    });
});
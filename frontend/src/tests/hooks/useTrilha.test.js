/**
 * Testes unitários do hook "useTrilha".
 * Verifica a lógica de estado do hook (trilha, loading, erro) e sua integração com "trilhaService.fetchTrilha" — que é mockado aqui,
 * isolando o hook de requisições de rede reais. Diferente dos testes de "Trilha.test.jsx" (que mockam o hook inteiro para testar a UI),
 * este arquivo testa o hook em si, isoladamente, usando renderHook.
 */
import {describe, it, expect, vi, afterEach} from "vitest";
import {renderHook, act} from "@testing-library/react";
import {useTrilha} from "../../hooks/useTrilha";

/**
 * Substitui o módulo real "trilhaService" por uma versão mockada, isolando o hook da implementação real de "fetchTrilha" (que por
 * sua vez depende de "api"/"fetch").
 *
 * @returns {{fetchTrilha: import("vitest").Mock}}
 */
vi.mock("../../services/trilhaService", () => ({
    fetchTrilha: vi.fn(),
}));

// Import feito DEPOIS do vi.mock acima só por organização/leitura —
// não afeta o funcionamento, já que chamadas a vi.mock(...) são
// automaticamente "içadas" (hoisted) pelo Vitest para o topo do
// arquivo, antes de qualquer import, independentemente de onde
// estejam escritas no código-fonte.
import {fetchTrilha} from "../../services/trilhaService";

describe("useTrilha", () => {
    /**
     * Depois de cada teste, limpa o histórico de chamadas e os valores configurados (mockResolvedValueOnce/mockRejectedValueOnce/
     * mockImplementationOnce) do "fetchTrilha" mockado.
     */
    afterEach(() => {
        vi.clearAllMocks();
    });

    /**
     * Confirma o estado inicial do hook, antes de qualquer chamada a "gerarTrilha": nenhuma trilha carregada, sem loading, sem erro.
     */
    it("deve iniciar com estados vazios", () => {
        const {result} = renderHook(() => useTrilha());

        expect(result.current.trilha).toBeNull();
        expect(result.current.loading).toBe(false);
        expect(result.current.erro).toBeNull();
    });

    /**
     * Validação de entrada: sem matrícula, o hook deve recusar a requisição antes mesmo de chamar "fetchTrilha", definindo uma
     * mensagem de erro amigável.
     */
    it("deve definir erro quando a matrícula não for informada", async () => {
        const {result} = renderHook(() => useTrilha());

        await act(async () => {
            await result.current.gerarTrilha("", "2024.1", 5, []);
        });

        expect(result.current.erro).toBe("Informe a matrícula e o semestre de início.");
        expect(fetchTrilha).not.toHaveBeenCalled();
    });

    /**
     * Mesma validação de entrada, agora para o semestre de início vazio.
     */
    it("deve definir erro quando semestre não for informado", async () => {
        const {result} = renderHook(() => useTrilha());

        await act(async () => {
            await result.current.gerarTrilha("12345", "", 5, []);
        });

        expect(result.current.erro).toBe("Informe a matrícula e o semestre de início.");
        expect(fetchTrilha).not.toHaveBeenCalled();
    });

    /**
     * Confirma que "loading" fica "true" enquanto a Promise de "fetchTrilha" ainda não foi resolvida. Usa uma Promise controlada
     * manualmente (guardando "resolvePromise") para conseguir observar o estado intermediário de carregamento, antes de deixar a
     * requisição terminar.
     */
    it("deve definir loading como true durante a requisição", async () => {
        let resolvePromise;
        fetchTrilha.mockImplementationOnce(
            () => new Promise((resolve) => { resolvePromise = resolve; })
        );

        const {result} = renderHook(() => useTrilha());

        // "act" aqui NÃO é aguardado (sem await) de propósito: queremos
        // capturar o estado logo após a parte SÍNCRONA de "gerarTrilha"
        // rodar (que já deve ter setado loading=true), sem esperar a
        // Promise (ainda pendente) terminar.
        act(() => {
            result.current.gerarTrilha("12345", "2024.1", 5, []);
        });

        expect(result.current.loading).toBe(true);

        // Só agora resolvemos a Promise manualmente, permitindo que
        // "gerarTrilha" complete e o hook volte a loading=false.
        await act(async () => { resolvePromise({}); });
    });

    /**
     * Caso de sucesso: confirma que, após uma requisição bem-sucedida, "trilha" é preenchida com os dados retornados, "loading" volta
     * a "false" e "erro" permanece nulo.
     */
    it("deve carregar a trilha com sucesso", async () => {
        const trilhaMock = {
            disciplinas: [
                {id: 1, nome: "Cálculo I", semestre: 1},
                {id: 2, nome: "Cálculo II", semestre: 2},
            ],
        };
        fetchTrilha.mockResolvedValueOnce(trilhaMock);

        const {result} = renderHook(() => useTrilha());

        await act(async () => {
            await result.current.gerarTrilha("12345", "2024.1", 5, []);
        });

        expect(result.current.trilha).toEqual(trilhaMock);
        expect(result.current.loading).toBe(false);
        expect(result.current.erro).toBeNull();
    });

    /**
     * Caminho de erro: confirma que uma falha em "fetchTrilha" é capturada pelo hook, preenchendo "erro" com a mensagem da
     * exceção, mantendo "trilha" nula e "loading" em false.
     */
    it("deve definir erro quando a requisição falhar", async () => {
        fetchTrilha.mockRejectedValueOnce(new Error("Erro de conexão"));

        const {result} = renderHook(() => useTrilha());

        await act(async () => {
            await result.current.gerarTrilha("12345", "2024.1", 5, []);
        });

        expect(result.current.erro).toBe("Erro de conexão");
        expect(result.current.trilha).toBeNull();
        expect(result.current.loading).toBe(false);
    });

    /**
     * Confirma o comportamento em duas chamadas seguidas de "gerarTrilha": primeiro uma bem-sucedida, depois uma que falha —
     * o estado final deve refletir só a ÚLTIMA chamada (trilha nula, erro presente), sem misturar resquícios da chamada anterior.
     *
     * OBS: o nome do teste sugere verificar que "trilha"/"erro" são resetados logo no INÍCIO da nova requisição (antes dela terminar),
     * mas as asserções aqui só checam o estado FINAL, após a segunda chamada já ter sido concluída — não há uma verificação do estado
     * intermediário (ex: capturar se "trilha" já volta a null assim que "gerarTrilha" começa a rodar, similar ao teste de "loading").
     */
    it("deve resetar trilha e erro antes da nova requisição", async () => {
        fetchTrilha.mockResolvedValueOnce({disciplinas: []});

        const {result} = renderHook(() => useTrilha());

        await act(async () => {
            await result.current.gerarTrilha("12345", "2024.1", 5, []);
        });

        fetchTrilha.mockRejectedValueOnce(new Error("Erro"));

        await act(async () => {
            await result.current.gerarTrilha("12345", "2024.1", 5, []);
        });

        expect(result.current.trilha).toBeNull();
        expect(result.current.erro).toBe("Erro");
    });

    /**
     * Confirma que "gerarTrilha" repassa exatamente os mesmos argumentos recebidos (matrícula, semestre, máximo de disciplinas,
     * horários bloqueados) para "fetchTrilha", sem nenhuma transformação.
     */
    it("deve passar os parâmetros corretos para o fetchTrilha", async () => {
        fetchTrilha.mockResolvedValueOnce({});

        const {result} = renderHook(() => useTrilha());
        const horariosBloqueados = ["seg-manha", "ter-tarde"];

        await act(async () => {
            await result.current.gerarTrilha("12345", "2024.1", 5, horariosBloqueados);
        });

        expect(fetchTrilha).toHaveBeenCalledWith("12345", "2024.1", 5, horariosBloqueados);
    });
});
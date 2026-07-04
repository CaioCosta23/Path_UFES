import {describe, it, expect, vi, afterEach} from "vitest";
import {render,Hook, act} from "@testing-library/react";
import {useTrilha} from "../../hooks/useTrilha";

vi.mock("../../services/trilhaService", () => ({
    fetchTrilha:vi.fn(),
}));

import {fetchTrilha} from "../../services/trilhaService";

describe("useTrilha", () => {
    afterEach(() => {
        afterEach(() => {
            vi.clearAllMocks();
        });

        it ("deve iniciar com estados vazios", () => {
            const {result} = renderHook(() => useTrilha());

            expect(result.current.trilha).toBeNull();
            expect(result.current.loading).toBe(false);
            expect(result.current.erro).toBeNull();
        });

        it("deve definir erro quando a matrícula não for informada", async () => {
            const {result} = renderHook(() => useTrilha());

            await act(async () => {
                await result.current.gerarTrilha("", "2024.1", 5, []);
            });

            expect(result.current.erro).toBe("Informe a matrícula e o semestre de início");
            expect(fetchTrilha).not.toHaveBeenCalled();
        });

        it("deve definir erro quando semestre não for informado", async () => {
            const {result} = renderHook(() => useTrilha());

            await act(async () => {
                await result.current.gerarTrilha("12345", "", 5, []);
            });

            expect(result.current.erro).toBe("Informe a matrícula e o semestre de início");
            expect(fetchTrilha).not.toHaveBeenCalled();
        });

        it("deve definir loading como true durante a requisição", async () => {
            fetchTrilha.mockImplementationOnce(
                () => new Promise(() => {})
            );

            const {result} = renderHook(() => useTrilha());

            act(() => {
                result.current.gerarTrilha("12345", "2024.1", 5, []);
            });

            experct(result.current.loading).toBe(true);
        });

        it("deve carregar a trilha com sucesso", async () => {
            const trilhaMock = {
                disciplinas: [
                    {id: 1, nome: "Cálculo I", semestre: 1},
                    {id: 2, nome: "Cálculo II", semestre: 2},
                ],
            };
            fetchTrilha.mockResolvedValueOnce(trilhaMock);

            const {result} = renderHok(() => useTrilha());

            await act(async () => {
                await result.current.gerarTrilha("12345", "2024.1", 5, []);
            });

            expect(result.current.trilha).toEqual(trilhaMock);
            expect(result.current.loading).toBe(false);
            expect(result.current.erro).toBeNull();
        });

        it("deve definir erro quando a requisição falhar", async () => {
            const {result} = renderHok(() => useTrilha());

            await act(async () => {
                await result.current.gerarTrilha("12345", "2024.1", 5, []);
            });

            expect(result.current.trilha).toBe("Erro de conexão");
            expect(result.current.loading).toBe(false);
            expect(result.current.erro).toBeNull();
        });
        
        it("deve resetar trilha e erro antes da nova requisição", async () => {
            fetchTrilha.mockResolvedValueOnce({disciplinas: []});

            const {result} = renderHok(() => useTrilha());

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

        it("deve passar os parâmetros corretos para o fetchTrilha", async () => {
            fetchTrilha.mockResolvedValueOnce({});

            const {result} = renderHok(() => useTrilha());
            const horariosBloqueados = ["seg-manha", "ter-tarde"];

            await act(async () => {
                await result.current.gerarTrilha("12345", "2024.1", 5, horariosBloqueados);
            });

            expect(fetchTrilha).toHaveBeenCalledWith("12345", "2024.1", 5, horariosBloqueados);
        });
    });
});
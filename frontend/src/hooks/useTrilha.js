import {useState} from "react";
import {fetchTrilha} from "../services/trilhaService";

/**
 * Hook que gerencia o estado da geração de trilha acadêmica: dispara a
 * requisição ao backend, guarda o resultado e trata estados de carregamento e erro.
 *
 * @returns {{
 *   trilha: Object|null,
 *   loading: boolean,
 *   erro: string|null,
 *   gerarTrilha: (matricula: string, semestre: string, maxDisc: number, horariosBloqueados: string[]) => Promise<void>
 * }} Estado da trilha e função para gerá-la.
 */
export function useTrilha() {
    const [trilha, setTrilha] = useState(null);
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState(null);

    /**
     * Solicita ao backend a trilha acadêmica ideal com base nas preferências informadas.
     *
     * @param {string} matricula Matrícula do aluno.
     * @param {string} semestre Semestre de início (ex.: "2026/2").
     * @param {number} maxDisc Número máximo de disciplinas por semestre.
     * @param {string[]} horariosBloqueados Lista de horários indisponíveis para o aluno.
     */
    const gerarTrilha = async (matricula, semestre, maxDisc, horariosBloqueados) => {
        if (!matricula || !semestre) {
            setErro("Informe a matrícula e o semestre de início.");
            return;
        }
        setLoading(true);
        setErro(null);
        setTrilha(null);
        try {
            const data = await fetchTrilha(matricula, semestre, maxDisc, horariosBloqueados);
            setTrilha(data);
        } catch (err) {
            setErro(err.message);
        } finally {
            setLoading(false);
        }
    };

    return {trilha, loading, erro, gerarTrilha};
}

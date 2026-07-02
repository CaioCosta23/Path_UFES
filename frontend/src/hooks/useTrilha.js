import {useState} from "react";
import {fetchTrilha} from "../services/trilhaService";

export function useTrilha() {
    const [trilha, setTrilha] = useState(null);
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState(null);

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

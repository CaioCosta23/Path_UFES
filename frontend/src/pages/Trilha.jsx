import {useState} from "react";
import {useTrilha} from "../hooks/useTrilha";
import styles from "../styles/Trilha.module.css";

const DIAS = [
    {value: "SEGUNDA", label: "Seg"},
    {value: "TERCA",   label: "Ter"},
    {value: "QUARTA",  label: "Qua"},
    {value: "QUINTA",  label: "Qui"},
    {value: "SEXTA",   label: "Sex"},
];

const HORARIOS = [
    {value: "H07_08", label: "07h"},
    {value: "H08_09", label: "08h"},
    {value: "H09_10", label: "09h"},
    {value: "H10_11", label: "10h"},
    {value: "H11_12", label: "11h"},
    {value: "H12_13", label: "12h"},
    {value: "H13_14", label: "13h"},
    {value: "H14_15", label: "14h"},
    {value: "H15_16", label: "15h"},
    {value: "H16_17", label: "16h"},
    {value: "H17_18", label: "17h"},
    {value: "H18_19", label: "18h"},
];

const DIA_LABELS = {
    SEGUNDA: "Seg", TERCA: "Ter", QUARTA: "Qua", QUINTA: "Qui", SEXTA: "Sex",
};

function formatarAulas(aulas) {
    if (!aulas || aulas.length === 0) return null;
    return aulas.map(({dias, horarios}) => {
        const diasLabel = dias.map((d) => DIA_LABELS[d] ?? d).join("/");
        const sorted    = [...horarios].sort();
        const inicio    = sorted[0].slice(1, 3);      // "H07_08" → "07"
        const fim       = sorted.at(-1).slice(4, 6);  // "H08_09" → "09"
        return `${diasLabel} ${inicio}-${fim}h`;
    }).join(", ");
}

export default function Trilha() {
    const {trilha, loading, erro, gerarTrilha} = useTrilha();

    const [matricula, setMatricula] = useState(
        () => localStorage.getItem("pathufes_matricula") || ""
    );
    const [semestre, setSemestre]                     = useState("2026/2");
    const [maxDisc, setMaxDisc]                       = useState(5);
    const [horariosBloqueados, setHorariosBloqueados] = useState([]);
    const [semestresRestricao, setSemestresRestricao] = useState(""); // "2026/2" ou "2026/2, 2027/1"

    const toggleHorario = (dia, hora) => {
        const key = `${dia}:${hora}`;
        setHorariosBloqueados((prev) =>
            prev.includes(key) ? prev.filter((h) => h !== key) : [...prev, key]
        );
    };

    const handleGerar = (e) => {
        e.preventDefault();
        const semestres = semestresRestricao
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
        const bloqueados =
            semestres.length === 0
                ? horariosBloqueados                                        // global: "DIA:HORARIO"
                : semestres.flatMap((sem) =>
                      horariosBloqueados.map((h) => `${sem}:${h}`)         // específico: "SEM:DIA:HORARIO"
                  );
        gerarTrilha(matricula, semestre, maxDisc, bloqueados);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Trilha Acadêmica</h1>
                <p className={styles.subtitle}>
                    Configure suas preferências e veja a sequência ideal de disciplinas
                    para concluir o curso no menor número de semestres.
                </p>
            </div>

            {/* Formulário de preferências */}
            <form className={styles.form} onSubmit={handleGerar}>
                <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Matrícula</label>
                        <input
                            className={styles.input}
                            type="text"
                            placeholder="ex: 2023100265"
                            value={matricula}
                            onChange={(e) => setMatricula(e.target.value)}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Semestre de início</label>
                        <input
                            className={styles.input}
                            type="text"
                            placeholder="ex: 2026/2"
                            value={semestre}
                            onChange={(e) => setSemestre(e.target.value)}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>
                            Máx. disciplinas por semestre: <strong>{maxDisc}</strong>
                        </label>
                        <input
                            className={styles.range}
                            type="range"
                            min="1"
                            max="10"
                            value={maxDisc}
                            onChange={(e) => setMaxDisc(Number(e.target.value))}
                        />
                        <div className={styles.rangeLabels}>
                            <span>1</span><span>10</span>
                        </div>
                    </div>

                    {/* Grade de horários bloqueados — ocupa toda a largura */}
                    <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                        <label className={styles.label}>
                            Horários que não posso ter aula
                            {horariosBloqueados.length > 0 && (
                                <span className={styles.bloqueadosCount}>
                                    {horariosBloqueados.length} bloqueado(s)
                                </span>
                            )}
                        </label>
                        <div className={styles.scheduleWrapper}>
                            <table className={styles.scheduleTable}>
                                <thead>
                                    <tr>
                                        <th></th>
                                        {HORARIOS.map(({value, label}) => (
                                            <th key={value} className={styles.scheduleHoraTh}>
                                                {label}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {DIAS.map(({value: dia, label: diaLabel}) => (
                                        <tr key={dia}>
                                            <td className={styles.scheduleDia}>{diaLabel}</td>
                                            {HORARIOS.map(({value: hora}) => {
                                                const key     = `${dia}:${hora}`;
                                                const blocked = horariosBloqueados.includes(key);
                                                return (
                                                    <td key={hora} className={styles.scheduleCell}>
                                                        <button
                                                            type="button"
                                                            className={`${styles.scheduleBtn} ${blocked ? styles.scheduleBtnBlocked : ""}`}
                                                            onClick={() => toggleHorario(dia, hora)}
                                                            title={`${diaLabel} ${hora.slice(1, 3)}:00`}
                                                        />
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {horariosBloqueados.length > 0 && (
                            <button
                                type="button"
                                className={styles.limparBtn}
                                onClick={() => setHorariosBloqueados([])}
                            >
                                Limpar seleção
                            </button>
                        )}
                    </div>

                    {/* Campo de semestres — aparece só quando há slots bloqueados */}
                    {horariosBloqueados.length > 0 && (
                        <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                            <label className={styles.label}>
                                Aplicar restrição apenas nestes semestres (opcional)
                            </label>
                            <input
                                className={styles.input}
                                type="text"
                                placeholder="ex: 2026/2  ou  2026/2, 2027/1"
                                value={semestresRestricao}
                                onChange={(e) => setSemestresRestricao(e.target.value)}
                            />
                            <span className={styles.fieldHint}>
                                Deixe em branco para bloquear em <strong>todos</strong> os semestres.
                            </span>
                        </div>
                    )}
                </div>

                <button
                    className={styles.button}
                    type="submit"
                    disabled={loading}
                >
                    {loading ? "Calculando..." : "Gerar Trilha"}
                </button>
            </form>

            {/* Erros */}
            {erro && (
                <p className={styles.erro}>Erro: {erro}</p>
            )}

            {/* Resultados */}
            {trilha && (
                <div className={styles.resultado}>
                    <div className={styles.resumo}>
                        <p>
                            Trilha gerada: <strong>{trilha.semestres.length} semestres</strong> até
                            a formatura — matrícula <strong>{trilha.matricula}</strong>.
                        </p>
                        <p className={styles.resumoOpt}>
                            {trilha.optativas_faltantes === 0
                                ? "Optativas: todas as 9 exigidas já cumpridas."
                                : <>Faltam <strong>{trilha.optativas_faltantes}</strong> optativa(s) de 9 exigidas.</>
                            }
                        </p>
                    </div>

                    {/* Legenda */}
                    <div className={styles.legenda}>
                        <span className={`${styles.badge} ${styles.badgeOB}`}>OB</span> Obrigatória
                        <span className={`${styles.badge} ${styles.badgeOP}`}>OP</span> Optativa
                    </div>

                    <div className={styles.semestres}>
                        {trilha.semestres.map((sem) => {
                            const totalCreditos = sem.disciplinas
                                .filter((d) => d.creditos)
                                .reduce((acc, d) => acc + d.creditos, 0);

                            return (
                                <div key={sem.semestre} className={styles.semCard}>
                                    <div className={styles.semHeader}>
                                        <h2 className={styles.semTitulo}>
                                            {sem.semestre}
                                            <span className={styles.semTipo}>
                                                {sem.tipo === "IMPAR" ? "Ímpar" : "Par"}
                                            </span>
                                        </h2>
                                        <span className={styles.semCreditos}>
                                            {totalCreditos} créditos obrigatórios
                                        </span>
                                    </div>

                                    <table className={styles.tabela}>
                                        <thead>
                                            <tr>
                                                <th>Código</th>
                                                <th>Disciplina</th>
                                                <th>Créd.</th>
                                                <th>Horários</th>
                                                <th>Tipo</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sem.disciplinas.map((disc, i) => {
                                                const horarioLabel = formatarAulas(disc.aulas);
                                                return (
                                                    <tr
                                                        key={disc.codigo || `op-${i}`}
                                                        className={disc.codigo ? "" : styles.rowOptativa}
                                                    >
                                                        <td className={styles.tdCodigo}>
                                                            {disc.codigo ?? "—"}
                                                        </td>
                                                        <td>{disc.nome}</td>
                                                        <td>{disc.creditos ?? "—"}</td>
                                                        <td className={styles.tdHorario}>
                                                            {horarioLabel ?? "—"}
                                                        </td>
                                                        <td>
                                                            <span
                                                                className={`${styles.badge} ${
                                                                    disc.tipo_disciplina === "OB"
                                                                        ? styles.badgeOB
                                                                        : styles.badgeOP
                                                                }`}
                                                            >
                                                                {disc.tipo_disciplina}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>

                                    {sem.optativas_previstas.length > 0 && (
                                        <div className={styles.optativas}>
                                            <p className={styles.optativasLabel}>
                                                Optativas disponíveis neste semestre:
                                            </p>
                                            <ul className={styles.optativasList}>
                                                {sem.optativas_previstas.map((op) => (
                                                    <li key={op.codigo}>
                                                        {op.nome}
                                                        <span className={styles.optativasCreditos}>
                                                            {op.creditos} cr.
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

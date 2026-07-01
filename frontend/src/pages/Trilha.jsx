import {useState} from "react";
import {useTrilha} from "../hooks/useTrilha";
import styles from "../styles/Trilha.module.css";

const DIAS = [
    {value: "SEGUNDA", label: "Segunda"},
    {value: "TERCA",   label: "Terça"},
    {value: "QUARTA",  label: "Quarta"},
    {value: "QUINTA",  label: "Quinta"},
    {value: "SEXTA",   label: "Sexta"},
];

export default function Trilha() {
    const {trilha, loading, erro, gerarTrilha} = useTrilha();

    const [matricula, setMatricula] = useState(
        () => localStorage.getItem("pathufes_matricula") || ""
    );
    const [semestre, setSemestre] = useState("2026/2");
    const [maxDisc, setMaxDisc] = useState(5);
    const [diasBloqueados, setDiasBloqueados] = useState([]);

    const toggleDia = (dia) => {
        setDiasBloqueados((prev) =>
            prev.includes(dia) ? prev.filter((d) => d !== dia) : [...prev, dia]
        );
    };

    const handleGerar = (e) => {
        e.preventDefault();
        gerarTrilha(matricula, semestre, maxDisc, diasBloqueados);
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

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Dias que não posso ter aula</label>
                        <div className={styles.checkboxGroup}>
                            {DIAS.map(({value, label}) => (
                                <label key={value} className={styles.checkboxLabel}>
                                    <input
                                        type="checkbox"
                                        checked={diasBloqueados.includes(value)}
                                        onChange={() => toggleDia(value)}
                                    />
                                    {label}
                                </label>
                            ))}
                        </div>
                    </div>
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
                    <p className={styles.resumo}>
                        Trilha gerada: <strong>{trilha.semestres.length} semestres</strong> até a
                        formatura para a matrícula <strong>{trilha.matricula}</strong>.
                    </p>

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
                                                <th>Tipo</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sem.disciplinas.map((disc, i) => (
                                                <tr
                                                    key={disc.codigo || `op-${i}`}
                                                    className={disc.codigo ? "" : styles.rowOptativa}
                                                >
                                                    <td className={styles.tdCodigo}>
                                                        {disc.codigo ?? "—"}
                                                    </td>
                                                    <td>{disc.nome}</td>
                                                    <td>{disc.creditos ?? "—"}</td>
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
                                            ))}
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

import {useState} from "react"
import {useGrafo} from "../hooks/useGrafo";
import styles from "../styles/GrafoViewer.module.css"
import Sidebar from "./Sidebar";

export default function GrafoViewer() {
    const {
        containerRef,
        nos,
        arestas,
        elementoSelecionado,
        loading,
        erro,
        adicionarNo,
        adicionarAresta,
        carregarDePdf,
        carregarGrafo,
        carregarDoBackend,
        removerSelecionado,
        limparGrafo,
        reorganizarLayout,
    } = useGrafo();

    const [noId, setNoId] = useState("");
    const [noLabel, setNoLabel] = useState("");
    const [arestaSource, setArestaSource] = useState("");
    const [arestaTarget, setArestaTarget] = useState("");
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleAdicionarNo = () => {
        adicionarNo(noId, noLabel);
        setNoId("");
        setNoLabel("");
    };

    const handleAdicionarAresta = () => {
        adicionarAresta(arestaSource, arestaTarget)
        setArestaSource("");
        setArestaTarget("");
    }

    const handleCarregarArquivo = (event) => {
        const file = event.target.files[0];
        if (!file)
            return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const elementos = JSON.parse(e.target.result);
                carregarGrafo(elementos);
            }catch {
                /*
                console.error("Erro ao carregar arquivo:", err);
                alert(`Arquivo inválido: ${err.message}`);
                 */
                alert("Arquivo invalido. Use um JSON válido.");
            }
        };
        reader.readAsText(file);
    };

    const handleUploadPdf = (event) => {
        const file = event.target.files[0];
        if (!file)
            return;

        carregarDePdf(file);
    }

    return (
        <div className={styles.wrapper}>
            <Sidebar
                isOpen = {sidebarOpen}
                onClose = {() => setSidebarOpen(false)}
                elementoSelecionado = {elementoSelecionado}
            />
            <div className={styles.controls}>
                <button
                    className = {styles.button}
                    onClick = {() =>setSidebarOpen(true)}
                >
                    = Detalhes
                </button>
                <button
                    className={styles.button}
                    onClick={carregarDoBackend}
                    disabled={loading}
                >
                    {loading ? "Carregando ..." : "Carregar matérias"}
                </button>

                <label className = {styles.button}>
                    {loading ? "Processando..." : "Enviar PDF"}
                    <input
                        type = "file"
                        accept = ".pdf"
                        onChange = {handleUploadPdf}
                        disabled = {loading}
                        style = {{display: "none"}}
                    />
                </label>
            </div>
            {/*Barra de controles de nós*/}
            <div className={styles.controls}>
                <input
                    type = "text"
                    placeholder = "ID do nó"
                    value = {noId}
                    onChange = {(e) => setNoId(e.target.value)}
                />
                <input 
                    type = "text"
                    placeholder = "Label do nó"
                    value = {noLabel}
                    onChange = {(e) => setNoLabel(e.target.value)}
                />
                <button
                    className = {styles.button}
                    onClick = {handleAdicionarNo}
                >
                    Adicionar Aresta
                </button>
            </div>

            <div className = {styles.controls}>
                <input
                    type = "text"
                    placeholder = "Nó de origem"
                    value = {arestaSource}
                    onChange = {(e) => setArestaSource(e.target.value)}
                />
                <input
                    type = "text"
                    placeholder = "Nó de destino"
                    value = {arestaTarget}
                    onChange = {(e) => setArestaTarget(e.target.value)}
                />
                <button
                    className = {styles.button}
                    onClick = {handleAdicionarAresta}
                >
                    Adicionar Aresta
                </button>
            </div>

            {/* Barra de Controles -Ações*/}
            <div className = {styles.controls}>
                <button
                    className = {styles.button}
                    onClick = {reorganizarLayout}
                >
                    Reorganizar
                </button>
                <button
                    className = {styles.button}
                    onClick = {removerSelecionado}
                >
                    Remover Selecionado
                </button>
                <button
                    className = {`${styles.button} ${styles.buttonDanger}`}
                    onClick = {limparGrafo}
                >
                    Limpar Grafo
                </button>
                <label className = {styles.button}>
                    Carregar JSON
                    <input
                        type = "file"
                        accept = ".json"
                        onChange = {handleCarregarArquivo}
                        style = {{display: "none"}}
                    />
                </label>
            </div>
            {/*Area do Grafo */}
            <div ref = {containerRef} className = {styles.container}/>

            {/*Painel de informações */}
            <div className = {styles.info}>
                {erro && (
                    <p style = {{color: "var(--color-error)"}}>
                        Erro: {erro}
                    </p>
                )}
                {elementoSelecionado ? (
                    <p>
                        Selecionado: <strong>{elementoSelecionado.label || elementoSelecionado.id}</strong>
                        {elementoSelecionado.source && (
                            <span> | Origem: {elementoSelecionado.source} ---| Destino: {elementoSelecionado.target}</span>
                        )}
                    </p>
                ) : (
                    <p>Nós: {nos.length} | Arestas: {arestas.length} | Clieque em um elemento para ver detalhes</p>
                
                )}
            </div>
        </div>
    );
}
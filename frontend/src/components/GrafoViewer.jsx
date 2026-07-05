/**
 * Importa bibliotecas React e outros componentes personalizados, criados para auxiliar a configuração de visualização do grafo;
 */
import {useState} from "react"
import {useGrafo} from "../hooks/useGrafo";
import styles from "../styles/GrafoViewer.module.css"
import Sidebar from "./Sidebar";

/**
 * Cria (exporta para a página) o viisualizador do grafo;
 * 
 * @returns {import("react").ReactElement} Elemento React representando o componente de visualização do grafo;
 */
export default function GrafoViewer() {
    /**
     * Monta uma instância (que utiliza as ferramentas do Cytoscape que estão alocadas no arquivo "useGrafo.js") criando uma "objeto" (estraindo cada função separadamente);
     */
    const {
        containerRef,
        nos,
        arestas,
        elementoSelecionado,
        alunoImportado,
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

    // Cria par de valores ("estados") usados na interface do componente;
    const [noId, setNoId] = useState("");
    const [noLabel, setNoLabel] = useState("");
    const [arestaSource, setArestaSource] = useState("");
    const [arestaTarget, setArestaTarget] = useState("");
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Cria um nó do grafo;
    const handleAdicionarNo = () => {
        adicionarNo(noId, noLabel);
        setNoId("");
        setNoLabel("");
    };

    //Cria uma aresa do grafo
    const handleAdicionarAresta = () => {
        adicionarAresta(arestaSource, arestaTarget)
        setArestaSource("");
        setArestaTarget("");
    }

    // Carrega um arquivo (geralmente em formato "JSON");
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
                alert("Arquivo invalido. Use um JSON válido.");
            }
        };
        reader.readAsText(file);
    };

    // Carrega um arquivo PDF (para enviar ao backend);
    const handleUploadPdf = (event) => {
        const file = event.target.files[0];
        if (!file)
            return;

        carregarDePdf(file);
    }

    /**
     * Retorno para a função do arquivo (com os dados
     * coletados e tratados à partir dos arquivos auxiliares);
     */
    return (
        <div className={styles.wrapper}>
            <Sidebar
                isOpen = {sidebarOpen}
                onClose = {() => setSidebarOpen(false)}
                elementoSelecionado = {elementoSelecionado}
            />
            
            {/**Botão (controles que abrem a "sidebar") */}
            <div className={styles.controls}>
                <button
                    className = {styles.button}
                    onClick = {() =>setSidebarOpen(true)}
                >
                    = Detalhes
                </button>
                
                {/**Botão que busca  o grafo do backend */}
                <button
                    className={styles.button}
                    onClick={carregarDoBackend}
                    disabled={loading}
                >
                    {loading ? "Carregando ..." : "Carregar matérias"}
                </button>
                
                {/**
                 * Componete estilizável (usado no navegador)
                 * para receber um PDF e "processá-lo" */}
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
                {/** Campo de formulário da página de grafo*/}
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
                    Adicionar Nó
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
                {/**Chamada de componentes (para reorganizar a
                 * estética/ parência) da página dos grafos*/}
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
            {/**Area do Grafo:
            //  * Contém uma "âncora" (onde o Cytoscape.js desenha o grafo)
             */}
            <div ref = {containerRef} className = {styles.container}/>

            {/* Legenda (estilização) de cores dos nós */}
            <div className = {styles.info} style={{display: "flex", gap: "1.5rem", flexWrap: "wrap", fontSize: "0.8rem"}}>
                <span><span style={{display:"inline-block", width:10, height:10, borderRadius:"50%", background:"#10b981", marginRight:4}}/>Cursada</span>
                <span><span style={{display:"inline-block", width:10, height:10, borderRadius:"50%", background:"#4f46e5", marginRight:4}}/>Disponível</span>
                <span><span style={{display:"inline-block", width:10, height:10, borderRadius:"50%", background:"#94a3b8", marginRight:4}}/>Bloqueada</span>
                <span style={{color: "var(--color-text-muted)"}}>
                    (carregue o grafo com sua matrícula para ver o status)
                </span>
            </div>

            {/*Painel de informações */}
            <div className = {styles.info}>
                {erro && (
                    <p style = {{color: "var(--color-error)"}}>
                        Erro: {erro}
                    </p>
                )}
                {alunoImportado && (
                    <p style = {{color: "var(--color-success, green)"}}>
                        Histórico importado: <strong>{alunoImportado.nome}</strong>
                        {" "}(matrícula: {alunoImportado.matricula}) —{" "}
                        {alunoImportado.disciplinas_importadas} disciplinas salvas.
                    </p>
                )}
                {/**Operação ternária (semelhante a um "if/else") que verica se o usuário clicou em algo  */}
                {elementoSelecionado ? (
                    <p>
                        Selecionado: <strong>{elementoSelecionado.label || elementoSelecionado.id}</strong>
                        {elementoSelecionado.source && (
                            <span> | Origem: {elementoSelecionado.source} ---| Destino: {elementoSelecionado.target}</span>
                        )}
                    </p>
                ) : (
                    <p>Nós: {nos.length} | Arestas: {arestas.length} | Clique em um elemento para ver detalhes</p>
                
                )}
            </div>
        </div>
    );
}
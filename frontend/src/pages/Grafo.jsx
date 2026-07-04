/**
 * Importa o módulo do visualizador do grafo e de estilização da página;
 */
import GrafoViewer from "../components/GrafoViewer";
import styles from "../styles/Grafo.module.css";

/**
 * 
 * @returns {import("react").ReactElement} Elemento React que representa a página "Grafo";
 */
export default function Grafo() {
    return (
        /**
         * "Container que contem descrição e cabeçalho de página;"
         */
        <div className = {styles.container}>
            <div className = {styles.header}>
                <h1 className = {styles.title}>Visualizador de Grafo</h1>
                <p className = {styles.subtitle}>
                    Carregue um PDF ou arquivo ".json" para visualizar a grade curricular.
                </p>
            </div>
            {/**
             * Renderiza o visualizador do grafo (utilizando as funcionalidades e propriedades utilizadas no "GrafoViewer.jsx");
             */}
            <GrafoViewer/>
        </div>
    );
}
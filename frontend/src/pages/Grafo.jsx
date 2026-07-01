import GrafoViewer from "../components/GrafoViewer";
import styles from "../styles/Grafo.module.css";

export default function Grafo() {
    return (
        <div className = {styles.container}>
            <div className = {styles.header}>
                <h1 className = {styles.title}>Visualizador de Grafo</h1>
                <p className = {styles.subtitle}>
                    Carregie um PDF ou arquivo ".json" para visualizar a grade curricular.
                </p>
            </div>
            <GrafoViewer/>
        </div>
    );
}
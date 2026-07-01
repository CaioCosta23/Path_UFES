import {Link} from "react-router-dom";
import styles from "../styles/Home.module.css"

export default function Home() {
    return (
        <div className = {styles.container}>
            <div className = {styles.hero}>
                <h1 className = {styles.title}>
                    Visualizador de Grade Curricular
                </h1>

                <p className = {styles.description}>
                    Explore as matérias e seus respectivos pré-requisitos de forma visual e interativa.
                </p>

                <Link to = "/grafo" className = {styles.button}>
                    Visualizar Grafo ----
                </Link>
            </div>

            <div className= {styles.features}>
                <div className = {styles.featureCard}>
                    <span className = {styles.featureIcon}>paper</span>
                    <h3>Upload de PDF</h3>
                    <p>Envie sua grade curricular para que o sistema extraia as matérias</p>
                </div>

                <div className = {styles.featureCard}>
                    <span className = {styles.featureIcon}>link</span>
                    <h3>Pré-Requisitos</h3>
                    <p>Visualize as conexões entre as matérias e ennteda a ordem ideal de seu currículo.</p>
                </div>

                <div className = {styles.featureCard}>
                    <span className = {styles.featureIcon}>search</span>
                    <h3>Interativo</h3>
                    <p>Clique nos nós para ver detalhes, adicione ou remova matérias manualmente.</p>
                </div>
            </div>
        </div>
    );
}
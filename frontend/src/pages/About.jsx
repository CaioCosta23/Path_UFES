/**
 * Importa a biblioteca de estilização da página "About";
 */
import styles from "../styles/About.module.css";

/**
 * Importa as imagens usadas para os avatares dos desenvolvedores na página;
 */
import fotoDev1 from "../assets/images/authors/Caio-Path_UFES.jpg"
import fotoDev2 from "../assets/images/authors/Daniel-Path_UFES.jpg"
import fotoDev3 from "../assets/images/authors/Miguel-Path_UFES.jpg"

/**
 * Declaração do componente que será exportado de forma padrão (para a renderização da página);
 * 
 * @returns {import("react").ReactElement} Elemento React representando a página "About";
 */
export default function About() {
    return (
        <div className = {styles.container}>
            {/* Sobre o projeto */}
            <section className = {styles.section}>
                <h1 className = {styles.title}>SOBRE O PROJETO</h1>
                <p>
                    Este projeto é uma ferramenta de planejamento acadêmico para alunos de Ciência da Computação da UFES, que permite visualizar disciplinas e pré-requisitos de forma interativa.
                </p>
                <p>
                    Acesse o nosso repositório <a href = "https://github.com/CaioCosta23/Path_UFES.git" target = "_blank" rel = "noopener noreferrer" className = {styles.githubLink}>GitHub.</a> para mais informações.
                </p>
            </section>

            {/*
             * Desenvolvedores:
                Seção que contém o "Container" que organiza os cards onde serão colocadas as informações dos desenvolvedores;
             */}
            <section className = {styles.section}>
                <h2 className = {styles.sectionTitle}>Desenvolvedores</h2>
                <div className = {styles.devGrid}>
                    <div className = {styles.devCard}>
                        <img src = {fotoDev1} alt = "Caio Costa Lopes" className = {styles.devAvatar}/>
                        <h3 className = {styles.devName}>Caio Costa Lopes</h3>
                    </div>
                    <div className = {styles.devCard}>
                        <img src = {fotoDev2} alt = "Daniel Sbrocco Olimpio" className = {styles.devAvatar}/>
                        <h3 className = {styles.devName}>Daniel Sbrocco Olimpio</h3>
                    </div>
                    <div className = {styles.devCard}>
                        <img src = {fotoDev3} alt = "Miguel Zon Murad" className = {styles.devAvatar}/>
                        <h3 className = {styles.devName}>Miguel Zon Murad</h3>
                    </div>
                    
                </div>
            </section>
        </div>
    );
}
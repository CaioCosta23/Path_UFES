import styles from "../styles/About.module.css";

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

            {/* Desenvolvedores */}
            <section className = {styles.section}>
                <h2 className = {styles.sectionTitle}>Desenvolvedores</h2>
                <div className = {styles.devGrid}>
                    <div className = {styles.devCard}>
                        <div className = {styles.devAvatar}>avatar</div>
                        <h3 className = {styles.devName}>Caio Costa Lopes</h3>
                    </div>
                    <div className = {styles.devCard}>
                        <div className = {styles.devAvatar}>avatar</div>
                        <h3 className = {styles.devName}>Daniel Sbrocco Olimpio</h3>
                    </div>
                    <div className = {styles.devCard}>
                        <div className = {styles.devAvatar}>avatar</div>
                        <h3 className = {styles.devName}>Miguel Zon Murad</h3>
                    </div>
                    
                </div>
            </section>
        </div>
    );
}
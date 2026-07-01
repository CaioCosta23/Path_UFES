import styles from "../styles/About.module.css";

export default function About() {
    return (
        <div className = {styles.container}>
            {/* Sobre o projeto */}
            <section className = {styles.selection}>
                <h1 className = {styles.title}>SOBRE O PROJETO</h1>
                <p>
                    Este projeto é uma ferrameta...
                    Acesse o nosso repositório para mais informçãoes.
                </p>
                <p>
                    Acesse o nosso repositório <a href = "https://github.com/CaioCosta23/Path_UFES.git" target = "blank" rel = "noopener noreferrer" className = {styles.githubLink}>GitHub.</a> para mais informçãoes.
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
                        <div className = {styles.devAvatar}>Daniel Sbrocco Olimpio</div>
                        <h3 className = {styles.devName}>Nome 2</h3>
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
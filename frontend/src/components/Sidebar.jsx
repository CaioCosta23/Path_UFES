import styles from "../styles/Sidebar.module.css";

export default function Sidebar ({ isOpen, onClose, elementoSelecionado}) {
    return (
        <>
            {/* Overlay escuro atrás do sidebar*/}
            {isOpen && (
                <div
                    className = {styles.overlay}
                    onClick = {onClose}
                />
            )}

            {/* Sideba */}

            <aside className = {`${styles.sidebar} ${isOpen ? styles.open : ""}`}>
                {/* Header */}
                <div className = {styles.header}>
                    <h2 className = {styles.title}>Detalhes</h2>

                    <button
                        className = {styles.closeButton}
                        onClick = {onClose}
                        aria-label = "Fechar sidebar"
                    >
                        X
                    </button>
                </div>

                {/* Conteudo */}
                <div className = {styles.content}>
                    {elementoSelecionado ? (
                        <>
                            {/* Um Nó */}
                            {!elementoSelecionado.source && (
                                <div className = {styles.card}>
                                    <h3 className = {styles.cardTitle}>Matérias</h3>
                                    <div className = {styles.field}>
                                        <span className = {styles.fieldLabel}>ID</span>
                                        <span className = {styles.fieldValue}>{elementoSelecionado.id}</span>
                                    </div>

                                    <div className = {styles.field}>
                                        <span className = {styles.fieldLabel}>Nome</span>
                                        <span className = {styles.fieldValue}>{elementoSelecionado.label}</span>
                                    </div>
                                </div>
                            )}

                            {/*É uma aresta */}
                            {elementoSelecionado.source && (
                                <div className = {styles.card}>
                                    <h3 className = {styles.cardTitle}>Relação</h3>
                                    <div className = {styles.field}>
                                        <span className = {styles.fieldLabel}>Origem</span>
                                        <span className = {styles.fieldValue}>{elementoSelecionado.source}</span>
                                    </div>
                                    <div className = {styles.field}>
                                        <span className = {styles.fieldLabel}>Destino</span>
                                        <span className = {styles.fieldValue}>{elementoSelecionado.target}</span>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <p className = {styles.empty}>
                            Clique em um nó ou aresta do grafo para ver os detalhes aqui.
                        </p>
                    )}
                </div>
            </aside>
        </>
    );
}
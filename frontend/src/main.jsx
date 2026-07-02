/**
 * Importa componentes de renderização ("createRoot"), ativa verificações e avisos (durante o desenvolvimento da aplicação - "StrictMode"),
 * importa estilos e a aplicação do componente raíz do projeto;
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

/**
 * Função que cria conexão com a raíz da aplicação (em HTML) e renderiza o aplicativo; 
 */
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

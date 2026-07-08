/**
 * Importa as bibliotecas de React (responsáveis pela navegabilidade das páginas da aplicação),
 *  páginas em si da aplicação, componentes das páginas e os estilos;
 */
import {BrowserRouter, Routes, Route} from "react-router-dom";
import{ThemeProvider, useTheme} from "./contexts/ThemeContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Grafo from "./pages/Grafo";
import Trilha from "./pages/Trilha";
import About from "./pages/About";
import Background  from "./components/Background";

import "./styles/global.css";
import "./App.css";

function AppContent() {
  const{theme} = useTheme();

  return (
    <BrowserRouter>
    {/* Renderiza a barra de navegação (se mantendo em todas elas, por não estat alocado dentro de nenhuma rota específica) */}
    <Background theme = {theme}/>
      <Navbar/>
      {/* Seleciona as rotas das páginas de acordo com o seu "endereço". */}
      <main>
          <Routes>
            <Route path = "/" element = {<Home/>}/>
            <Route path = "/grafo" element = {<Grafo/>}/>
            <Route path = "/trilha" element = {<Trilha/>}/>
            <Route path = "/about" element = {<About/>}/>
            <Route path = "*" element = {<Home/>}/>
          </Routes>
      </main>
    </BrowserRouter>
  );
}

/**
 * 
 * @returns Aplicação central que mostrará todo o "front-end" do projeto;
 */
export default function App() {
  return (
    <ThemeProvider>
      <AppContent/>
    </ThemeProvider>
  )
}
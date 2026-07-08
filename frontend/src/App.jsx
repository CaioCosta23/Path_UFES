/**
 * Importa as bibliotecas de React (responsáveis pela navegabilidade das páginas da aplicação),
 *  páginas em si da aplicação, componentes das páginas e os estilos;
 */
import {BrowserRouter, Routes, Route} from "react-router-dom";
import Background from "./components/Background";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Grafo from "./pages/Grafo";
import Trilha from "./pages/Trilha";
import About from "./pages/About";

import "./styles/global.css";
import "./App.css";

/**
 * 
 * @returns Aplicação central que mostrará todo o "front-end" do projeto;
 */
export default function App() {
  return (
    <BrowserRouter>
    {/* Renderiza a barra de navegação (se mantendo em todas elas, por não estat alocado dentro de nenhuma rota específica) */}
      <Background/>
      {/*Renderiza o fundo da aplicação*/}
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
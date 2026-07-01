import {BrowserRouter, Routes, Route} from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Grafo from "./pages/Grafo";
import About from "./pages/About";

import "./styles/global.css";
import "./App.css";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar/>
      <main>
          <Routes>
            <Route path = "/" element = {<Home/>}/>
            <Route path = "/grafo" element = {<Grafo/>}/>
            <Route path = "/about" element = {<About/>}/>

            {/*Rota Coringa: Cria um caminho automático que volta para a Home (quaquer caminho desconhecido) */}
            <Route path = "*" element = {<Home/>}/>
          </Routes>
      </main>
    </BrowserRouter>
  );
}
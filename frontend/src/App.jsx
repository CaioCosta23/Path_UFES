import {BrowserRouter, Routes, Route} from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Grafo from "./pages/Grafo";
import Trilha from "./pages/Trilha";
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
            <Route path = "/trilha" element = {<Trilha/>}/>
            <Route path = "/about" element = {<About/>}/>
            <Route path = "*" element = {<Home/>}/>
          </Routes>
      </main>
    </BrowserRouter>
  );
}
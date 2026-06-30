import GrafoViewer from "./components/GrafoViewer";
import "./styles/global.css";

export default function App() {
  return (
    <div>
      <h1 style={{ padding: "1rem" }}>Teste do Grafo</h1>
      <GrafoViewer />
    </div>
  );
}
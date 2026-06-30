import {useState, useRef, useEffect} from "react";
import cytoscape from "cytoscape";
import {fetchMaterias, fetchRelacionamentos} from "../services/grafoService";

export function useGrafo() {
    const cyRef = useRef(null);
    const containerRef = useRef(null);
    const [nos, setNos] = useState([]);
    const[arestas, setArestas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState(null);
    const [elementoSelecionado, setElementoSelecionado] = useState(null);

    useEffect(() => {
        if (!containerRef.current)
            return;

        cyRef.current = cytoscape({
            container: containerRef.current,
            elements: [],
            style: [
                {
                    selector: "node",
                    style: {
                        "background-color": "var(--graph-node)",
                        "border-color": "var(--graph-node-hover)",
                        "border-width": 2,
                        label: "data(label)",
                        color: "var(--graph-node-label)",
                        "font-size": "14px",
                        "text-valign":"center",
                        "text-halign": "center",
                    },
                },
                {
                    selector: "node:selected",
                    style: {
                        "background-color": "var(--graph-node-hover)",
                    },
                },
                {
                    selector: "node:activate",
                    style: {
                        "background-color": "var(--graph-node-hover)",
                    },
                },
                {
                    selector: "edge",
                    style: {
                        "line-color": "var(--graph-edge)",
                        width: 2,
                        "curve-style": "bezier",
                        "target-arrow-shape": "triangle",
                        "target-arrow-color": "var(--graph-edge)",
                    },
                },
            ],
            layout: {name: "cose"},
        });

        cyRef.current.on("select", "node", "edge", (event) => {
            setElementoSelecionado(event.target.data());
        });

        cyRef.current.on("unselect", () => {
            setElementoSelecionado(null);
        });

        return () => cyRef.current?.destroy();
    }, []);

    const adicionarNo = (id, label) => {
        if (!id || !label) 
            return;
        cyRef.current?.add({
            group: "nodes",
            data: {id, label},
        });
        setNos((prev) => [...prev, {data: {id, label}}]);
    };

    const adicionarAresta = (source, target) => {
        if (!source || !target)
            return;
        const id = `${source}-${target}`;
        cyRef.current?.add({
            group: "edges",
            data: {id, source, target},
        });
        setArestas((prev) => [...prev, {data: {id, source, target} }]);
    };

    const carregarGrafo = (elementos) => {
        if (!elementos) 
            return;
        cyRef.current?.elements.remove();
        cyRef.current?.add(elementos);
        cyRef.current.layout({name: "cose"}).run();
        setNos(elementos.filter((el) => !el.data.source));
        setArestas(elementos.filter((el) => el.data.source));
    };

    const removerSelecionado = () => {
        cyRef.current?.$('selected').remove();
        setElementoSelecionado(null);
    };

    const limparGrafo = () => {
        setNos([]);
        setArestas([]);
        setElementoSelecionado(null);
    };

    const reorganizarLayout = () => {
        cyRef.current?.layout({name: "cose"}).run();
    };

    const carregarDoBackEnd = async() => {
        setLoading(true);
        setErro(null);
        
        try {
            const materias = await fetchMaterias();
            const relacionamentos = await fetchRelacionamentos();

            const nos = materias.map((materia) => ({
                data: {
                    id: String(materia.id),
                    label: materia.nome,
                },
            }));

            const arestas = relacionamentos.mao((rel) => ({
                data: {
                    id: `${rel.origem}-${rel.destino}`,
                    source: String(rel.origem),
                    target: String(rel.destino),
                },
            }));

            carregarGrafo([...nos, ...arestas]);
        }catch (err) {
            setErro(err.message);
        }finally {
            setLoading(false);
        }
    }

    return {
        containerRef,
        nos,
        arestas,
        elementoSelecionado,
        adicionarNo,
        adicionarAresta,
        carregarGrafo,
        removerSelecionado,
        limparGrafo,
        reorganizarLayout,
        loading,
        erro,
        carregarDoBackEnd
    };
}
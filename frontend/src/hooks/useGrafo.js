import {useState, useRef, useEffect} from "react";
import cytoscape from "cytoscape";
import {fetchGrafo, uploadPdf} from "../services/grafoService";

export function useGrafo() {
    const cyRef = useRef(null);
    const containerRef = useRef(null);
    const [nos, setNos] = useState([]);
    const [arestas, setArestas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState(null);
    const [elementoSelecionado, setElementoSelecionado] = useState(null);
    const [alunoImportado, setAlunoImportado] = useState(null);
    const [matricula, setMatricula] = useState(
        () => localStorage.getItem("pathufes_matricula") || null
    );

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
                        "background-color": "#94a3b8",
                        "border-color": "#64748b",
                        "border-width": 2,
                        label: "data(label)",
                        color: "#1a202c",
                        "font-size": "11px",
                        "text-valign": "center",
                        "text-halign": "center",
                        "text-wrap": "wrap",
                        "text-max-width": "80px",
                        width: "100px",
                        height: "100px", 
                    },
                },
                // Verde: disciplina já cursada
                {
                    selector: "node[status='cumprida']",
                    style: {
                        "background-color": "#10b981",
                        "border-color": "#059669",
                    },
                },
                // Azul: disponível para cursar agora
                {
                    selector: "node[status='disponivel']",
                    style: {
                        "background-color": "#4f46e5",
                        "border-color": "#4338ca",
                    },
                },
                // Cinza: bloqueada por pré-requisito pendente
                {
                    selector: "node[status='bloqueada']",
                    style: {
                        "background-color": "#94a3b8",
                        "border-color": "#64748b",
                    },
                },
                {
                    selector: "node:selected",
                    style: {"background-color": "#f97316"},
                },
                {
                    selector: "edge",
                    style: {
                        "line-color": "#94a3b8",
                        width: 2,
                        "curve-style": "bezier",
                        "target-arrow-shape": "triangle",
                        "target-arrow-color": "#94a3b8",
                    },
                },
                {
                    selector: "edge:selected",
                    style: {
                        "line-color": "#10b981",
                        "target-arrow-color": "#10b981",
                    },
                },
            ],
            layout: {name: "cose", fit: true, padding: 30},
        });

        cyRef.current.on("select", "node, edge", (event) => {
            setElementoSelecionado(event.target.data());
        });

        cyRef.current.on("unselect", () => {
            setElementoSelecionado(null);
        });

        // Impede que o grafo seja arrastado para fora da área visível:
        // sempre mantém uma faixa da área dos nós dentro do container.
        const PAN_PADDING = 60;
        cyRef.current.on("pan", () => {
            const cy = cyRef.current;
            const elementos = cy.elements();
            if (elementos.length === 0)
                return;

            const bb = elementos.boundingBox();
            const zoom = cy.zoom();
            const pan = cy.pan();
            const largura = cy.width();
            const altura = cy.height();

            const x1 = bb.x1 * zoom + pan.x;
            const x2 = bb.x2 * zoom + pan.x;
            const y1 = bb.y1 * zoom + pan.y;
            const y2 = bb.y2 * zoom + pan.y;

            let dx = 0, dy = 0;
            if (x2 < PAN_PADDING) dx = PAN_PADDING - x2;
            if (x1 > largura - PAN_PADDING) dx = (largura - PAN_PADDING) - x1;
            if (y2 < PAN_PADDING) dy = PAN_PADDING - y2;
            if (y1 > altura - PAN_PADDING) dy = (altura - PAN_PADDING) - y1;

            if (dx !== 0 || dy !== 0)
                cy.pan({x: pan.x + dx, y: pan.y + dy});
        });

        return () => cyRef.current?.destroy();
    }, []);

    // Converte a resposta do backend para o formato do Cytoscape,
    // incluindo o campo status para coloração automática dos nós.
    const _formatarElementos = (grafo) => {
        const nosData = grafo.nos.map((no) => ({
            data: {id: no.id, label: no.nome, status: no.status},
        }));
        const arestasData = grafo.arestas.map((a) => ({
            data: {id: `${a.source}-${a.target}`, source: a.source, target: a.target},
        }));
        return [...nosData, ...arestasData];
    };

    const adicionarNo = (id, label) => {
        if (!id || !label)
            return;
        cyRef.current?.add({group: "nodes", data: {id, label}});
        setNos((prev) => [...prev, {data: {id, label}}]);
    };

    const adicionarAresta = (source, target) => {
        if (!source || !target)
            return;
        const id = `${source}-${target}`;
        cyRef.current?.add({group: "edges", data: {id, source, target}});
        setArestas((prev) => [...prev, {data: {id, source, target}}]);
    };

    const carregarGrafo = (elementos) => {
        if (!elementos || !cyRef.current)
            return;
        cyRef.current.elements().remove();
        cyRef.current.add(elementos);
        cyRef.current.layout({name: "cose", fit: true, padding: 30}).run();
        setNos(elementos.filter((el) => !el.data.source));
        setArestas(elementos.filter((el) => el.data.source));
    };

    const removerSelecionado = () => {
        cyRef.current?.$(':selected').remove();
        setElementoSelecionado(null);
    };

    const limparGrafo = () => {
        cyRef.current?.elements().remove();
        setNos([]);
        setArestas([]);
        setElementoSelecionado(null);
    };

    const reorganizarLayout = () => {
        cyRef.current?.layout({name: "cose"}).run();
    };

    // Carrega o grafo do backend. Com matrícula, os nós recebem status colorido.
    const carregarDoBackend = async () => {
        setLoading(true);
        setErro(null);
        try {
            const grafo = await fetchGrafo(matricula);
            carregarGrafo(_formatarElementos(grafo));
        } catch (err) {
            setErro(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Importa histórico do PDF e recarrega o grafo já personalizado.
    const carregarDePdf = async (file) => {
        setLoading(true);
        setErro(null);
        setAlunoImportado(null);
        try {
            const dados = await uploadPdf(file);
            setAlunoImportado(dados);
            setMatricula(dados.matricula);
            localStorage.setItem("pathufes_matricula", dados.matricula);

            // Recarrega imediatamente com a matrícula recém-obtida
            const grafo = await fetchGrafo(dados.matricula);
            carregarGrafo(_formatarElementos(grafo));
        } catch (err) {
            setErro(err.message);
        } finally {
            setLoading(false);
        }
    };

    return {
        containerRef,
        nos,
        arestas,
        elementoSelecionado,
        alunoImportado,
        matricula,
        adicionarNo,
        adicionarAresta,
        carregarGrafo,
        removerSelecionado,
        limparGrafo,
        reorganizarLayout,
        loading,
        erro,
        carregarDoBackend,
        carregarDePdf,
    };
}

import styles from "../styles/Background.module.css";

const NOS = [
    {id: "n1", cx: 120, cy: 140},
    {id: "n2", cx: 320, cy: 90},
    {id: "n3", cx: 520, cy: 180},
    {id: "n4", cx: 200, cy: 320},
    {id: "n5", cx: 420, cy: 350},
    {id: "n6", cx: 680, cy: 260},
    {id: "n7", cx: 850, cy: 120},
    {id: "n8", cx: 950, cy: 340},
    {id: "n9", cx: 300, cy: 520},
    {id: "n10", cx: 600, cy: 550},
    {id: "n11", cx: 800, cy: 480},
    {id: "n12", cx: 1050, cy: 200},
];

const ARESTAS = [
    ["n1","n2"], ["n2","n3"], ["n1","n4"], ["n4","n5"], ["n3","n6"],
    ["n5","n6"], ["n6","n7"], ["n7","n8"], ["n4","n9"], ["n5","n10"],
    ["n10","n11"], ["n8","n11"], ["n7","n12"], ["n11","n12"], ["n2","n6"],
];

function getNo(id) {
    return NOS.find((n) => n.id === id);
}

export default function Background() {
    return (
        <svg className = {styles.fundo} viewbox = "0 0 1200 700" preserveASpectRatio = "xMidYMid slice" aria-hidden = "true">
            {ARESTAS.map(([origem, destino], i) => {
                const a = getNo(origem);
                const b = getNo(destino);

                return (
                    <line
                        key = {`${origem}-${destino}`}
                        x1 = {a.cx}
                        y1 = {a.cy}
                        x2 = {b.cx}
                        y2 = {b.cy}

                        className = {styles.aresta}
                        style = {{animationDelay: `${i * 0.15}s`}}
                    />
                );
            })}
            
            {NOS.map((no, i) => {
                <circle
                    key = {no.id}
                    cx = {no.cx}
                    cy = {no.cy}
                    r = {10}

                    className = {styles.no}
                    style = {{animationDelay: `${i * 0.3}s`}}
                />
            })}
        </svg>
    );
}
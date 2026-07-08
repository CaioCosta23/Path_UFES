import {useEffect, useRef} from "react";

export default function Background({
    theme = "dark",
    nodeCount = 60,
    maxDistance = 140,
    speed = 0.3,
}) {
    const canvasRef = useRef(null);
    const nodesRef = useRef([]);
    const animationRef = useRef(null);
    const themeRef = useRef(theme);

    useEffect(() => {
        themeRef.current = theme;
    }, [theme]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        resize();
        window.addEventListener("resize", resize);

        nodesRef.current = Array.from({length: nodeCount}, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * speed,
            vy: (Math.random() - 0.5) * speed,
            radius: Math.random() * 1.5 + 1,
        }));

        const palettes = {
            dark: {
                background: "rgba(5, 5, 8, 1)",
                node: "rgba(255, 255, 255, 0.9)",
                nodeGlow: "rgba(255, 255, 255, 0.5)",
                line: "rgba(255, 255, 255, 0.15)",
            },
            light: {
                background: "rgba(245, 246, 248, 1)",
                node: "rgba(30, 30, 40, 0.85)",
                nodeGlow: "rgba(30 30, 40, 0.3)",
                line: "rgba(30, 30, 40, 0.12)",
            },
        };

        const draw = () => {
            const palette = palettes[themeRef.current] || palettes.dark;
            const nodes = nodesRef.current;

            ctx.fillStyle = palette.background;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            for (const node of nodes) {
                node.x += node.vx;
                node.y += node.vy;
                
                if ((node.x <= 0) || (node.x >= canvas.width)) {
                    node.vx *= -1;
                }
                if ((node.y <= 0) || (node.y >= canvas.height)) {
                    node.vy *= -1;
                }
            }

            for (let i = 0; i < nodes.length; i++) {
                for (let j = (i + 1); j < nodes.length; j++) {
                    const a = nodes[i];
                    const b = nodes[j];
                    const dx = a.x - b.x;
                    const dy = a.y - b.y;
                    const distance = Math.sqrt((dx * dx) + (dy * dy));

                    if (distance < maxDistance) {
                        const opacity = 1 - distance / maxDistance;

                        ctx.strokeStyle = palette.line.replace(/[\d.] + \)$/, `${opacity * 0.3})`);

                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(a.x, a.y);
                        ctx.lineTo(b.x, b.y);
                        ctx.stroke();
                    }
                }
            }

            for (const node of nodes) {
                ctx.beginPath();
                ctx.arc(node.x, node.y, node.radius, 0, (Math.PI * 2));
                ctx.fillStyle = palette.node;
                ctx.fill();
            }

            animationRef.current = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            window.removeEventListener("resize", resize);
            cancelAnimationFrame(animationRef.current);
        };

    }, [nodeCount, maxDistance, speed]);

    return (
        <canvas
            ref = {canvasRef}
            style = {{
                position: "fixed",
                inset: 0,
                zIndex: -1,
                width: "100%",
                height: "100%",
                display: "block",
            }}
        />
    );
}
import {describe, it, expect, vi, beforeEach, afterEach} from "vitest";
import {render} from "@testing-library/react";
import Background from "../../components/Background";

describe("Background", () => {
    let mockCtx;
    let addEventListenerSpy;

    beforeEach(() => {
        mockCtx = {
            fillStyle: "",
            strokeStyle: "",
            lineWidth: 0,
            fillRect: vi.fn(),
            beginPath: vi.fn(),
            moveTo: vi.fn(),
            lineTo: vi.fn(),
            stroke: vi.fn(),
            arc: vi.fn(),
            fill: vi.fn(),
        };

        vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(mockCtx);

        addEventListenerSpy = vi.spyOn(window, "addEventListener");

        vi.stubGlobal("requestAnimationFrame", vi.fn(() => 1));

        vi.stubGlobal("cancelAnimationFrame", vi.fn());
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    it("deve renderizar um elemento canvas", () => {
        const {container} = render(<Background/>);

        expect(container.querySelector("canvas")).toBeInTheDocument();
    });

    it("deve ter 'position fixed' no estilo", () => {
        const {container} = render(<Background/>);
        const canvas = container.querySelector("canvas");

        expect(canvas.style.position).toBe("fixed");
    });

    it("deve ter 'z-index' negativo", () => {
        const {container} = render(<Background/>);
        const canvas = container.querySelector("canvas");

        expect(canvas.style.zIndex).toBe("-1");
    });

    it("deve ter largura e altura 100%", () => {
        const {container} = render(<Background/>);
        const canvas = container.querySelector("canvas");

        expect(canvas.style.width).toBe("100%");
        expect(canvas.style.height).toBe("100%");
    });

    it("deve usar tema 'light' por padrão", () => {
        render(<Background theme = "light"/>);

        expect(mockCtx.fillRect).toHaveBeenCalled();
    });

    it("deve usar o tema dark quando passado como 'prop'", () => {
        render(<Background theme = "dark"/>);

        expect(mockCtx.fillRect).toHaveBeenCalled();
    });

    it("deve adicionar 'listener' de 'resize'", () => {
        render(<Background/>);

        expect(addEventListenerSpy).toHaveBeenCalledWith("resize", expect.any(Function));
    });

    it("deve cancelar animação ao desmontar", () => {
        const {unmount} = render(<Background/>);

        unmount();
        expect(cancelAnimationFrame).toHaveBeenCalled();
    });

    it("deve aceitar 'prop' 'nodeCount'", () => {
        expect(() => {
            render(<Background nodeCount = {30}/>);
        }).not.toThrow();
    });

    it("deve aceitar 'prop' 'maxDistance'", () => {
        expect(() => {
            render(<Background maxDistance = {200}/>);
        }).not.toThrow();
    });

    it("deve aceitar 'prop' 'speed'", () => {
        expect(() => {
            render(<Background speed = {0.5}/>);
        }).not.toThrow();
    });
});

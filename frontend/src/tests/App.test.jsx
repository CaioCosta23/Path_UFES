import {describe, it, expect, vi} from "vitest";
import {render, screen} from "@testing-library/react"
import App from "../App";

vi.mock("../components/Background", () => ({
    default: () => <div data-testid = "background" />,
}));

vi.mock("../components/Navbar", () => ({
    default: () => <nav data-testid = "navbar" />,
}));

vi.mock("../pages/Home", () => ({
    default: () => <div data-testid = "home">Home</div>,
}));

vi.mock("../pages/Grafo", () => ({
    default: () => <div data-testid = "grafo">Grafo</div>,
}));

vi.mock("../pages/Trilha", () => ({
    default: () => <div data-testid = "trilha">Trilha</div>,
}));

vi.mock("../pages/About", () => ({
    default: () => <div data-testid = "about">About</div>,
}));

describe("App", () => {
    it("deve renderizar o Background", () => {
        render(<App/>);

        expect(screen.getByTestId("background")).toBeInTheDocument();
    });

    it("deve renderizar a Navbar", () => {
        render(<App/>);

        expect(screen.getByTestId("navbar")).toBeInTheDocument();
    });

    it("deve renderizar a página Home na rota /", () => {
        render(<App/>);

        expect(screen.getByTestId("home")).toBeInTheDocument();
    });

    it("deve renderizar a página Grafo na rota /grafo", () => {
        window.history.pushState({}, "", "/grafo");
        render(<App/>);
        expect(screen.getByTestId("grafo")).toBeInTheDocument();
        window.history.pushState({}, "", "/");
    });

    it("deve renderizar a página Trilha na rota /trilha", () => {
        window.history.pushState({}, "", "/trilha");
        render(<App/>);
        expect(screen.getByTestId("trilha")).toBeInTheDocument();
        window.history.pushState({}, "", "/");
    });

    it("deve renderizar a página About na rota /about", () => {
        window.history.pushState({}, "", "/about");
        render(<App/>);
        expect(screen.getByTestId("about")).toBeInTheDocument();
        window.history.pushState({}, "", "/");
    });

    it("deve renderizar para a página Home em rota desconhecida", () => {
        window.history.pushState({}, "", "/rota-inexistente");
        render(<App/>);
        expect(screen.getByTestId("home")).toBeInTheDocument();
        window.history.pushState({}, "", "/");
    });

    it("deve envolver a aplicação no ThemeProvider", () => {
        expect(() => {
            render(<App/>);
        }).not.toThrow();
    });
});

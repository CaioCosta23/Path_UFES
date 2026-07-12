import {describe, it, expect, vi} from "vitest";
import {render, screen} from "@testing-library/react"
import {MemoryRouter} from "react-router-dom";
import App from "../App";

vi.mock("./components/Background", () => ({
    default: () => <div data-testid = "background" />,
}));

vi.mock("./componets/Navbar", () => ({
    default: () => <nav data testid = "navbar" />,
}));

vi.mock("./pages/Home", () => ({
    default: () => <div data testid = "home" >Home</div>,
}));

vi.mock("./pages/Grafo", () => ({
    default: () => <div data testid = "grafo" >Grafo</div>,
}));

vi.mock("./pages/Trilha", () => ({
    default: () => <div data testid = "trilha" >Trilha</div>,
}));

vi.mock("./pages/About", () => ({
    default: () => <div data testid = "about" >About</div>,
}));

describe("App", () => {
    it ("deverenderizar o Background", () => {
        render(<App/>);

        expect(screen.getByTestId("background")).toBeInTheDocument();
    });

    it("deve renderizar a Navbar", () => {
        render(<App/>);

        expect(screen.getByTestId("navbar")).toBeInTheDocument();
    });

    it("deve renderizar a página Home na rota", () => {
        render(<App/>);

        expect(screen.getByTestId("home")).toBeInTheDocument();
    });

    it("deve renderizar a página Grafo na rota /grafo", () => {
        render(
            <MemoryRouter initialEntries = {["/grafo"]}>
                <App/>
            </MemoryRouter>
        );
        expect(screen.getByTestId("grafo")).toBeInTheDocument();
    });

    it("deve renderizar a página Trilha na rota /trilha", () => {
        render(
            <MemoryRouter initialEntries = {["/trilha"]}>
                <App/>
            </MemoryRouter>
        );
        expect(screen.getByTestId("trilha")).toBeInTheDocument();
    });

    it("deve renderizar a página About na rota /about", () => {
        render(
            <MemoryRouter initialEntries = {["/about"]}>
                <App/>
            </MemoryRouter>
        );
        expect(screen.getByTestId("about")).toBeInTheDocument();
    });

    it("deve renderizar para a página Home em rota desconhecida", () => {
        render(
            <MemoryRouter initialEntries = {["/rota-inexistente"]}>
                <App/>
            </MemoryRouter>
        );
        expect(screen.getByTestId("home")).toBeInTheDocument();
    });

    it("deve envolver a aplicação no ThemeProvider", () => {
        expect(() => {
            render(<App/>);
        }).not.toThrow();
    });
});
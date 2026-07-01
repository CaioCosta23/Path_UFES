import {describe, it, expect, vi} from "vitest";
import {render, screen} from "@testing-library/react"
import {MemoryRouter} from "react-router-dom";
import App from "../App";

vi.mock("./componets/Navbar", () => ({
    default: () => <nav data testid = "navbar" />,
}));

vi.mock("./componets/Home", () => ({
    default: () => <div data testid = "home" >Home</div>,
}));

vi.mock("./componets/Grafo", () => ({
    default: () => <div data testid = "grafo" >Grafo</div>,
}));

vi.mock("./componets/About", () => ({
    default: () => <div data testid = "about" >About</div>,
}));

describe("App", () => {
    it("deve renderizar a Navbar", () => {
        render(
            <MemoryRouter initialEntries = {["/"]}>
                <App/>
            </MemoryRouter>
        );
        expect(screen.getByTestId("navbar")).toBeInTheDocument();
    });

    it("deve renderizar a página Home na rota", () => {
        render(
            <MemoryRouter initialEntries = {["/"]}>
                <App/>
            </MemoryRouter>
        );
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

    it("deve renderizar a página About na rota /about", () => {
        render(
            <MemoryRouter initialEntries = {["/about"]}>
                <App/>
            </MemoryRouter>
        );
        expect(screen.getByTestId("about")).toBeInTheDocument();
    });

    it("deve renderizar para a página Home em rota inexistente", () => {
        render(
            <MemoryRouter initialEntries = {["/rota-inexistente"]}>
                <App/>
            </MemoryRouter>
        );
        expect(screen.getByTestId("home")).toBeInTheDocument();
    });
});
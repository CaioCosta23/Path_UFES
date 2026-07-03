import {describe, it, expect, vi, beforeEach} from "vitest";
import {renderHook, act} from "@testing-library/react";
import {useGrafo} from "../../hooks/useGrafo";

vi.mock("cytoscape", () => ({
    default: vi.fn(() => ({
        on: vi.fn(),
        add: vi.fn(),
        elements: vi(() => ({
            remove: vi.fn(),
        })),
        layout: vi.fn(() => ({run: vi.fn()})),
        fit: vi.fn(),
        center: vi.fn(),
        $: vi.fn(() => ({remove:vi.fn()})),
        destroy: vi.fn(),
    })),
}));

vi.mock("../../services/grafoService", () => ({
    fetchMaterias: vi.fn(),
    fetchRelacionamentos: vi.fn(),
    uploadPdf: vi.fn(),
}));

import {
    fetchMaterias,
    fetchRelacionamentos,
    uploadPDF,
}from "../../services/grafoService";


describe ("useGrafo", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("deve iniciar com estados vazios", () => {
        const {result} = renderHook(() => useGrafo());

        
    });
});

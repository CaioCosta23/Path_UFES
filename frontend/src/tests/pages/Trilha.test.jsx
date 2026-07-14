/**
 * Testes de integração da página "Trilha" (UI).
 * Como essa página depende do hook "useTrilha" (que provavelmente chama "trilhaService" por baixo), o hook é mockado inteiro aqui —
 * o objetivo NÃO é testar a lógica de geração da trilha (isso é responsabilidade do teste de "useTrilha"/"trilhaService"), e sim
 * testar como a página SE COMPORTA visualmente para cada estado possível que o hook poderia retornar (carregando, com erro, com resultado, etc.).
 */
import {describe, it, expect, vi, beforeEach} from "vitest";
import {render, screen, fireEvent} from "@testing-library/react";
import {MemoryRouter} from "react-router-dom";
import Trilha from "../../pages/Trilha";
import {useTrilha} from "../../hooks/useTrilha";

/**
 * Substitui o hook real "useTrilha" por uma versão mockada (uma função vi.fn() cujo valor de retorno é configurado
 * individualmente em cada teste/describe via mockReturnValue).
 *
 * @returns {{useTrilha: import("vitest").Mock}}
 */
vi.mock("../../hooks/useTrilha", () => ({
    useTrilha: vi.fn(),
}));

/**
 * Estado "neutro" do hook useTrilha, usado como base para a maioria dos testes: nenhuma trilha gerada ainda, sem loading, sem erro.
 * Cada teste que precisa de um estado diferente parte deste objeto, sobrescrevendo só o(s) campo(s) necessário(s) via spread.
 */
const defaultState = {
    trilha: null,
    loading: false,
    erro: null,
    gerarTrilha: vi.fn(),
};

/**
 * Exemplo de retorno "de sucesso" de useTrilha, usado nos testes que verificam a exibição dos resultados (tabela de disciplinas por
 * semestre, optativas previstas/faltantes, badges de tipo, etc.). Inclui casos especiais de propósito: uma disciplina sem código
 * (para testar o fallback "—") e uma aula com dois horários seguidos (para testar a formatação de intervalo, ex: "Seg 07-09h").
 */
const trilhaMock = {
    matricula: "2023100265",
    semestres: [
        {
            semestre: "2026/2",
            tipo: "PAR",
            disciplinas: [
                {
                    codigo: "MAT001",
                    nome: "Cálculo I",
                    creditos: 4,
                    tipo_disciplina: "OB",
                    aulas: [
                        {dias: ["SEGUNDA"], horarios: ["H07_08", "H08_09"]},
                    ],
                },
                {
                    codigo: null,
                    nome: "Optativa Livre",
                    creditos: null,
                    tipo_disciplina: "OP",
                    aulas: [],
                },
            ],
            optativas_previstas: [
                {codigo: "OPT001", nome: "Tópicos Especiais", creditos: 4},
            ],
        },
    ],
    optativas_faltantes: 2,
};

/**
 * Renderiza a página Trilha dentro de um MemoryRouter (necessário porque a página, direta ou indiretamente, pode depender de
 * componentes de rota, como o Navbar renderizado em App.jsx).
 *
 * @returns {import("@testing-library/react").RenderResult}
 */
const renderTrilha = () =>
    render(
        <MemoryRouter>
            <Trilha/>
        </MemoryRouter>
    );

describe("Trilha", () => {
    /**
     * Antes de cada teste, garante que useTrilha comece do estado "neutro" (defaultState) — evita que a configuração de um teste
     * anterior (ex: loading: true) vaze para o próximo.
     */
    beforeEach(() => {
        vi.mocked(useTrilha).mockReturnValue({...defaultState, gerarTrilha: vi.fn()});
    });

    /**
     * Verifica se os elementos estáticos da página aparecem corretamente na primeira renderização, antes de qualquer interação do usuário.
     */
    describe("Renderização inicial", () => {
        /**
         * Confirma a presença do <h1> principal da página.
         */
        it("deve renderizar o título principal", () => {
            renderTrilha();
            expect(screen.getByText("Trilha Acadêmica")).toBeInTheDocument();
        });

        /**
         * Confirma a presença do texto de instrução abaixo do título.
         */
        it("deve renderizar o subtítulo", () => {
            renderTrilha();
            expect(screen.getByText(/Configure suas preferências/i)).toBeInTheDocument();
        });

        /**
         * Confirma a presença do campo de entrada da matrícula do aluno.
         */
        it("deve renderizar o campo de matrícula", () => {
            renderTrilha();
            expect(screen.getByPlaceholderText("ex: 2023100265")).toBeInTheDocument();
        });

        /**
         * Confirma a presença do campo de semestre de início, já com um placeholder de exemplo no formato esperado (AAAA/N).
         */
        it("deve renderizar o campo de semestre com valor padrão", () => {
            renderTrilha();
            expect(screen.getByPlaceholderText("ex: 2026/2")).toBeInTheDocument();
        });

        /**
         * Confirma o range do slider (1 a 10), garantindo que os limites configurados no componente batem com o que se espera da UX.
         */
        it("deve renderizar o slider de máximo de disciplinas", () => {
            renderTrilha();
            const slider = screen.getByRole("slider");
            expect(slider).toBeInTheDocument();
            expect(slider).toHaveAttribute("min", "1");
            expect(slider).toHaveAttribute("max", "10");
        });

        /**
         * Confirma a presença do botão principal de submissão do formulário.
         */
        it("deve renderizar o botão de gerar trilha", () => {
            renderTrilha();
            expect(screen.getByText("Gerar Trilha")).toBeInTheDocument();
        });

        /**
         * Confirma os cabeçalhos de dias da grade de horários (segunda a sexta).
         */
        it("deve renderizar a grade de horário com os dias corretos", () => {
            renderTrilha();
            expect(screen.getByText("Seg")).toBeInTheDocument();
            expect(screen.getByText("Ter")).toBeInTheDocument();
            expect(screen.getByText("Qua")).toBeInTheDocument();
            expect(screen.getByText("Qui")).toBeInTheDocument();
            expect(screen.getByText("Sex")).toBeInTheDocument();
        });

        /**
         * Confirma alguns marcos de horário na grade (início, meio-dia, fim da noite), sem precisar checar cada hora individualmente.
         */
        it("deve renderizar a grade de horário com os horários corretos", () => {
            renderTrilha();
            expect(screen.getByText("07h")).toBeInTheDocument();
            expect(screen.getByText("12h")).toBeInTheDocument();
            expect(screen.getByText("18h")).toBeInTheDocument();
        });
    });

    /**
     * Verifica se os campos e controles do formulário respondem corretamente às ações do usuário (digitar, mover slider, clicar
     * nas células da grade de horários).
     */
    describe("Interações do formulário", () => {
        /**
         * Confirma que o campo de matrícula é um componente controlado (o valor exibido reflete o que o usuário digitou).
         */
        it("deve atualizar o campo de matrícula ao digitar", () => {
            renderTrilha();
            const input = screen.getByPlaceholderText("ex: 2023100265");
            fireEvent.change(input, {target: {value: "2023100265"}});
            expect(input.value).toBe("2023100265");
        });

        /**
         * Confirma que o campo de semestre é um componente controlado.
         */
        it("deve atualizar o campo de semestre ao digitar", () => {
            renderTrilha();
            const input = screen.getByPlaceholderText("ex: 2026/2");
            fireEvent.change(input, {target: {value: "2025/1"}});
            expect(input.value).toBe("2025/1");
        });

        /**
         * Confirma que mover o slider atualiza o número exibido do máximo de disciplinas selecionado.
         */
        it("deve atualizar o máximo de semestres ao mover o slider", () => {
            renderTrilha();
            const slider = screen.getByRole("slider");
            fireEvent.change(slider, {target: {value: "7"}});
            expect(screen.getByText("7")).toBeInTheDocument();
        });

        /**
         * Cada célula da grade é acessível como um botão nomeado "Dia HH:MM" (ex: "Seg 07:00"); clicar deve bloquear aquele
         * horário e atualizar o contador de bloqueios exibido na tela.
         */
        it("deve bloquear horário ao clicar na célula da grade", () => {
            renderTrilha();
            const botoes = screen.getAllByRole("button", {name: /Seg 07:00/i});
            fireEvent.click(botoes[0]);
            expect(screen.getByText(/1 bloqueado/i)).toBeInTheDocument();
        });

        /**
         * Clicar duas vezes na mesma célula deve alternar (toggle) o bloqueio, voltando ao estado "não bloqueado".
         */
        it("deve desbloquear horário ao clicar novamente na célula", () => {
            renderTrilha();
            const botoes = screen.getAllByRole("button", {name: /Seg 07:00/i});
            fireEvent.click(botoes[0]);
            fireEvent.click(botoes[0]);
            expect(screen.queryByText(/bloqueado/i)).not.toBeInTheDocument();
        });

        /**
         * O botão "Limpar seleção" só deveria existir quando há pelo menos um horário bloqueado (renderização condicional).
         */
        it("deve mostrar botão de limpar seleção quando há horários bloqueados", () => {
            renderTrilha();
            const botoes = screen.getAllByRole("button", {name: /Seg 07:00/i});
            fireEvent.click(botoes[0]);
            expect(screen.getByText("Limpar seleção")).toBeInTheDocument();
        });

        /**
         * Confirma que o botão "Limpar seleção" de fato remove todos os bloqueios acumulados, não só o último.
         */
        it("deve limpar todos os horários bloqueados ao clicar em limpar", () => {
            renderTrilha();
            const botoes = screen.getAllByRole("button", {name: /Seg 07:00/i});
            fireEvent.click(botoes[0]);
            fireEvent.click(screen.getByText("Limpar seleção"));
            expect(screen.queryByText(/bloqueado/i)).not.toBeInTheDocument();
        });

        /**
         * O campo de "semestres de restrição" só deveria aparecer depois que o usuário já bloqueou pelo menos um horário (renderização condicional).
         */
        it("deve mostrar campo de semestres de restrição quando há horários bloqueados", () => {
            renderTrilha();
            const botoes = screen.getAllByRole("button", {name: /Seg 07:00/i});
            fireEvent.click(botoes[0]);
            expect(screen.getByPlaceholderText(/ou.*2027/i)).toBeInTheDocument();
        });

        /**
         * Caso contrário (nenhum horário bloqueado), o campo não deve existir no DOM. Usa "queryByPlaceholderText" (em vez de
         * "getBy...") porque aqui esperamos justamente a AUSÊNCIA do elemento, e "getBy..." lançaria erro nesse cenário em vez de
         * retornar null.
         */
        it("não deve mostrar campo de semestres quando não há horários bloqueados", () => {
            renderTrilha();
            expect(screen.queryByPlaceholderText(/ou.*2027/i)).not.toBeInTheDocument();
        });
    });

    /**
     * Verifica o comportamento de envio do formulário: se aciona a função certa do hook, e se a UI reflete o estado de carregamento.
     */
    describe("Submissão de formulário", () => {
        /**
         * Confirma que submeter o <form> aciona "gerarTrilha", vinda do hook — sem verificar aqui o que a função faz internamente
         * (isso é responsabilidade do teste de "useTrilha").
         */
        it("deve chamar 'gerarTrilha' ao submeter o formulário", () => {
            const gerarTrilhaMock = vi.fn();
            vi.mocked(useTrilha).mockReturnValue({
                ...defaultState,
                gerarTrilha: gerarTrilhaMock,
            });

            const {container} = renderTrilha();
            fireEvent.submit(container.querySelector("form"));

            expect(gerarTrilhaMock).toHaveBeenCalled();
        });

        /**
         * Durante o carregamento (loading: true), o botão deve trocar de texto ("Calculando...") e ficar desabilitado, evitando
         * múltiplos envios simultâneos do formulário.
         */
        it("deve desabilitar o botão durante o loading", () => {
            vi.mocked(useTrilha).mockReturnValue({
                ...defaultState,
                loading: true,
            });
            renderTrilha();
            const botao = screen.getByRole("button", {name: "Calculando..."});
            expect(botao).toBeDisabled();
        });
    });

    /**
     * Verifica se mensagens de erro vindas do hook (ex: validação de campos obrigatórios, falha do backend) são exibidas ao usuário.
     */
    describe("Exibição de erro", () => {
        /**
         * Confirma que, quando o hook retorna uma mensagem em "erro", ela é exibida integralmente na tela.
         */
        it("deve mostrar mensagem de erro quando existir", () => {
            vi.mocked(useTrilha).mockReturnValue({
                ...defaultState,
                erro: "Informe a matrícula e o semestre de início.",
            });
            renderTrilha();
            expect(screen.getByText(/Informe a matrícula e o semestre de início\./i)).toBeInTheDocument();
        });
    });

    /**
     * Verifica a exibição da trilha já gerada (tabela de disciplinas por semestre, badges, optativas, formatação de horários, etc.).
     * Usa um beforeEach próprio para já partir do estado "com resultado" (trilha: trilhaMock) em todos os testes deste bloco.
     */
    describe("Exibição dos resultados", () => {
        beforeEach(() => {
            vi.mocked(useTrilha).mockReturnValue({
                ...defaultState,
                trilha: trilhaMock,
            });
        });

        /**
         * Confirma que o resumo geral (contagem de semestres + matrícula do aluno) aparece no topo dos resultados.
         */
        it("deve mostrar resumo da trilha gerada", () => {
            renderTrilha();
            expect(screen.getByText(/1 semestres/)).toBeInTheDocument();
            expect(screen.getByText(/2023100265/)).toBeInTheDocument();
        });

        /**
         * Aqui, em vez de uma query direta do Testing Library, o teste varre manualmente todos os <p> da página e verifica se algum
         * deles bate com o padrão esperado — útil quando o texto está "espalhado" entre elementos ou é composto dinamicamente.
         */
        it("deve mostrar optativas faltantes no resumo", () => {
            const {container} = renderTrilha();
            const paragrafos = Array.from(container.querySelectorAll("p"));
            expect(paragrafos.some((p) => /Faltam \d+ optativa/i.test(p.textContent))).toBe(true);
        });

        /**
         * Confirma que o identificador do semestre ("2026/2") aparece como um cabeçalho (heading) na tabela de resultados, não só
         * como texto solto.
         */
        it("deve mostrar o semestre na tabela de resultados", () => {
            renderTrilha();
            expect(screen.getByRole("heading", {name: /2026\/2/i})).toBeInTheDocument();
        });

        /**
         * Confirma que ambas as disciplinas do mock (com e sem código) aparecem listadas pelo nome.
         */
        it("deve mostrar as disciplinas na tabela", () => {
            renderTrilha();
            expect(screen.getByText("Cálculo I")).toBeInTheDocument();
            expect(screen.getByText("Optativa Livre")).toBeInTheDocument();
        });

        /**
         * "OB" (obrigatória) e "OP" (optativa) devem aparecer como badges visuais distintos para cada disciplina, conforme
         * seu tipo (tipo_disciplina).
         */
        it("deve mostrar os badges OB e OP corretamente", () => {
            renderTrilha();
            expect(screen.getAllByText("OB").length).toBeGreaterThan(0);
            expect(screen.getAllByText("OP").length).toBeGreaterThan(0);
        });

        /**
         * Confirma que a lista de optativas previstas do semestre (campo "optativas_previstas") é exibida, com seu respectivo rótulo de seção.
         */
        it("deve mostrar optativas previstas do semestre", () => {
            renderTrilha();
            expect(screen.getByText("Optativas disponíveis neste semestre:")).toBeInTheDocument();
            expect(screen.getByText("Tópicos Especiais")).toBeInTheDocument();
        });

        /**
         * Os dois horários consecutivos da mockada ("H07_08" + "H08_09") devem ser exibidos como um intervalo único ("Seg 07-09h"),
         * não como dois horários separados.
         */
        it("deve formatar horário das aulas corretamente", () => {
            renderTrilha();
            expect(screen.getByText("Seg 07-09h")).toBeInTheDocument();
        });

        /**
         * A disciplina "Optativa Livre" (código: null, no mock) deve ter seu código exibido como travessão ("—"), não como a
         * string literal "null" nem como célula vazia.
         */
        it("deve mostrar '—' para disciplinas sem código", () => {
            renderTrilha();
            expect(screen.getAllByText("—").length).toBeGreaterThan(0);
        });
    });
});
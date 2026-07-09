/**
 * Importa as bibliotecas para a configuração e estilo do "Navbar";
 */
import {useState} from "react";
import {Link, NavLink} from "react-router-dom";
import {useTheme} from "../hooks/useTheme";
import styles from "../styles/Navbar.module.css";

import {Moon, Sun} from "lucide-react";

/**
 * 
 * @returns {import("react").ReactElement} Elemento React que exporta o menu (superior de navegação) da página;
 */
export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    // Componente de customização de tema;
    const {theme, toggleTheme} = useTheme();

    // "Array" de objetos que representam os links de navegação entre as páginas;
    const links = [
        {to: "/", label: "Home"},
        {to: "/grafo", label: "Grafo"},
        {to: "/trilha", label: "Trilha"},
        {to: "/about", label: "About"},
    ];

    /**
     * Elemento que será retornado para a página (em forma de um componente/elemento "React");
     */
    return (
        <nav className = {styles.navbar}>
            <div className = {styles.navbarContent}>
                {/* Logo*/}
                <Link to = "/" className = {styles.logo}>
                    Path UFES
                </Link>

                {/**
                 *  Links "desktop":
                 * Transforma uma lista (conjunto) de objetos em
                 * itens reenderizáveis que contém informações
                 * únicas de cada objeto e seus estado;
                 */}
                <ul className = {styles.links}>
                    {links.map(({to, label}) => (
                    <li key = {to}>
                        <NavLink
                            to = {to}
                            className = {({isActive}) =>
                                isActive ? styles.active : styles.link
                            }
                        >
                            {label}
                        </NavLink>
                    </li>
                ))}
                </ul>

                {/**
                 *  "Toggle" de tema :
                 * Cria um botão indicando a mudança de tema (quando o mesmo é clicado);
                */}
                <button
                    className = {styles.themeToggle}
                    onClick = {toggleTheme}
                    aria-label = "Alternar tema"
                >
                    {theme === "light" ? <Moon size = {18}/>  : <Sun size = {18}/>}
                </button>

                {/* Botão hambúrguer (mobile) */}
                <button
                    className = {styles.hamburguer}
                    onClick = {() => setIsOpen(!isOpen)}
                    aria-label = "Abrir menu"
                >
                    {isOpen ? "✕" : "☰"}
                </button>

                {/* Menu mobile */}
                {isOpen && (
                    <ul className = { styles.mobileMenu}>
                        {links.map(({to, label}) => (
                            <li key = {to}>
                                <NavLink
                                    to = {to}
                                    onClick = {() => setIsOpen(false)}
                                    className = {({isActive}) =>
                                        isActive ? styles.active : styles.link
                                    }
                                >
                                    {label}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </nav>
    );
}
import {useState} from "react";
import {Link, NavLink} from "react-router-dom";
import {useTheme} from "../hooks/useTheme";
import styles from "../styles/Navbar.module.css";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const {theme, toggleTheme} = useTheme();

    const links = [
        {to: "/", label: "Home"},
        {to: "/grafo", label: "Grafo"},
        {to: "/about", label: "About"},
    ];

    return (
        <nav className = {styles.navbar}>
            {/* Logo*/}
            <Link to = "/" className = {styles.logo}>
                Path UFES
            </Link>

            {/* Links desktop */}
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

            {/* toggle de tema */}
            <button
                className = {styles.themeToggle}
                onClck = {toggleTheme}
                aria-label = "Alternar tema"
            >
                {theme === "light" ? "moon" : "sun"}
            </button>

            {/* Menu mobile */}
            {isOpen && (
                <ul className = { styles.modules.mobileMenu}>
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
        </nav>
    );
}
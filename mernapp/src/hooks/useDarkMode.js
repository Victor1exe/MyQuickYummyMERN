import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'darkMode';
const EVENT = 'mqy-dark-mode-change';

const readInitial = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) {
        try {
            return JSON.parse(saved);
        } catch (error) {
            return false;
        }
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

/**
 * Shared dark-mode state.
 *
 * Home and Navbar each kept their own `darkMode` useState reading the same
 * localStorage key, so toggling in the navbar re-themed the navbar but left
 * the page body on the old theme until a reload. A custom window event keeps
 * every mounted consumer in step.
 */
export default function useDarkMode() {
    const [darkMode, setDarkMode] = useState(readInitial);

    useEffect(() => {
        const onChange = (event) => setDarkMode(event.detail);
        window.addEventListener(EVENT, onChange);
        return () => window.removeEventListener(EVENT, onChange);
    }, []);

    useEffect(() => {
        document.documentElement.classList.toggle('dark', darkMode);
        document.body.classList.toggle('dark-mode', darkMode);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(darkMode));
    }, [darkMode]);

    const toggleTheme = useCallback(() => {
        setDarkMode((previous) => {
            const next = !previous;
            window.dispatchEvent(new CustomEvent(EVENT, { detail: next }));
            return next;
        });
    }, []);

    return { darkMode, toggleTheme };
}

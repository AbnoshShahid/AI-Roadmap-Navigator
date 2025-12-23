/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        sidebar: {
            bg: 'var(--sidebar-bg)',
            text: 'var(--sidebar-text)',
            active: 'var(--sidebar-text-active)',
            activeBg: 'var(--sidebar-active-bg)',
            hover: 'var(--sidebar-hover)',
        },
        topbar: {
            bg: 'var(--topbar-bg)',
            border: 'var(--topbar-border)',
        },
        primary: {
            DEFAULT: 'var(--color-primary)',
            hover: 'var(--color-emphasis)',
        },
        secondary: {
            DEFAULT: 'var(--secondary)',
        },
        accent: {
            DEFAULT: 'var(--accent)',
        },
        surface: {
            DEFAULT: 'var(--bg-surface)',
        },
        theme: {
            border: 'var(--border-color)',
            text: 'var(--text-primary)',
            muted: 'var(--text-muted)',
        }
    },
    plugins: [],
}

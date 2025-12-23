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
            // Map 'active-bg' to a utility if needed, or just use 'primary'
            activeBg: 'var(--sidebar-active-bg)',
            hover: 'var(--sidebar-hover)',
        },
        topbar: {
            bg: 'var(--topbar-bg)',
            border: 'var(--topbar-border)',
        },
        // Add primary/accent utilities
        primary: {
            DEFAULT: 'var(--color-primary)',
            hover: 'var(--color-emphasis)',
        }
    },
    plugins: [],
}

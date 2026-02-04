/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            colors: {
                primary: "#3713ec",
                "background-light": "#f6f6f8",
                "background-dark": "#0a0815",
                "surface-dark": "#1c1836",
            },
            fontFamily: {
                display: ["Spline Sans", "system-ui", "sans-serif"],
            },
            borderRadius: {
                DEFAULT: "0.25rem",
                lg: "0.5rem",
                xl: "0.75rem",
                full: "9999px",
            },
        },
    },
    plugins: [],
};

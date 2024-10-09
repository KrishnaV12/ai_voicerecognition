/** @type {import('tailwindcss').Config} */

/*eslint-env node*/
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "var(--primary)",
        timeline: "var(--timeline-primary)",
      },
      borderColor: {
        primary: "var(--border-primary)",
        secondary: "var(--border-secondary)",
        light: "var(--border-light)",
      },
      fontSize: {
        9: "9px",
        10: "10px",
      },
      fontFamily: {
        lato: ["Lato", "sans-serif"],
        josefin: ["Josefin Sans", "sans-serif"],
      },
      boxShadow: {
        panel: "0 3px 8px rgba(0,0,0,0.24)",
        timeline_content:
          "rgba(0, 0, 0, 0.25) 0px 6px 12px -2px, rgba(0, 0, 0, 0.3) 0px 3px 7px -3px",
      },
    },
  },
  plugins: [],
};

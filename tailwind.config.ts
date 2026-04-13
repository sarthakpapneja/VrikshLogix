import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      colors: {
        /* Forest-inspired premium palette */
        forest: {
          50: "#f0faf4",
          100: "#dcf5e6",
          200: "#bceacf",
          300: "#8dd8af",
          400: "#57be88",
          500: "#32a267",
          600: "#228250",
          700: "#1b6742",
          800: "#195237",
          900: "#16432e",
          950: "#0a261a",
        },
        bark: {
          50: "#faf6f2",
          100: "#f2e9de",
          200: "#e4d0bc",
          300: "#d2b191",
          400: "#be8d63",
          500: "#b07244",
          600: "#a05e38",
          700: "#854b30",
          800: "#6c3d2d",
          900: "#593428",
          950: "#301a14",
        },
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "countdown": "countdown 1s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;

import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Warm violet — distinct from generic SaaS blue, still reads as
        // trustworthy/professional. Used for primary actions and identity.
        brand: {
          50: "#f6f4fe",
          100: "#ede8fd",
          200: "#dcd3fb",
          300: "#c1b0f7",
          400: "#a084f0",
          500: "#8259e8",
          600: "#6d3fd6",
          700: "#5c32b8",
          800: "#4b2a95",
          900: "#3e2578",
        },
        // Warm terracotta accent for highlights that need to stand apart
        // from the primary action color (opportunity posts, callouts).
        accent: {
          50: "#fff4ed",
          100: "#ffe6d5",
          200: "#fec9a3",
          300: "#fda667",
          400: "#fb8332",
          500: "#f2660f",
          600: "#d94f0a",
          700: "#b23c0b",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;

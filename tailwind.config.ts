import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Deep plum — richer and more deliberate than the earlier bright
        // "SaaS violet," closer to the muted, premium purples on sites
        // like originality.ai. Used for primary actions and identity.
        brand: {
          50: "#f8f3fa",
          100: "#efe5f4",
          200: "#ddcde9",
          300: "#bc9fd0",
          400: "#9870b3",
          500: "#704694",
          600: "#4f2d6e",
          700: "#3c2353",
          800: "#2d1a3d",
          900: "#1f1229",
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
        // Warm gold — the third tone in the brand's jewel-tone palette
        // (violet / terracotta / gold). Used sparingly for the highest
        // reputation tier and the logo mark, so it reads as earned rather
        // than decorative.
        gold: {
          50: "#fefbea",
          100: "#fdf4c6",
          200: "#fce588",
          300: "#fad141",
          400: "#f5ba1d",
          500: "#d99a0b",
          600: "#b57a08",
          700: "#92600a",
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

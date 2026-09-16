import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f5ff",
          100: "#dbe6fe",
          200: "#bed0fd",
          300: "#91b0fb",
          400: "#5d87f7",
          500: "#3861f0",
          600: "#2544e3",
          700: "#2035c4",
          800: "#212f9e",
          900: "#212c7d",
        },
      },
    },
  },
  plugins: [],
};
export default config;

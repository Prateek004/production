import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  "#FDF5F2",
          100: "#FAF0EB",
          200: "#F5D9CC",
          300: "#E8A98F",
          400: "#D97055",
          500: "#B24B2F",
          600: "#8F3A22",
          700: "#6B2A18",
        },
      },
      fontFamily: {
        sans:  ["DM Sans", "sans-serif"],
        serif: ["DM Serif Display", "serif"],
      },
      screens: {
        xs: "380px",
        md: "768px",
        lg: "1024px",
      },
      maxWidth: { app: "480px" },
    },
  },
  plugins: [],
};

export default config;

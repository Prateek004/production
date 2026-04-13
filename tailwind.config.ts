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
          50:  "#FAF0EB",
          100: "#F5DDD3",
          200: "#EEC3AD",
          300: "#D97C5A",
          400: "#CC5C38",
          500: "#B24B2F",
          600: "#8B3018",
          700: "#5C1E0D",
        },
      },
      screens: {
        xs: "380px",
        md: "768px",
        lg: "1024px",
      },
      maxWidth: {
        app: "480px",
      },
    },
  },
  plugins: [],
};

export default config;

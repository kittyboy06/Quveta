import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/modules/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/shared/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#FAF5FF",
          100: "#F5F3FF", // Light Lavender surface
          200: "#EDE9FE",
          300: "#DDD6FE",
          400: "#A78BFA",
          500: "#8B5CF6",
          600: "#7C3AED", // Vibrant Purple
          700: "#6D28D9",
          800: "#5B21B6", // Deep Primary Purple
          900: "#4C1D95",
          950: "#2E1065",
        },
        surface: {
          default: "#FFFFFF",
          subtle: "#F8FAFC",
          lavender: "#F5F3FF",
          border: "#E2E8F0",
        },
        status: {
          success: "#15803D",
          warning: "#B45309",
          danger: "#B91C1C",
          info: "#4338CA",
        },
      },
    },
  },
  plugins: [],
};

export default config;

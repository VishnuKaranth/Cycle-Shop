import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "#ffffff",
          foreground: "#000000",
        },
        surface: {
          DEFAULT: "#0a0a0a", // Slightly elevated from pure black
          elevated: "#111111", // Higher elevation layer
          border: "#1a1a1a",
        },
        accent: {
          DEFAULT: "#e33d3d", // Premium Canyon Red
          hover: "#ff4d4d",
        }
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;

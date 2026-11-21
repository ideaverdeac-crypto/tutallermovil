import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          deep: "#050B14",
          base: "#0A1525",
          elevated: "#0F1B2D",
          light: "#F5F5F0",
        },
        brand: {
          lime: "#CCFF00",
          limeGlow: "rgba(204,255,0,0.35)",
          primary: "#CCFF00",
          "primary-hover": "#b8e600",
          trust: "#0A1525",
          success: "#16A34A",
        },
        accent: {
          magenta: "#FF006E",
          cyan: "#00E5FF",
        },
        text: {
          primary: "#FFFFFF",
          secondary: "#94A3B8",
          muted: "#64748B",
        },
      },
      fontSize: {
        "display-xl": [
          "96px",
          { lineHeight: "0.95", letterSpacing: "-0.04em", fontWeight: "400" },
        ],
        "display-l": [
          "72px",
          { lineHeight: "1.0", letterSpacing: "-0.03em", fontWeight: "400" },
        ],
        h1: [
          "48px",
          { lineHeight: "1.05", letterSpacing: "-0.02em", fontWeight: "500" },
        ],
        h2: ["36px", { lineHeight: "1.15", fontWeight: "500" }],
        h3: ["24px", { lineHeight: "1.25", fontWeight: "500" }],
        body: ["17px", { lineHeight: "1.6", fontWeight: "400" }],
        small: ["14px", { lineHeight: "1.5" }],
        caption: [
          "12px",
          { lineHeight: "1.4", letterSpacing: "0.08em" },
        ],
      },
      borderRadius: {
        control: "4px",
        card: "12px",
        section: "24px",
        full: "9999px",
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.4), 0 8px 24px rgba(0,0,0,0.3)",
        elevated: "0 4px 6px rgba(0,0,0,0.3), 0 20px 48px rgba(0,0,0,0.5)",
        limeGlow: "0 0 0 1px rgba(204,255,0,0.4), 0 0 24px rgba(204,255,0,0.25)",
        focus: "0 0 0 3px rgba(204,255,0,0.5)",
      },
      transitionDuration: {
        instant: "100ms",
        fast: "200ms",
        base: "400ms",
        slow: "800ms",
        cinematic: "1200ms",
      },
      transitionTimingFunction: {
        standard: "cubic-bezier(0.4, 0, 0.2, 1)",
        expoOut: "cubic-bezier(0.16, 1, 0.3, 1)",
        backOut: "cubic-bezier(0.34, 1.56, 0.64, 1)",
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
    },
  },
  plugins: [],
};

export default config;

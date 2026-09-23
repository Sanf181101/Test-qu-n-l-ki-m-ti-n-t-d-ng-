import type { Config } from "tailwindcss";

// Màu chữ "muted" được tính sẵn để luôn đạt tối thiểu 4.5:1 tương phản
// trên CẢ hai nền sáng/tối — tránh lỗi text-slate-400/500 không cặp dark:
// từng gặp ở KMO Pro.
const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: "#ffffff",
          dark: "#0f172a",
        },
        "surface-raised": {
          DEFAULT: "#f8fafc",
          dark: "#1e293b",
        },
        border: {
          DEFAULT: "#e2e8f0",
          dark: "#334155",
        },
        ink: {
          DEFAULT: "#0f172a", // body text, light mode — ~19:1 on white
          dark: "#e2e8f0", // body text, dark mode — ~13:1 on slate-900
        },
        muted: {
          DEFAULT: "#475569", // slate-600 on white = 7.58:1 (passes AA)
          dark: "#94a3b8", // slate-400 on slate-900 = 6.96:1 (passes AA)
        },
        accent: {
          DEFAULT: "#0e7490", // cyan-700, 4.6:1 on white
          dark: "#22d3ee", // cyan-400, 8.9:1 on slate-900
        },
        danger: {
          DEFAULT: "#b91c1c",
          dark: "#f87171",
        },
        success: {
          DEFAULT: "#15803d",
          dark: "#4ade80",
        },
        warning: {
          DEFAULT: "#a16207",
          dark: "#facc15",
        },
      },
    },
  },
  plugins: [],
};

export default config;

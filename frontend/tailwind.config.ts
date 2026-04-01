import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        glow: "0 0 0 1px rgba(168,85,247,0.25), 0 20px 60px rgba(8, 8, 25, 0.45)"
      }
    }
  },
  plugins: []
} satisfies Config;


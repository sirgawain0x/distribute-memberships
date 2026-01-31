import { withAccountKitUi } from "@account-kit/react/tailwind";
import type { Config } from "tailwindcss";

const config: Config = withAccountKitUi({
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      animation: {
        "fade-out": "1s fadeOut 3s ease-out forwards",
      },
      keyframes: {
        fadeOut: {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
      },
    },
  },
  plugins: [],
}, {
  // AccountKit UI theme customizations
  // colors: {
  //     "btn-primary": "...",
  //     "fg-accent-brand": "...",
  // }
});

export default config;

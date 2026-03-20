import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite-plus";

export default defineConfig({
  plugins: [tailwindcss(), reactRouter()],
  resolve: {
    alias: {
      "~": `${import.meta.dirname}/app`,
    },
  },
  staged: {
    "*.{ts,tsx}": "vp check --fix --no-lint",
  },
  lint: {
    options: { typeAware: true, typeCheck: true },
    ignorePatterns: ["migrate.ts"],
  },
});

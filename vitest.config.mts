import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    environment: "jsdom",
    exclude: ["node_modules", "dist"],
    include: ["**/*.test.?(c|m)[jt]s?(x)"],
  },
});

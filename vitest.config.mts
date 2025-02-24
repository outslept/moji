import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    environment: 'jsdom',
    exclude: ['node_modules', 'dist'],
    include: ['**/*.test.?(c|m)[jt]s?(x)'],
  },
})

import { fileURLToPath } from 'node:url';
import { defineConfig, type Plugin } from 'vitest/config';

/**
 * Permite imports estilo NodeNext ("./x.js") resolviendo al archivo .ts
 * real, por si algún módulo conserva extensiones explícitas.
 */
function resolveTsFromJs(): Plugin {
  return {
    name: 'resolve-ts-from-js',
    enforce: 'pre',
    async resolveId(source, importer) {
      if (importer && source.startsWith('.') && source.endsWith('.js')) {
        const candidate = source.replace(/\.js$/, '.ts');
        const resolved = await this.resolve(candidate, importer, { skipSelf: true });
        if (resolved) return resolved;
      }
      return null;
    },
  };
}

const srcDir = fileURLToPath(new URL('./src', import.meta.url));

export default defineConfig({
  plugins: [resolveTsFromJs()],
  resolve: {
    // Mismo alias que tsconfig: "@/…" apunta a src/.
    alias: { '@': srcDir },
  },
  test: {
    environment: 'node',
    include: ['tests/unit/**/*.test.ts'],
  },
});

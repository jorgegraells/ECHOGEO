import { defineConfig, type Plugin } from 'vitest/config';

/**
 * Permite imports estilo NodeNext ("./x.js") resolviendo al archivo .ts
 * real. El motor conserva sus extensiones explícitas (necesarias con tsx),
 * y así Vitest puede cargarlo sin reescribir el código fuente.
 */
function resolveTsFromJs(): Plugin {
  return {
    name: 'resolve-ts-from-js',
    enforce: 'pre',
    async resolveId(source, importer) {
      if (importer && source.startsWith('.') && source.endsWith('.js')) {
        const candidate = source.replace(/\.js$/, '.ts');
        const resolved = await this.resolve(candidate, importer, {
          skipSelf: true,
        });
        if (resolved) return resolved;
      }
      return null;
    },
  };
}

export default defineConfig({
  plugins: [resolveTsFromJs()],
  test: {
    environment: 'node',
    include: ['tests/unit/**/*.test.ts'],
  },
});

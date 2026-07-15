/**
 * Configuración de Prettier. El plugin de orden de imports agrupa en tres
 * bloques separados por línea en blanco: externos, alias internos (@/…) y
 * relativos (./…), según la convención de CLAUDE.md.
 */
export default {
  singleQuote: true,
  semi: true,
  trailingComma: 'all',
  printWidth: 90,
  plugins: ['@ianvs/prettier-plugin-sort-imports'],
  importOrder: ['<THIRD_PARTY_MODULES>', '', '^@/(.*)$', '', '^[.]'],
};

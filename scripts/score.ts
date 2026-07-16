import { basename } from 'node:path';

import {
  computeCost,
  getMeasurement,
  rescoreMeasurement,
} from '@/lib/services/measurement';

import { printCost, printReport } from './report';

// Re-puntúa una medición guardada sin llamar a ninguna API. Garantiza que
// el scoring es reproducible: si la fórmula cambia, recalcula el histórico
// desde el crudo.
//
//   npm run score -- data/runs/<carpeta>

const arg = process.argv[2];
if (!arg) {
  console.error('Uso: npm run score -- data/runs/<carpeta>');
  process.exit(1);
}

// Aceptamos tanto la ruta de la carpeta como el id pelado.
const id = basename(arg);

try {
  const report = rescoreMeasurement(id);
  printReport(report);
  // El coste también se recalcula desde el crudo, sin llamar a ninguna API.
  const result = getMeasurement(id);
  if (result) printCost(computeCost(result.file));
  console.log(`Reporte actualizado en data/runs/${id}`);
} catch (err) {
  console.error(`\nError: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
}

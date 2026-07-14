import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { scoreMeasurement } from './scoring.js';
import { printReport } from './report.js';
import type { MeasurementFile } from './types.js';

// Re-puntúa una medición guardada sin volver a llamar a ninguna API.
// Es la garantía de que el scoring es reproducible: si la fórmula cambia,
// este comando recalcula cualquier histórico desde el crudo.
//
//   npm run score -- data/runs/<carpeta>

const dirArg = process.argv[2];
if (!dirArg) {
  console.error('Uso: npm run score -- data/runs/<carpeta>');
  process.exit(1);
}

const dir = resolve(dirArg);
const file = JSON.parse(
  readFileSync(resolve(dir, 'measurement.json'), 'utf8'),
) as MeasurementFile;

const report = scoreMeasurement(file);
writeFileSync(resolve(dir, 'report.json'), JSON.stringify(report, null, 2), 'utf8');
printReport(report);
console.log(`Reporte actualizado en ${dir}`);

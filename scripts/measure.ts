import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import {
  computeCost,
  parseMeasurementConfig,
  runMeasurement,
} from '@/lib/services/measurement';
import { loadEnvLocal } from '@/lib/utils/env';

import { printCost, printReport } from './report';

// Entrypoint CLI de una medición. Parsea argumentos, carga la config y
// delega toda la lógica en el servicio de medición.
//
//   npm run measure                  → motor real (necesita .env.local)
//   npm run measure -- --mock        → motor simulado, sin coste
//   npm run measure -- --config x.json

async function main(): Promise<void> {
  loadEnvLocal();
  const args = process.argv.slice(2);
  const useMock = args.includes('--mock');
  const configFlag = args.indexOf('--config');
  const configPath = resolve(
    configFlag !== -1 ? (args[configFlag + 1] ?? '') : 'measurement.config.json',
  );

  const config = parseMeasurementConfig(JSON.parse(readFileSync(configPath, 'utf8')));
  const engineLabel = useMock ? 'mock' : config.engines.join(', ');
  const total = config.prompts.length * config.runsPerPrompt * config.engines.length;

  console.log(
    `Medición de «${config.brand.name}» · motores ${engineLabel} · ` +
      `${config.prompts.length} prompts × ${config.runsPerPrompt} pasadas × ` +
      `${config.engines.length} motores = ${total} consultas`,
  );
  if (!useMock) console.log('Cada consulta gasta créditos de API.');

  const result = await runMeasurement(config, {
    useMock,
    onProgress: ({ done, total: t, promptIndex, runIndex }) => {
      console.log(
        `  [${done}/${t}] prompt ${promptIndex + 1}, pasada ${runIndex + 1} ok`,
      );
    },
  });

  printReport(result.report);
  printCost(computeCost(result.file));
  console.log(`Crudo y reporte guardados en data/runs/${result.id}`);
}

main().catch((err) => {
  console.error(`\nError: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});

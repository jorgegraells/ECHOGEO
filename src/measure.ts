import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { loadEnvLocal } from './env.js';
import { createMockAdapter } from './engines/mock.js';
import { createPerplexityAdapter } from './engines/perplexity.js';
import { scoreMeasurement } from './scoring.js';
import { printReport } from './report.js';
import type { EngineAdapter, MeasurementConfig, MeasurementFile, RunRecord } from './types.js';

// Lanza una medición completa: N pasadas por prompt contra el motor
// configurado, guarda el crudo en data/runs/<fecha>/ y puntúa.
//
//   npm run measure                  → motor real (necesita .env.local)
//   npm run measure -- --mock        → motor simulado, sin coste
//   npm run measure -- --config x.json

function loadConfig(path: string): MeasurementConfig {
  const parsed = JSON.parse(readFileSync(path, 'utf8')) as MeasurementConfig;
  if (!parsed.brand?.name) throw new Error('config: falta brand.name');
  if (!Array.isArray(parsed.prompts) || parsed.prompts.length === 0) {
    throw new Error('config: hace falta al menos un prompt');
  }
  if (!Number.isInteger(parsed.runsPerPrompt) || parsed.runsPerPrompt < 1) {
    throw new Error('config: runsPerPrompt debe ser un entero >= 1');
  }
  parsed.competitors ??= [];
  return parsed;
}

function pickAdapter(config: MeasurementConfig, mock: boolean): EngineAdapter {
  if (mock) return createMockAdapter(config);
  if (config.engine === 'perplexity') {
    const key = process.env['PERPLEXITY_API_KEY'];
    if (!key) {
      throw new Error(
        'Falta PERPLEXITY_API_KEY. Copia .env.example a .env.local y pon la clave, ' +
          'o ejecuta con --mock para probar sin coste.',
      );
    }
    return createPerplexityAdapter(key);
  }
  throw new Error(`Motor desconocido: ${config.engine}`);
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function main(): Promise<void> {
  loadEnvLocal();
  const args = process.argv.slice(2);
  const mock = args.includes('--mock');
  const configFlag = args.indexOf('--config');
  const configPath = resolve(
    configFlag !== -1 ? args[configFlag + 1] ?? '' : 'measurement.config.json',
  );

  const config = loadConfig(configPath);
  const adapter = pickAdapter(config, mock);
  const totalCalls = config.prompts.length * config.runsPerPrompt;

  console.log(
    `Medición de «${config.brand.name}» · motor ${adapter.id} · ` +
      `${config.prompts.length} prompts × ${config.runsPerPrompt} pasadas = ${totalCalls} consultas`,
  );
  if (!mock) console.log('Cada consulta gasta créditos de API.');

  const runs: RunRecord[] = [];
  for (let p = 0; p < config.prompts.length; p++) {
    const prompt = config.prompts[p]!;
    for (let r = 0; r < config.runsPerPrompt; r++) {
      process.stdout.write(`  [${p + 1}.${r + 1}/${config.prompts.length}.${config.runsPerPrompt}] consultando… `);
      const answer = await adapter.query(prompt, r);
      console.log('ok');
      runs.push({
        promptIndex: p,
        prompt,
        runIndex: r,
        timestamp: new Date().toISOString(),
        engine: adapter.id,
        answer,
      });
      if (!mock) await sleep(400); // sin ametrallar la API
    }
  }

  const file: MeasurementFile = {
    version: 1,
    createdAt: new Date().toISOString(),
    config,
    runs,
  };

  const stamp = file.createdAt.replace(/[:.]/g, '-');
  const dir = resolve('data', 'runs', `${stamp}-${adapter.id}`);
  mkdirSync(dir, { recursive: true });
  writeFileSync(resolve(dir, 'measurement.json'), JSON.stringify(file, null, 2), 'utf8');

  const report = scoreMeasurement(file);
  writeFileSync(resolve(dir, 'report.json'), JSON.stringify(report, null, 2), 'utf8');

  printReport(report);
  console.log(`Crudo y reporte guardados en ${dir}`);
}

main().catch((err) => {
  console.error(`\nError: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});

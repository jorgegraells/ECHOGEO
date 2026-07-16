import type { MeasurementCost } from '@/lib/services/measurement';
import type { Report } from '@/types';

// Impresión del reporte en consola, estilo boletín de la estación. Es
// presentación específica de la CLI; la UI web tiene la suya propia.

const pct = (v: number) => `${Math.round(v * 100)} %`;

/** Imprime el coste de la medición, diciendo de dónde sale cada cifra. */
export function printCost(cost: MeasurementCost): void {
  const line = '─'.repeat(64);
  console.log(line);
  console.log(
    `  COSTE  ${cost.totalUsd.toFixed(4)} $${cost.hasUnknown ? ' (parcial)' : ''}`,
  );
  for (const engine of cost.byEngine) {
    const amount =
      engine.costUsd === null ? 'desconocido' : `${engine.costUsd.toFixed(4)} $`;
    const perRun =
      engine.costUsd === null || engine.runs === 0
        ? ''
        : ` · ${(engine.costUsd / engine.runs).toFixed(4)} $/consulta`;
    console.log(
      `  · ${engine.engine.padEnd(12)} ${amount.padEnd(14)} [${engine.basis}]${perRun}`,
    );
  }
  console.log(`${line}\n`);
}

/** Imprime un reporte de medición por consola. */
export function printReport(report: Report): void {
  const line = '─'.repeat(64);
  console.log(`\n${line}`);
  console.log(
    `  ÍNDICE DE ECO · ${report.brand} · motores: ${report.engines.join(', ')}`,
  );
  console.log(line);
  console.log(
    `  Índice global         ${report.index10.toFixed(1).replace('.', ',')} / 10`,
  );
  console.log(
    `  Presencia             ${pct(report.presence)} de ${report.totalRuns} pasadas`,
  );
  console.log(`  Cita enlazada         ${pct(report.domainCited)}`);
  console.log(
    `  Posición (0-1)        ${report.positionScore.toFixed(2).replace('.', ',')}`,
  );
  if (report.byEngine.length > 1) {
    console.log(line);
    for (const e of report.byEngine) {
      console.log(
        `  · ${e.engine.padEnd(12)} índice ${e.index10.toFixed(1).replace('.', ',')} · ` +
          `presencia ${pct(e.presence)} · cita ${pct(e.domainCited)}`,
      );
    }
  }
  console.log(line);
  for (const p of report.prompts) {
    const pos =
      p.avgPosition === null
        ? 'no aparece'
        : `pos. media ${p.avgPosition.toFixed(1).replace('.', ',')}`;
    console.log(`  [${String(p.promptIndex + 1).padStart(2, '0')}] «${p.prompt}»`);
    console.log(
      `       presencia ${pct(p.presence).padEnd(6)} cita ${pct(p.domainCited).padEnd(6)} ${pos}`,
    );
  }
  console.log(`${line}\n`);
}

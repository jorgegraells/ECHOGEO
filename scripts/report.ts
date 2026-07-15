import type { Report } from '@/types';

// Impresión del reporte en consola, estilo boletín de la estación. Es
// presentación específica de la CLI; la UI web tiene la suya propia.

const pct = (v: number) => `${Math.round(v * 100)} %`;

/** Imprime un reporte de medición por consola. */
export function printReport(report: Report): void {
  const line = '─'.repeat(64);
  console.log(`\n${line}`);
  console.log(`  ÍNDICE DE ECO · ${report.brand} · motor: ${report.engine}`);
  console.log(line);
  console.log(
    `  Índice compuesto      ${report.index10.toFixed(1).replace('.', ',')} / 10`,
  );
  console.log(
    `  Presencia             ${pct(report.presence)} de ${report.totalRuns} pasadas`,
  );
  console.log(`  Cita enlazada         ${pct(report.domainCited)}`);
  console.log(
    `  Posición (0-1)        ${report.positionScore.toFixed(2).replace('.', ',')}`,
  );
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

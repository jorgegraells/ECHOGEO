import { auditDomain, OnPageError } from '@/lib/services/onpage';

// Audita la web de una marca desde la terminal. Los hallazgos se imprimen por
// su código (la traducción vive en la UI).
//
//   npm run audit -- nomadcoffee.es "Nomad Coffee"

const ICON = { critical: '✗', warning: '!', info: '·', ok: '✓' } as const;

async function main(): Promise<void> {
  const domain = process.argv[2];
  if (!domain) {
    console.error('Uso: npm run audit -- <dominio> [marca]');
    process.exit(1);
  }
  const brand = process.argv[3];

  const audit = await auditDomain(domain, brand);
  const line = '─'.repeat(64);

  console.log(`\n${line}`);
  console.log(`  AUDITORÍA ON-PAGE · ${audit.url}`);
  console.log(line);
  for (const finding of audit.findings) {
    const values = Object.entries(finding.values)
      .map(([k, v]) => `${k}=${v}`)
      .join(' ');
    console.log(
      `  ${ICON[finding.severity]} [${finding.severity.padEnd(8)}] ` +
        `${finding.code.padEnd(32)} ${finding.evidence.padEnd(8)} ${values}`,
    );
  }
  console.log(`${line}\n`);
}

main().catch((err) => {
  const detail = err instanceof OnPageError ? err.message : String(err);
  console.error(`\nError: ${detail}`);
  process.exit(1);
});

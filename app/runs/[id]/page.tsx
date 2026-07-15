import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fecha, num, pct } from '../../format';
import { getRun } from '../../lib/runs';

export const dynamic = 'force-dynamic';

function hostnameOf(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

export default async function RunPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const run = getRun(id);
  if (!run) notFound();

  const { file, report } = run;
  const brand = file.config.brand;

  // Auditoría de fuentes: qué dominios cita el motor y cuántas veces
  const sourceCounts = new Map<string, number>();
  for (const r of file.runs) {
    const hosts = new Set(
      r.answer.citations
        .map(hostnameOf)
        .filter((h): h is string => h !== null),
    );
    for (const host of hosts) {
      sourceCounts.set(host, (sourceCounts.get(host) ?? 0) + 1);
    }
  }
  const ownDomain = brand.domain?.replace(/^www\./, '') ?? null;
  const sources = [...sourceCounts.entries()].sort((a, b) => b[1] - a[1]);

  const globalRows = [
    { name: 'Presencia', hint: `apariciones en ${report.totalRuns} pasadas`, value: report.presence, label: pct(report.presence) },
    { name: 'Cita enlazada', hint: 'pasadas con tu dominio en las fuentes', value: report.domainCited, label: pct(report.domainCited) },
    { name: 'Posición', hint: 'lugar entre las marcas mencionadas', value: report.positionScore, label: num(report.positionScore, 2) },
  ];

  return (
    <div className="pt-10">
      <p className="kicker">
        <Link href="/" className="hover:text-ink">
          Mediciones
        </Link>{' '}
        · {fecha(file.createdAt)} · motor {report.engine}
      </p>
      <h1 className="mt-3 font-display text-5xl">{brand.name}</h1>
      <p className="mt-2 font-mono text-xs text-ink-soft">
        {file.config.prompts.length} prompts × {file.config.runsPerPrompt}{' '}
        pasadas = {report.totalRuns} consultas
        {ownDomain ? ` · dominio ${ownDomain}` : ''}
      </p>

      {/* Índice compuesto y desglose global */}
      <section className="mt-12 grid gap-10 border-t border-ink pt-6 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <figure className="m-0">
          <div className="flex items-baseline gap-2 font-display text-[7rem] leading-none tabular-nums">
            {num(report.index10)}
            <span className="font-mono text-sm tracking-[0.08em] text-ink-soft">
              / 10
            </span>
          </div>
          <figcaption className="kicker mt-4">Índice de Eco · v0</figcaption>
        </figure>
        <div>
          {globalRows.map((row) => (
            <div
              key={row.name}
              className="grid grid-cols-[minmax(110px,180px)_1fr_70px] items-center gap-4 border-b border-ink-faint py-3.5 first:border-t"
            >
              <span className="text-[15px] font-medium">
                {row.name}
                <small className="block text-xs font-normal text-ink-soft">
                  {row.hint}
                </small>
              </span>
              <span className="relative h-[7px] rounded-[1px] bg-[repeating-linear-gradient(90deg,var(--color-ink-faint)_0_1px,transparent_1px_9px)]">
                <span
                  className="absolute inset-y-0 left-0 rounded-[1px] bg-signal"
                  style={{ width: `${Math.round(row.value * 100)}%` }}
                />
              </span>
              <span className="text-right font-mono text-[13px] tabular-nums">
                {row.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Desglose por prompt con el detalle de cada pasada */}
      <section className="mt-16">
        <div className="mb-6 flex items-baseline gap-4 border-t border-ink pt-3">
          <span className="font-mono text-[11px] font-medium tracking-[0.14em] text-alarm">
            REG. 01
          </span>
          <h2 className="font-display text-2xl">Registro por prompt</h2>
          <span className="kicker ml-auto hidden sm:inline">
            ● mención con cita · ○ mención · × sin mención
          </span>
        </div>
        <ol className="border-t border-ink-faint">
          {report.prompts.map((p) => {
            const runScores = report.runScores.filter(
              (s) => s.promptIndex === p.promptIndex,
            );
            return (
              <li
                key={p.promptIndex}
                className="grid gap-x-8 gap-y-2 border-b border-ink-faint py-5 md:grid-cols-[minmax(0,1fr)_260px]"
              >
                <div>
                  <p className="text-[17px]">«{p.prompt}»</p>
                  <p className="mt-1 font-mono text-xs text-ink-soft">
                    presencia {pct(p.presence)} · cita {pct(p.domainCited)} ·{' '}
                    {p.avgPosition === null
                      ? 'no aparece'
                      : `posición media ${num(p.avgPosition)}`}
                  </p>
                </div>
                <div className="flex items-center gap-2 md:justify-end">
                  {runScores.map((s) => (
                    <span
                      key={s.runIndex}
                      title={`pasada ${s.runIndex + 1}: ${
                        s.mentioned
                          ? `mención en posición ${s.position}${s.domainCited ? ', con cita' : ', sin cita'}`
                          : 'sin mención'
                      }`}
                      className={`flex h-6 w-6 items-center justify-center rounded-full border font-mono text-[11px] ${
                        s.mentioned && s.domainCited
                          ? 'border-signal bg-signal text-paper'
                          : s.mentioned
                            ? 'border-ink text-ink'
                            : 'border-alarm text-alarm'
                      }`}
                    >
                      {s.mentioned ? (s.position ?? '·') : '×'}
                    </span>
                  ))}
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      {/* Auditoría de fuentes: la bibliografía del motor */}
      <section className="mt-16">
        <div className="mb-6 flex items-baseline gap-4 border-t border-ink pt-3">
          <span className="font-mono text-[11px] font-medium tracking-[0.14em] text-alarm">
            REG. 02
          </span>
          <h2 className="font-display text-2xl">Fuentes citadas</h2>
          <span className="kicker ml-auto">
            {sources.length} dominios distintos
          </span>
        </div>
        <div className="rounded-[2px] border border-l-2 border-ink-faint border-l-alarm bg-panel">
          {sources.length === 0 ? (
            <p className="p-6 text-ink-soft">
              El motor no devolvió fuentes en esta medición.
            </p>
          ) : (
            sources.map(([host, count], i) => (
              <div
                key={host}
                className="grid grid-cols-[44px_minmax(0,1fr)_auto_auto] items-baseline gap-4 border-b border-ink-faint px-5 py-3 last:border-b-0"
              >
                <span className="font-mono text-xs text-ink-soft">
                  [{String(i + 1).padStart(2, '0')}]
                </span>
                <span className="truncate font-medium">{host}</span>
                <span className="font-mono text-xs text-ink-soft">
                  {count}/{report.totalRuns} pasadas
                </span>
                {host === ownDomain || (ownDomain && host.endsWith(`.${ownDomain}`)) ? (
                  <span className="rounded-[2px] border border-signal px-2 py-0.5 font-mono text-[10px] font-medium tracking-[0.12em] text-signal uppercase">
                    Tu dominio
                  </span>
                ) : (
                  <span className="font-mono text-[10px] text-ink-faint">—</span>
                )}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

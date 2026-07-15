import Link from 'next/link';
import { fecha, num, pct } from './format';
import { listRuns } from './lib/runs';

// El dashboard lee data/runs/ en cada petición: sin caché, lo que hay
// en disco es lo que se ve.
export const dynamic = 'force-dynamic';

export default function HomePage() {
  const runs = listRuns();

  return (
    <div className="pt-10">
      <div className="mb-8 flex items-baseline gap-4 border-t border-ink pt-3">
        <span className="font-mono text-[11px] font-medium tracking-[0.14em] text-alarm">
          REG.
        </span>
        <h1 className="font-display text-3xl">Mediciones</h1>
        <span className="kicker ml-auto">
          {runs.length} {runs.length === 1 ? 'registro' : 'registros'}
        </span>
      </div>

      {runs.length === 0 ? (
        <div className="chart-paper rounded-[2px] border border-ink-faint p-10">
          <p className="max-w-[42em] text-lg">
            Aún no hay mediciones guardadas. Lanza la primera desde la
            terminal:
          </p>
          <pre className="mt-4 font-mono text-sm text-ink-soft">
            npm run measure
          </pre>
        </div>
      ) : (
        <ul className="border-t border-ink-faint">
          {runs.map((run) => (
            <li key={run.id} className="border-b border-ink-faint">
              <Link
                href={`/runs/${run.id}`}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-6 gap-y-1 py-4 transition-colors hover:bg-panel-hover sm:grid-cols-[170px_minmax(0,1fr)_110px_90px_90px]"
              >
                <span className="font-mono text-xs text-ink-soft">
                  {fecha(run.createdAt)}
                </span>
                <span className="text-lg font-medium">{run.brand}</span>
                <span className="kicker hidden sm:inline">{run.engine}</span>
                <span className="kicker hidden sm:inline">
                  {pct(run.presence)} pres.
                </span>
                <span className="text-right font-display text-2xl tabular-nums">
                  {num(run.index10)}
                  <span className="font-mono text-[10px] text-ink-soft">
                    {' '}
                    /10
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

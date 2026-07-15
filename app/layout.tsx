import type { Metadata } from 'next';
import { IBM_Plex_Mono, Instrument_Serif, Newsreader } from 'next/font/google';
import Link from 'next/link';
import './globals.css';

const instrumentSerif = Instrument_Serif({
  weight: '400',
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-instrument-serif',
});

const newsreader = Newsreader({
  weight: ['400', '500'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-newsreader',
});

const plexMono = IBM_Plex_Mono({
  weight: ['400', '500'],
  subsets: ['latin'],
  variable: '--font-plex-mono',
});

export const metadata: Metadata = {
  title: 'EchoGEO — Estación de medición',
  description:
    'Mide la visibilidad de tu marca en las respuestas de los motores de IA',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body
        className={`${instrumentSerif.variable} ${newsreader.variable} ${plexMono.variable} bg-paper font-body text-ink antialiased`}
      >
        <div className="mx-auto max-w-[1120px] px-5 sm:px-10">
          <header className="relative border-b-2 border-ink after:absolute after:inset-x-0 after:bottom-[3px] after:border-b after:border-ink">
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 py-4">
              <Link href="/" className="font-display text-[28px]">
                Echo<em className="italic text-signal">GEO</em>
              </Link>
              <nav className="kicker flex gap-5">
                <span>Estación de medición</span>
                <Link href="/" className="hover:text-ink">
                  Mediciones
                </Link>
              </nav>
            </div>
          </header>
          <main className="min-h-[70vh] pb-24">{children}</main>
          <footer className="border-t border-ink-faint py-5">
            <p className="kicker">EchoGEO · Boletín interno · 2026</p>
          </footer>
        </div>
      </body>
    </html>
  );
}

import type { CurrentEventQueryResult } from "@/sanity/types";

interface HeroProps {
  event: CurrentEventQueryResult;
}

export function Hero({ event }: HeroProps) {
  return (
    <header className="relative overflow-hidden bg-ink text-cream">
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,#fff_0%,transparent_45%),radial-gradient(circle_at_80%_70%,#fff_0%,transparent_50%)]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-5 sm:px-8 py-24 sm:py-28 md:py-32">
        <div className="flex flex-col gap-6 sm:gap-8 max-w-3xl">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] uppercase tracking-editorial text-cream/70">
            <span>TRAMA</span>
            {event?.location && <span aria-hidden>·</span>}
            {event?.location && <span>{event.location}</span>}
          </div>

          {/* TODO: replace <br /> with CSS word-break/overflow-wrap to avoid hardcoded line breaks hurting SEO */}
          <h1 className="font-serif font-light text-[clamp(3rem,12vw,8.5rem)] leading-[0.92] tracking-tight">
            Desfile
            <br />
            Manifesto
            <br />
            Amazonense
            <span className="text-cream/40">.</span>
          </h1>

          <nav
            aria-label="Seções principais"
            className="flex flex-wrap items-center gap-y-2 pt-2 text-[11px] uppercase tracking-editorial"
          >
            <a
              href="#looks"
              className="text-cream/70 hover:text-cream transition-colors"
            >
              Looks
            </a>
            <span aria-hidden className="mx-4 text-cream/40">·</span>
            <a
              href="#sobre"
              className="text-cream/70 hover:text-cream transition-colors"
            >
              Sobre
            </a>
            <span aria-hidden className="mx-4 text-cream/40">·</span>
            <a
              href="#marcas"
              className="text-cream/70 hover:text-cream transition-colors"
            >
              Marcas & Criativos
            </a>
            <span aria-hidden className="mx-4 text-cream/40">·</span>
            <a
              href="#creditos"
              className="text-cream/70 hover:text-cream transition-colors"
            >
              Créditos
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}

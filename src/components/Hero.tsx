import { evento } from "@/lib/data";

export function Hero() {
  return (
    <header className="relative overflow-hidden bg-ink text-cream">
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,#fff_0%,transparent_45%),radial-gradient(circle_at_80%_70%,#fff_0%,transparent_50%)]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-5 sm:px-8 py-24 sm:py-28 md:py-32">
        <div className="flex flex-col gap-6 sm:gap-8 max-w-3xl">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] uppercase tracking-editorial text-cream/70">
            <span>{evento.edicao}</span>
            <span aria-hidden>·</span>
            <span>{evento.local}</span>
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

          <p className="font-serif text-xl sm:text-2xl md:text-3xl leading-snug text-cream/90 max-w-2xl">
            {evento.conceito}
          </p>

          <nav
            aria-label="Seções principais"
            className="flex flex-col sm:flex-row sm:flex-wrap gap-y-3 sm:gap-x-6 sm:gap-y-2 pt-2 text-[11px] uppercase tracking-editorial"
          >
            <a
              href="#sobre"
              className="text-cream/70 hover:text-cream transition-colors"
            >
              Sobre o evento
            </a>
            <a
              href="#marcas"
              className="text-cream/70 hover:text-cream transition-colors"
            >
              Marcas & Criativos
            </a>
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

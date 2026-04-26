import { evento } from "@/lib/data";

export function Hero() {
  return (
    <header className="relative overflow-hidden bg-ink text-cream">
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,#fff_0%,transparent_45%),radial-gradient(circle_at_80%_70%,#fff_0%,transparent_50%)]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-5 sm:px-8 py-16 sm:py-24 md:py-32">
        <div className="flex flex-col gap-6 sm:gap-8 max-w-3xl">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] uppercase tracking-editorial text-cream/70">
            <span>{evento.edicao}</span>
            <span aria-hidden>·</span>
            <time dateTime={evento.dataISO}>{evento.dataLegivel}</time>
            <span aria-hidden>·</span>
            <span>
              {evento.local}
            </span>
          </div>

          <h1 className="font-serif font-light text-[clamp(3rem,12vw,8.5rem)] leading-[0.92] tracking-tight">
            {evento.nome}
            <span className="text-cream/40">.</span>
          </h1>

          <p className="font-serif text-xl sm:text-2xl md:text-3xl leading-snug text-cream/90 max-w-2xl">
            {evento.conceito}
          </p>

          <div className="flex items-center gap-3 pt-2">
            <a
              href="#looks"
              className="inline-flex items-center gap-2 border border-cream/30 hover:border-cream hover:bg-cream hover:text-ink transition-colors px-5 py-3 text-[11px] uppercase tracking-editorial"
            >
              Ver os looks
            </a>
            <a
              href="#sobre"
              className="inline-flex items-center gap-2 px-5 py-3 text-[11px] uppercase tracking-editorial text-cream/70 hover:text-cream transition-colors"
            >
              Sobre o evento
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}

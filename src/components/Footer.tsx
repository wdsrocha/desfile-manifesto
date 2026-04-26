import { evento } from "@/lib/data";

export function Footer() {
  return (
    <footer className="bg-ink text-cream py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <p className="font-serif text-3xl sm:text-4xl leading-none">
          {evento.nome}
          <span className="text-cream/40">.</span>
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] uppercase tracking-editorial text-cream/60">
          <span>{evento.edicao}</span>
          <span aria-hidden>·</span>
          <span>{evento.local}</span>
        </div>
      </div>
    </footer>
  );
}

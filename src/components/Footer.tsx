import { evento, produtoraExecutiva } from "@/lib/data";
import { instagramUrl } from "@/lib/instagram";

export function Footer() {
  return (
    <footer className="bg-ink text-cream py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-serif text-3xl sm:text-4xl leading-none">
            {evento.nome}
            <span className="text-cream/40">.</span>
          </p>
          <p className="mt-2 text-[11px] uppercase tracking-editorial text-cream/60">
            {evento.edicao} · <span className="sm:hidden">{evento.dataPtBr}</span><span className="hidden sm:inline">{evento.dataLegivel}</span>
          </p>
        </div>

        <div className="flex flex-col gap-1 text-sm text-cream/70">
          <span className="text-[11px] uppercase tracking-editorial text-cream/50">
            Produção executiva
          </span>
          <a
            href={instagramUrl(produtoraExecutiva.instagram)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-cream hover:underline underline-offset-4"
          >
            {produtoraExecutiva.nomeCompleto}
          </a>
          <span className="text-cream/50">{produtoraExecutiva.instagram}</span>
        </div>
      </div>

      <div className="mt-10 pt-6 border-t border-cream/10 mx-auto max-w-6xl px-5 sm:px-8 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between text-[11px] uppercase tracking-editorial text-cream/45">
        <span>© {new Date().getFullYear()} Manifesto</span>
        <span>{evento.local}</span>
      </div>
    </footer>
  );
}

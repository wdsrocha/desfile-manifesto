import { evento, produtoraExecutiva } from "@/lib/data";
import { instagramUrl } from "@/lib/instagram";
import { SectionHeader } from "./SectionHeader";
import { InstagramIcon } from "./BrandIcons";

export function AboutSection() {
  return (
    <section
      id="sobre"
      className="bg-bone text-ink py-16 sm:py-24 md:py-32 border-y border-ink/5"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8 grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16">
        <div className="md:col-span-7">
          <SectionHeader
            title="Sobre o evento"
            description={evento.descricaoLonga}
          />

          <dl className="mt-10 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-6 text-sm">
            <div>
              <dt className="editorial-eyebrow mb-1">Edição</dt>
              <dd>{evento.edicao}</dd>
            </div>
            <div>
              <dt className="editorial-eyebrow mb-1">Data</dt>
              <dd>
                <time dateTime={evento.dataISO}>
                  <span className="sm:hidden">{evento.dataPtBr}</span>
                  <span className="hidden sm:inline">{evento.dataLegivel}</span>
                </time>
              </dd>
            </div>
            <div>
              <dt className="editorial-eyebrow mb-1">Local</dt>
              <dd>
                {evento.local}
                <br />
                <span className="text-ink/60">{evento.endereco}</span>
              </dd>
            </div>
          </dl>
        </div>

        <aside className="md:col-span-5 md:pl-8 md:border-l md:border-ink/10">
          <span className="editorial-eyebrow">Produção executiva</span>

          <div className="mt-5 flex items-center gap-4">
            {produtoraExecutiva.imagemUrl && (
              <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full overflow-hidden bg-gradient-to-br from-ink/[0.08] to-ink/[0.16] shrink-0">
                <img
                  src={produtoraExecutiva.imagemUrl}
                  alt={produtoraExecutiva.nomeCompleto}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            <div>
              <p className="font-serif text-2xl sm:text-3xl leading-tight">
                {produtoraExecutiva.nomeCompleto}
              </p>
              <p className="text-[11px] uppercase tracking-editorial text-ink/60 mt-1">
                {produtoraExecutiva.papel}
              </p>
            </div>
          </div>

          <p className="mt-6 text-ink/75 text-sm sm:text-base leading-relaxed">
            Produção executiva e direção de elenco por Glícia Cáuper.
          </p>

          <a
            href={instagramUrl(produtoraExecutiva.instagram)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 border border-ink/15 hover:border-ink hover:bg-ink hover:text-cream transition-colors px-4 py-2.5 text-[11px] uppercase tracking-editorial"
          >
            <InstagramIcon size={14} strokeWidth={1.5} />
            {produtoraExecutiva.instagram}
          </a>
        </aside>
      </div>
    </section>
  );
}

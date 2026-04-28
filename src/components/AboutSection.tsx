import Image from "next/image";
import { evento, proximoDesfile } from "@/lib/data";
import type { ExecutiveProducerQueryResult } from "@/sanity/types";
import { urlForImage } from "@/sanity/image";
import { instagramUrl } from "@/lib/instagram";
import { SectionHeader } from "./SectionHeader";

interface AboutSectionProps {
  executiveProducer: ExecutiveProducerQueryResult;
}

export function AboutSection({ executiveProducer }: AboutSectionProps) {
  const producerName =
    executiveProducer?.stageName || executiveProducer?.name || "";
  const producerImage = executiveProducer?.image?.asset
    ? urlForImage(executiveProducer.image).width(160).height(160).url()
    : null;

  return (
    <section
      id="sobre"
      className="bg-bone text-ink py-16 sm:py-24 md:py-32 border-y border-ink/5"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8 grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16">
        <div className="md:col-span-7">
          <SectionHeader title="Sobre o evento" />

          <div className="mt-3 max-w-2xl flex flex-col gap-4 text-ink/70 text-sm sm:text-base leading-relaxed">
            <p>{evento.intro}</p>
            <p>{evento.descricaoLonga}</p>
          </div>

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
              <dd>{evento.local}</dd>
            </div>
          </dl>

          <div className="mt-10 pt-8 border-t border-ink/10">
            <span className="editorial-eyebrow">Próximo desfile</span>
            <dl className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-6 text-sm">
              <div>
                <dt className="editorial-eyebrow mb-1">Edição</dt>
                <dd>{proximoDesfile.edicao}</dd>
              </div>
              <div>
                <dt className="editorial-eyebrow mb-1">Data</dt>
                <dd>{proximoDesfile.data}</dd>
              </div>
              <div>
                <dt className="editorial-eyebrow mb-1">Local</dt>
                <dd>{proximoDesfile.local}</dd>
              </div>
            </dl>
          </div>
        </div>

        {executiveProducer && (
          <aside className="md:col-span-5 md:pl-8 md:border-l md:border-ink/10">
            <div className="flex items-center gap-4">
              {producerImage && (
                <div className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-full overflow-hidden bg-gradient-to-br from-ink/[0.08] to-ink/[0.16] shrink-0">
                  <Image
                    src={producerImage}
                    alt={producerName}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </div>
              )}
              <div>
                <p className="font-serif text-2xl sm:text-3xl leading-tight">
                  {producerName}
                </p>
                <p className="text-[11px] uppercase tracking-editorial text-ink/60 mt-1">
                  Produção Executiva
                </p>
              </div>
            </div>

            <p className="mt-6 text-ink/75 text-sm sm:text-base leading-relaxed">
              Produção executiva e direção de elenco por {producerName}.
            </p>

            {executiveProducer.instagram && (
              <a
                href={instagramUrl(executiveProducer.instagram)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2 border border-ink/15 hover:border-ink hover:bg-ink hover:text-cream transition-colors px-4 py-2.5 text-[11px] uppercase tracking-editorial"
              >
                {executiveProducer.instagram}
              </a>
            )}
          </aside>
        )}
      </div>
    </section>
  );
}

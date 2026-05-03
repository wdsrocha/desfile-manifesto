import Image from "next/image";
import type {
  CurrentEventQueryResult,
  ExecutiveProducerQueryResult,
  NextEventQueryResult,
} from "@/sanity/types";
import { urlForImage } from "@/sanity/image";
import { instagramUrl } from "@/lib/instagram";
import { SectionHeader } from "./SectionHeader";

interface AboutSectionProps {
  event: CurrentEventQueryResult;
  nextEvent: NextEventQueryResult;
  executiveProducer: ExecutiveProducerQueryResult;
}

export function AboutSection({
  event,
  nextEvent,
  executiveProducer,
}: AboutSectionProps) {
  const producerName =
    executiveProducer?.stageName || executiveProducer?.name || "";
  const producerImage = executiveProducer?.image?.asset
    ? urlForImage(executiveProducer.image).width(160).height(160).url()
    : null;
  const producerLqip = executiveProducer?.image?.lqip ?? undefined;

  return (
    <section
      id="sobre"
      className="bg-bone text-ink py-16 sm:py-24 md:py-32 border-y border-ink/5"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8 grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16">
        <div className="md:col-span-7">
          <SectionHeader title="Sobre o evento" />

          <div className="mt-3 max-w-2xl flex flex-col gap-4 text-ink/70 text-sm sm:text-base leading-relaxed">
            {event?.intro && <p>{event.intro}</p>}
            {event?.longDescription && <p>{event.longDescription}</p>}
          </div>

          <dl className="mt-10 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-6 text-sm">
            {event?.edition && (
              <div>
                <dt className="editorial-eyebrow mb-1">Edição</dt>
                <dd>{event.edition}</dd>
              </div>
            )}
            {(event?.humanDate || event?.displayDate) && (
              <div>
                <dt className="editorial-eyebrow mb-1">Data</dt>
                <dd>
                  <time dateTime={event.isoDate ?? undefined}>
                    {event.displayDate && (
                      <span className="sm:hidden">{event.displayDate}</span>
                    )}
                    {event.humanDate && (
                      <span className="hidden sm:inline">
                        {event.humanDate}
                      </span>
                    )}
                  </time>
                </dd>
              </div>
            )}
            {event?.location && (
              <div>
                <dt className="editorial-eyebrow mb-1">Local</dt>
                <dd>{event.location}</dd>
              </div>
            )}
          </dl>

          {nextEvent && (
            <div className="mt-10 pt-8 border-t border-ink/10">
              <span className="editorial-eyebrow">Próximo desfile</span>
              <dl className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-6 text-sm">
                {nextEvent.edition && (
                  <div>
                    <dt className="editorial-eyebrow mb-1">Edição</dt>
                    <dd>{nextEvent.edition}</dd>
                  </div>
                )}
                {nextEvent.date && (
                  <div>
                    <dt className="editorial-eyebrow mb-1">Data</dt>
                    <dd>{nextEvent.date}</dd>
                  </div>
                )}
                {nextEvent.location && (
                  <div>
                    <dt className="editorial-eyebrow mb-1">Local</dt>
                    <dd>{nextEvent.location}</dd>
                  </div>
                )}
              </dl>
            </div>
          )}
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
                    placeholder={producerLqip ? "blur" : "empty"}
                    blurDataURL={producerLqip}
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

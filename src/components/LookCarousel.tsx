"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { AllLooksQueryResult } from "@/sanity/types";
import { LookImage } from "./LookImage";
import { PhotographerCredit } from "./PhotographerCredit";

type LookImageItem = NonNullable<AllLooksQueryResult[number]["images"]>[number];

interface LookCarouselProps {
  images: LookImageItem[];
}

export function LookCarousel({ images }: LookCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selected, setSelected] = useState(0);
  const [snaps, setSnaps] = useState<number[]>([]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback(
    (index: number) => emblaApi?.scrollTo(index),
    [emblaApi],
  );

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
    setSnaps(emblaApi.scrollSnapList());
    setSelected(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") scrollPrev();
      else if (e.key === "ArrowRight") scrollNext();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [scrollPrev, scrollNext]);

  const multiple = images.length > 1;

  return (
    <div className="relative aspect-[3/4] w-full bg-ink sm:w-auto sm:h-[88vh] sm:flex-shrink-0 sm:aspect-[9/16] group/carousel">
      <div ref={emblaRef} className="overflow-hidden h-full">
        <div className="flex h-full">
          {images.map((img, i) => {
            const imageRatio = img.asset?.metadata?.dimensions?.aspectRatio;
            const fit: "cover" | "contain" =
              typeof imageRatio === "number" && imageRatio < 3 / 4
                ? "cover"
                : "contain";
            return (
              <div
                key={i}
                className="relative flex-[0_0_100%] min-w-0 h-full"
              >
                <LookImage
                  image={img}
                  alt={img.alt || `Imagem ${i + 1}`}
                  priority={i === 0}
                  sizes="(min-width: 640px) 50vh, 100vw"
                  className="h-full w-full"
                  objectFit={fit}
                  blurDataURL={img.asset?.metadata?.lqip ?? undefined}
                />
                <PhotographerCredit instagram={img.photographer?.instagram} />
              </div>
            );
          })}
        </div>
      </div>

      {multiple && (
        <>
          <button
            type="button"
            aria-label="Imagem anterior"
            onClick={scrollPrev}
            className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 z-10 h-10 w-10 items-center justify-center rounded-full bg-cream/85 hover:bg-cream text-ink shadow-sm border border-ink/10 opacity-0 group-hover/carousel:opacity-100 focus-visible:opacity-100 transition-opacity"
          >
            <ChevronLeft size={18} strokeWidth={1.5} />
          </button>
          <button
            type="button"
            aria-label="Próxima imagem"
            onClick={scrollNext}
            className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 z-10 h-10 w-10 items-center justify-center rounded-full bg-cream/85 hover:bg-cream text-ink shadow-sm border border-ink/10 opacity-0 group-hover/carousel:opacity-100 focus-visible:opacity-100 transition-opacity"
          >
            <ChevronRight size={18} strokeWidth={1.5} />
          </button>

          <div className="absolute bottom-10 sm:bottom-12 left-0 right-0 z-20 flex justify-center gap-1.5 pointer-events-none">
            {snaps.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Ir para imagem ${i + 1}`}
                onClick={() => scrollTo(i)}
                className={`pointer-events-auto h-1.5 w-1.5 rounded-full transition-colors ${
                  i === selected ? "bg-cream" : "bg-cream/50 hover:bg-cream/75"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

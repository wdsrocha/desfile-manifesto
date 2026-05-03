"use client";

import { useCallback, useEffect, useState } from "react";
import type { AllLooksQueryResult } from "@/sanity/types";
import { urlForImage, IMAGE_QUALITY } from "@/sanity/image";
import { SectionHeader } from "./SectionHeader";
import { LookImage } from "./LookImage";
import { LookViewer } from "./LookViewer";

type Look = AllLooksQueryResult[number];

interface LooksSectionProps {
  looks: AllLooksQueryResult;
}

export function LooksSection({ looks }: LooksSectionProps) {
  const [active, setActive] = useState<Look | null>(null);

  useEffect(() => {
    const prefetchCovers = () => {
      for (const look of looks) {
        const cover = look.images?.[0];
        if (!cover?.asset) continue;
        const el = new window.Image();
        el.src = urlForImage(cover).width(1200).quality(IMAGE_QUALITY).url();
      }
    };
    if (typeof requestIdleCallback !== "undefined") {
      const id = requestIdleCallback(prefetchCovers, { timeout: 3000 });
      return () => cancelIdleCallback(id);
    }
    const id = setTimeout(prefetchCovers, 3000);
    return () => clearTimeout(id);
  }, [looks]);

  const prefetchModal = useCallback((look: Look) => {
    for (const img of look.images ?? []) {
      if (!img?.asset) continue;
      const el = new window.Image();
      el.src = urlForImage(img).width(1200).quality(IMAGE_QUALITY).url();
    }
  }, []);

  return (
    <section
      id="looks"
      className="bg-cream text-ink py-24 sm:py-28 md:py-32"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeader title="Looks da passarela" />

        {looks.length === 0 ? (
          <div className="mt-10 sm:mt-14 max-w-md text-ink/70 text-sm sm:text-base flex flex-col gap-3 leading-relaxed">
            <p>Atualizaremos a galeria após o desfile.</p>
            <p>
              Enquanto isso, acompanhe atualizações no Instagram{" "}
              <a
                href="https://instagram.com/gliciacauper"
                target="_blank"
                rel="noreferrer noopener"
                className="text-ink underline underline-offset-2 decoration-ink/30 hover:decoration-ink transition-colors"
              >
                @gliciacauper
              </a>
              . Alguns looks com marcas e modelos já estão{" "}
              <a
                href="https://canva.link/desfile-manifesto-amazonense"
                target="_blank"
                rel="noreferrer noopener"
                className="text-ink underline underline-offset-2 decoration-ink/30 hover:decoration-ink transition-colors"
              >
                neste link
              </a>
              .
            </p>
          </div>
        ) : (
          <ul className="mt-10 sm:mt-14 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {looks.map((look, i) => {
              const modelName = look.model?.name?.trim() ?? "";
              const cover = look.images?.[0] ?? null;
              if (!cover) {
                if (typeof window !== "undefined") {
                  console.warn(`Look ${look._id} has no images; skipping cover.`);
                }
                return null;
              }
              const openLabel = modelName ? `Abrir look — ${modelName}` : "Abrir look";
              const imageAlt = modelName ? `Look — ${modelName}` : "Look";
              return (
                <li key={look._id}>
                  <button
                    type="button"
                    onClick={() => setActive(look)}
                    onMouseEnter={() => prefetchModal(look)}
                    onTouchStart={() => prefetchModal(look)}
                    className="group block w-full text-left"
                    aria-label={openLabel}
                  >
                    <LookImage
                      image={cover}
                      alt={imageAlt}
                      sizes="(min-width: 1024px) 22vw, (min-width: 640px) 30vw, 45vw"
                      priority={i < 4}
                      className="aspect-[9/16] transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                      aspectRatio={[9, 16]}
                    />
                    {modelName ? (
                      <div className="mt-2 sm:mt-3">
                        <span className="editorial-eyebrow block truncate">
                          {modelName}
                        </span>
                      </div>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <LookViewer look={active} onClose={() => setActive(null)} />
    </section>
  );
}

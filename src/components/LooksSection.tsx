"use client";

import { useState } from "react";
import type { AllLooksQueryResult } from "@/sanity/types";
import { SectionHeader } from "./SectionHeader";
import { LookImage } from "./LookImage";
import { LookViewer } from "./LookViewer";

type Look = AllLooksQueryResult[number];

interface LooksSectionProps {
  looks: AllLooksQueryResult;
}

export function LooksSection({ looks }: LooksSectionProps) {
  const [active, setActive] = useState<Look | null>(null);

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
              const number = look.lookNumber ?? String(i + 1).padStart(2, "0");
              return (
                <li key={look._id}>
                  <button
                    type="button"
                    onClick={() => setActive(look)}
                    className="group block w-full text-left"
                    aria-label={`Abrir look ${number}`}
                  >
                    <LookImage
                      image={look.image}
                      alt={`Look ${number}`}
                      sizes="(min-width: 1024px) 22vw, (min-width: 640px) 30vw, 45vw"
                      priority={i < 4}
                      className="aspect-[9/16] transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                    />
                    <div className="mt-2 sm:mt-3 flex items-baseline justify-between gap-2">
                      <span className="editorial-eyebrow">{number}</span>
                      <span className="text-[11px] text-ink/50 truncate max-w-[60%] text-right">
                        {look.model?.name ?? ""}
                      </span>
                    </div>
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

"use client";

import { useState } from "react";
import { looks, type Look } from "@/lib/data";
import { SectionHeader } from "./SectionHeader";
import { LookImage } from "./LookImage";
import { LookViewer } from "./LookViewer";

export function LooksSection() {
  const [active, setActive] = useState<Look | null>(null);

  return (
    <section
      id="looks"
      className="bg-cream text-ink py-16 sm:py-24 md:py-32"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeader title="Looks da passarela" />

        {looks.length === 0 ? (
          <p className="mt-10 sm:mt-14 max-w-md text-ink/60 text-sm sm:text-base">
            Atualizaremos a galeria após o desfile.
          </p>
        ) : (
          <ul className="mt-10 sm:mt-14 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {looks.map((look, i) => (
              <li key={look.id}>
                <button
                  type="button"
                  onClick={() => setActive(look)}
                  className="group block w-full text-left"
                  aria-label={`Abrir ${look.title}`}
                >
                  <LookImage
                    src={look.imagemUrl}
                    alt={look.title}
                    sizes="(min-width: 1024px) 22vw, (min-width: 640px) 30vw, 45vw"
                    priority={i < 4}
                    className="aspect-[3/4] transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                  />
                  <div className="mt-2 sm:mt-3 flex items-baseline justify-between gap-2">
                    <span className="editorial-eyebrow">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-[11px] text-ink/50 truncate max-w-[60%] text-right">
                      {look.creditos.modelo}
                    </span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <LookViewer look={active} onClose={() => setActive(null)} />
    </section>
  );
}

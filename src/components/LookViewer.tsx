"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import type { AllLooksQueryResult } from "@/sanity/types";
import { urlForImage } from "@/sanity/image";
import { LookCarousel } from "./LookCarousel";

type Look = AllLooksQueryResult[number];

interface LookViewerProps {
  look: Look | null;
  onClose: () => void;
}

export function LookViewer({ look, onClose }: LookViewerProps) {
  const open = look !== null;

  useEffect(() => {
    if (!look) return;
    for (const img of look.images ?? []) {
      if (!img?.asset) continue;
      const url = urlForImage(img).width(1200).quality(75).url();
      const el = new Image();
      el.src = url;
    }
  }, [look]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-hidden={!open}
      className={`fixed inset-0 z-50 ${open ? "pointer-events-auto" : "pointer-events-none"}`}
    >
      <button
        type="button"
        aria-label="Fechar"
        onClick={onClose}
        className={`absolute inset-0 bg-ink/70 backdrop-blur-sm transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      />

      <div
        className={`
          absolute left-0 right-0 bottom-0 max-h-[92vh]
          sm:left-1/2 sm:right-auto sm:bottom-auto sm:top-1/2
          sm:-translate-x-1/2 sm:-translate-y-1/2
          sm:max-h-[88vh] sm:w-auto sm:max-w-[min(880px,94vw)]
          bg-ink sm:bg-cream text-ink shadow-2xl
          rounded-t-2xl sm:rounded-2xl
          overflow-hidden
          transition-transform duration-300 ease-out
          ${open ? "translate-y-0 sm:translate-y-[-50%]" : "translate-y-full sm:translate-y-[calc(-50%+12px)]"}
          ${open ? "opacity-100" : "opacity-0"}
        `}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="absolute top-3 right-3 z-10 inline-flex items-center justify-center h-10 w-10 rounded-full bg-cream/90 hover:bg-cream text-ink shadow-sm border border-ink/10"
        >
          <X size={18} strokeWidth={1.5} />
        </button>

        <div className="sm:hidden flex justify-center pt-2">
          <span className="h-1 w-10 rounded-full bg-cream/30" />
        </div>

        {look && (
          <div className="flex flex-col sm:flex-row max-h-[92vh] sm:max-h-[88vh] overflow-y-auto sm:overflow-visible">
            <LookCarousel images={look.images ?? []} />

            <div className="bg-cream px-6 pt-6 pb-10 sm:p-8 md:p-10 flex flex-col gap-6 sm:w-[min(360px,42vw)] sm:max-h-[88vh] sm:overflow-y-auto">
              <div className="flex flex-col gap-5 text-sm sm:text-base">
                {look.model?.name && (
                  <div>
                    <div className="editorial-eyebrow mb-1">Modelo</div>
                    <div className="text-ink leading-snug">
                      {look.model.name}
                    </div>
                    {look.model.instagram && (
                      <a
                        href={`https://instagram.com/${look.model.instagram.replace(/^@/, "")}`}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="mt-0.5 inline-block text-[13px] text-ink/60 hover:text-ink transition-colors"
                      >
                        {look.model.instagram}
                      </a>
                    )}
                  </div>
                )}

                {look.styling && look.styling.length > 0 && (
                  <div>
                    <div className="editorial-eyebrow mb-1">Styling</div>
                    <ul className="flex flex-col gap-1 text-ink leading-snug">
                      {look.styling.map((line, i) => (
                        <li key={i}>{line}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

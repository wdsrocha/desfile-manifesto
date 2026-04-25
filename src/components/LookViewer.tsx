"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import type { Look } from "@/lib/data";
import { LookImage } from "./LookImage";

interface LookViewerProps {
  look: Look | null;
  onClose: () => void;
}

export function LookViewer({ look, onClose }: LookViewerProps) {
  const open = look !== null;

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
        className={`absolute inset-0 bg-ink/70 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />

      <div
        className={`
          absolute left-0 right-0 bottom-0 max-h-[92vh]
          sm:left-1/2 sm:right-auto sm:bottom-auto sm:top-1/2
          sm:-translate-x-1/2 sm:-translate-y-1/2
          sm:max-h-[90vh] sm:w-[min(960px,92vw)]
          bg-cream text-ink shadow-2xl
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
          <span className="h-1 w-10 rounded-full bg-ink/15" />
        </div>

        {look && (
          <div className="grid grid-cols-1 sm:grid-cols-[1.2fr_1fr] max-h-[92vh] sm:max-h-[90vh] overflow-y-auto">
            <LookImage
              src={look.imagemUrl}
              alt={look.title}
              priority
              sizes="(min-width: 640px) 55vw, 100vw"
              className="aspect-[3/4] sm:aspect-auto sm:h-full"
            />

            <div className="p-6 sm:p-8 md:p-10 flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <span className="editorial-eyebrow">Look</span>
                <h3 className="font-serif text-2xl sm:text-3xl leading-tight">
                  {look.title}
                </h3>
              </div>

              <dl className="flex flex-col gap-5 text-sm sm:text-base">
                <div>
                  <dt className="editorial-eyebrow mb-1">Peça / Marca</dt>
                  <dd className="text-ink leading-snug">
                    {look.creditos.marca}
                  </dd>
                </div>
                <div>
                  <dt className="editorial-eyebrow mb-1">Styling</dt>
                  <dd className="text-ink leading-snug">
                    {look.creditos.styling}
                  </dd>
                </div>
                <div>
                  <dt className="editorial-eyebrow mb-1">Modelo</dt>
                  <dd className="text-ink leading-snug">
                    {look.creditos.modelo}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

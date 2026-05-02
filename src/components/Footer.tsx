import type { CurrentEventQueryResult } from "@/sanity/types";
import { instagramUrl } from "@/lib/instagram";

interface FooterProps {
  event: CurrentEventQueryResult;
}

export function Footer({ event }: FooterProps) {
  return (
    <footer className="bg-ink text-cream py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        {event?.name && (
          <p className="font-serif text-3xl sm:text-4xl leading-none">
            {event.name}
            <span className="text-cream/40">.</span>
          </p>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] uppercase tracking-editorial text-cream/60">
          {event?.edition && <span>{event.edition}</span>}
          {event?.edition && event?.location && <span aria-hidden>·</span>}
          {event?.location && <span>{event.location}</span>}
        </div>
        <p className="mt-8 text-[11px] text-cream/30">
          feito com ♥ por{" "}
          <a
            href={instagramUrl("@sharp.freestyle")}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-cream/60 transition-colors"
          >
            @sharp.freestyle
          </a>
        </p>
      </div>
    </footer>
  );
}

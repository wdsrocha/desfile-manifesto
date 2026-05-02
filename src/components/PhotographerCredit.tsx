"use client";

interface PhotographerCreditProps {
  instagram?: string | null;
}

export function PhotographerCredit({ instagram }: PhotographerCreditProps) {
  const handle = instagram?.replace(/^@/, "");
  if (!handle) return null;

  const display = `@${handle}`;

  return (
    <div className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none">
      <div className="bg-gradient-to-t from-ink/70 to-transparent pt-10 px-4 pb-3 sm:px-5 sm:pb-4">
        <div className="text-[12px] sm:text-[13px] leading-snug pointer-events-auto flex w-full flex-wrap items-baseline justify-center gap-x-1.5 text-center text-white/75">
          <span>
            foto por{" "}
            <a
              href={`https://instagram.com/${handle}`}
              target="_blank"
              rel="noreferrer noopener"
              className="underline underline-offset-2 decoration-white/30 hover:text-white hover:decoration-white/60 transition-colors"
            >
              {display}
            </a>
          </span>
        </div>
      </div>
    </div>
  );
}

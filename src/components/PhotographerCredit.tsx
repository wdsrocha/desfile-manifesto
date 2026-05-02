"use client";

interface PhotographerCreditProps {
  name?: string | null;
  instagram?: string | null;
}

export function PhotographerCredit({ name, instagram }: PhotographerCreditProps) {
  if (!name && !instagram) return null;

  const handle = instagram?.replace(/^@/, "");
  const display = handle ? `@${handle}` : null;

  return (
    <div className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none">
      <div className="bg-gradient-to-t from-ink/70 to-transparent pt-10 px-4 pb-3 sm:px-5 sm:pb-4">
        <div className="text-white text-[12px] sm:text-[13px] leading-snug pointer-events-auto inline-flex flex-wrap items-baseline gap-x-1.5">
          <span>
            Foto por{" "}
            {name ? (
              <span className="font-medium">{name}</span>
            ) : (
              handle && (
                <a
                  href={`https://instagram.com/${handle}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="font-medium underline underline-offset-2 decoration-white/30 hover:decoration-white/60 transition-colors"
                >
                  {display}
                </a>
              )
            )}
          </span>
          {name && handle && (
            <a
              href={`https://instagram.com/${handle}`}
              target="_blank"
              rel="noreferrer noopener"
              className="text-white/75 hover:text-white underline underline-offset-2 decoration-white/30 hover:decoration-white/60 transition-colors"
            >
              {display}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

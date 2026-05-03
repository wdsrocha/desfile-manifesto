import type { AllLooksQueryResult } from "@/sanity/types";
import { instagramUrl } from "@/lib/instagram";

type Pieces = AllLooksQueryResult[number]["pieces"];

interface LookPiecesProps {
  pieces: Pieces;
}

export function LookPieces({ pieces }: LookPiecesProps) {
  const validPieces = (pieces ?? []).filter(
    (p) => p.slot != null && (p.brands ?? []).length > 0,
  );

  if (validPieces.length === 0) return null;

  return (
    <ul className="flex flex-col gap-5">
      {validPieces.map((piece) => {
        const validBrands = (piece.brands ?? []).filter(
          (b) => b.name != null,
        );
        return (
          <li key={piece._key}>
            <div className="editorial-eyebrow">{piece.slot!.name}</div>
            <span className="flex flex-wrap items-baseline gap-x-1 text-ink leading-snug">
              {validBrands.flatMap((brand, i) => {
                const separator = i > 0 ? (
                  <span key={`sep-${brand._id}`} aria-hidden className="text-ink/30">
                    {"·"}
                  </span>
                ) : null;

                const node = brand.instagram ? (
                  <a
                    key={brand._id}
                    href={instagramUrl(brand.instagram)}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="underline underline-offset-2 decoration-ink/30 hover:decoration-ink/60 transition-colors"
                  >
                    {brand.name}
                  </a>
                ) : (
                  <span key={brand._id}>{brand.name}</span>
                );

                return separator ? [separator, node] : [node];
              })}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

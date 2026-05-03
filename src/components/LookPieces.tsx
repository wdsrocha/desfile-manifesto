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
    <div>
      <div className="editorial-eyebrow mb-1">Styling</div>
      <ul className="flex flex-col gap-1 text-ink leading-snug">
        {validPieces.map((piece) => {
          const validBrands = (piece.brands ?? []).filter(
            (b) => b.name != null,
          );
          return (
            <li key={piece._key} className="flex gap-2">
              <span className="shrink-0">{piece.slot!.name}</span>
              <span className="flex flex-wrap items-center gap-x-0.5">
                {validBrands.flatMap((brand, i) => {
                  const separator = i > 0 ? (
                    <span key={`sep-${brand._id}`} aria-hidden>
                      {" · "}
                    </span>
                  ) : null;

                  const node = brand.instagram ? (
                    <a
                      key={brand._id}
                      href={instagramUrl(brand.instagram)}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-ink/60 hover:text-ink transition-colors"
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
    </div>
  );
}

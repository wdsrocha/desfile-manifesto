import type { Pessoa } from "@/lib/data";
import { instagramUrl } from "@/lib/instagram";
import { InstagramIcon } from "./BrandIcons";

interface PortraitCardProps {
  pessoa: Pessoa;
  showRole?: boolean;
  priority?: boolean;
}

export function PortraitCard({
  pessoa,
  showRole = false,
  priority = false,
}: PortraitCardProps) {
  return (
    <a
      href={instagramUrl(pessoa.instagram)}
      target="_blank"
      rel="noopener noreferrer"
      className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/40"
    >
      <div className="relative aspect-[3/4] bg-gradient-to-br from-ink/[0.06] to-ink/[0.14] overflow-hidden">
        <img
          src={pessoa.imagemUrl}
          alt={pessoa.nomeArtisticoOuMarca}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />
        <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 flex items-end justify-between bg-gradient-to-t from-ink/60 via-ink/10 to-transparent text-cream opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="text-[11px] uppercase tracking-editorial">
            {pessoa.instagram}
          </span>
          <InstagramIcon size={16} strokeWidth={1.5} />
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-0.5">
        <p className="font-serif text-base sm:text-lg leading-tight text-ink truncate">
          {pessoa.nomeArtisticoOuMarca}
        </p>
        {showRole ? (
          <p className="text-[11px] uppercase tracking-editorial text-ink/55">
            {pessoa.papel}
          </p>
        ) : (
          <p className="text-[11px] text-ink/50 truncate">
            {pessoa.instagram}
          </p>
        )}
      </div>
    </a>
  );
}

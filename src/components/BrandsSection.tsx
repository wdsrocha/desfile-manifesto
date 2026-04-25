import { marcasECriativos } from "@/lib/data";
import { SectionHeader } from "./SectionHeader";
import { SocialLinks } from "./SocialLinks";

export function BrandsSection() {
  return (
    <section
      id="marcas"
      className="bg-cream text-ink py-16 sm:py-24 md:py-32"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeader
          eyebrow="Seção 03"
          title="Marcas & criativos"
          description="As assinaturas por trás de cada peça. Slow fashion, autoria e processos que valem ser olhados de perto."
        />

        <ul className="mt-10 sm:mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {marcasECriativos.map((m) => (
            <li
              key={m.id}
              className="flex flex-col bg-bone/60 border border-ink/[0.06] hover:border-ink/20 transition-colors p-5 sm:p-6"
            >
              <div className="flex items-start gap-4">
                <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full overflow-hidden bg-gradient-to-br from-ink/[0.08] to-ink/[0.16] shrink-0">
                  <img
                    src={m.imagemUrl}
                    alt={m.nomeArtisticoOuMarca}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-serif text-xl leading-tight truncate">
                    {m.nomeArtisticoOuMarca}
                  </p>
                  <p className="text-[11px] uppercase tracking-editorial text-ink/55 mt-1">
                    {m.papel}
                  </p>
                </div>
              </div>

              <p className="mt-4 text-sm text-ink/75 leading-relaxed flex-1">
                {m.miniBio}
              </p>

              <div className="mt-5 flex items-center justify-between gap-3 pt-4 border-t border-ink/[0.06]">
                <span className="text-[11px] text-ink/50 truncate">
                  {m.instagram}
                </span>
                <SocialLinks
                  instagram={m.instagram}
                  whatsappUrl={m.whatsappUrl}
                  nome={m.nomeArtisticoOuMarca}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

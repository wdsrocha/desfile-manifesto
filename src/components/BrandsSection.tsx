import type { AllBrandsQueryResult } from "@/sanity/types";
import { instagramUrl } from "@/lib/instagram";
import { SectionHeader } from "./SectionHeader";

interface BrandsSectionProps {
  brands: AllBrandsQueryResult;
}

export function BrandsSection({ brands }: BrandsSectionProps) {
  if (brands.length === 0) return null;

  return (
    <section
      id="marcas"
      className="bg-cream text-ink py-16 sm:py-24 md:py-32"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeader
          title="Marcas & Criativos"
          description="As assinaturas por trás de cada peça. Slow fashion, autoria e processos que valem ser olhados de perto."
        />

        <ul className="mt-10 sm:mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-ink/10 border border-ink/10">
          {brands.map((brand) => (
            <li
              key={brand._id}
              className="flex flex-col bg-cream p-6 sm:p-8 min-h-[200px]"
            >
              {brand.segment && (
                <p className="text-[11px] uppercase tracking-editorial text-ink/55">
                  {brand.segment}
                </p>
              )}
              <p className="font-serif text-2xl sm:text-3xl leading-[1.1] mt-3">
                {brand.name}
              </p>
              {brand.instagram && (
                <a
                  href={instagramUrl(brand.instagram)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto pt-6 text-sm text-ink/70 hover:text-ink underline-offset-4 hover:underline self-start transition-colors"
                >
                  {brand.instagram}
                </a>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

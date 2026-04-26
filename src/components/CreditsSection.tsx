import { creditos } from "@/lib/data";
import { instagramUrl } from "@/lib/instagram";
import { SectionHeader } from "./SectionHeader";

export function CreditsSection() {
  return (
    <section
      id="creditos"
      className="bg-bone text-ink py-16 sm:py-24 md:py-32 border-t border-ink/5"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeader
          title="Quem faz acontecer"
          description="Equipe, elenco e apoiadores que sustentam o Manifesto."
        />

        <dl className="mt-10 sm:mt-14 divide-y divide-ink/10 border-y border-ink/10">
          {creditos.map((grupo) => (
            <div
              key={grupo.titulo}
              className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-6 py-6 sm:py-8"
            >
              <dt className="md:col-span-3 editorial-eyebrow self-start">
                {grupo.titulo}
              </dt>
              <dd className="md:col-span-9 flex flex-wrap gap-x-4 gap-y-2 text-sm sm:text-base text-ink/80">
                {grupo.pessoas.map((p, i) =>
                  p.instagram ? (
                    <a
                      key={i}
                      href={instagramUrl(p.instagram)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-ink underline-offset-4 hover:underline transition-colors"
                    >
                      {p.instagram}
                    </a>
                  ) : (
                    <span key={i}>{p.nome}</span>
                  ),
                )}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

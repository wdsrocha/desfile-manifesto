import type { AllCreditGroupsQueryResult } from "@/sanity/types";
import { instagramUrl } from "@/lib/instagram";
import { SectionHeader } from "./SectionHeader";

interface CreditsSectionProps {
  groups: AllCreditGroupsQueryResult;
}

export function CreditsSection({ groups }: CreditsSectionProps) {
  if (groups.length === 0) return null;

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
          {groups.map((group) => (
            <div
              key={group._id}
              className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-6 py-6 sm:py-8"
            >
              <dt className="md:col-span-3 editorial-eyebrow self-start">
                {group.title}
              </dt>
              <dd className="md:col-span-9 flex flex-wrap gap-x-4 gap-y-2 text-sm sm:text-base text-ink/80">
                {group.entries?.map((entry) =>
                  entry.instagram ? (
                    <a
                      key={entry._key}
                      href={instagramUrl(entry.instagram)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-ink underline-offset-4 hover:underline transition-colors"
                    >
                      {entry.instagram}
                    </a>
                  ) : (
                    <span key={entry._key}>{entry.name}</span>
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

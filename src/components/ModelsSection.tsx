import type { AllModelsQueryResult } from "@/sanity/types";
import { SectionHeader } from "./SectionHeader";
import { PortraitCard } from "./PortraitCard";

interface ModelsSectionProps {
  models: AllModelsQueryResult;
}

export function ModelsSection({ models }: ModelsSectionProps) {
  if (models.length === 0) return null;

  return (
    <section
      id="modelos"
      className="bg-bone text-ink py-16 sm:py-24 md:py-32 border-t border-ink/5"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeader
          title="Modelos"
          description="O elenco que carrega o manifesto."
        />

        <ul className="mt-10 sm:mt-14 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {models.map((m, i) => (
            <li key={m._id}>
              <PortraitCard
                name={m.stageName || m.name || ""}
                instagram={m.instagram}
                image={m.image}
                priority={i < 4}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

import { modelos } from "@/lib/data";
import { SectionHeader } from "./SectionHeader";
import { PortraitCard } from "./PortraitCard";

export function ModelsSection() {
  if (modelos.length === 0) return null;

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
          {modelos.map((m, i) => (
            <li key={m.id}>
              <PortraitCard pessoa={m} priority={i < 4} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

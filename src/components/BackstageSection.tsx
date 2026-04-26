import { equipeProducao } from "@/lib/data";
import { SectionHeader } from "./SectionHeader";
import { PortraitCard } from "./PortraitCard";

export function BackstageSection() {
  return (
    <section
      id="backstage"
      className="bg-cream text-ink py-16 sm:py-24 md:py-32"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeader
          eyebrow="Seção 05"
          title="Backstage & produção"
          description="Quem segura a noite por trás da passarela. Direção de arte, beleza, luz, som, fotografia e produção executiva."
        />

        <ul className="mt-10 sm:mt-14 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {equipeProducao.map((p, i) => (
            <li key={p.id}>
              <PortraitCard pessoa={p} showRole priority={i < 4} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

import { Hero } from "@/components/Hero";
import { LooksSection } from "@/components/LooksSection";
import { AboutSection } from "@/components/AboutSection";
import { BrandsSection } from "@/components/BrandsSection";
import { ModelsSection } from "@/components/ModelsSection";

export default function Home() {
  return (
    <main>
      <Hero />
      <LooksSection />
      <AboutSection />
      <BrandsSection />
      <ModelsSection />
    </main>
  );
}

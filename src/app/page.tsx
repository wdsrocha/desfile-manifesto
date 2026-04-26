import { Hero } from "@/components/Hero";
import { LooksSection } from "@/components/LooksSection";
import { AboutSection } from "@/components/AboutSection";
import { BrandsSection } from "@/components/BrandsSection";
import { ModelsSection } from "@/components/ModelsSection";
import { BackstageSection } from "@/components/BackstageSection";
import { CreditsSection } from "@/components/CreditsSection";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <main>
        <Hero />
        <LooksSection />
        <AboutSection />
        <BrandsSection />
        <ModelsSection />
        <BackstageSection />
        <CreditsSection />
      </main>
      <Footer />
    </>
  );
}

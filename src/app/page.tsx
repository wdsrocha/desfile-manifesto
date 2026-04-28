import { client } from "@/sanity/client";
import { allBrandsQuery } from "@/sanity/queries/brands";
import { Hero } from "@/components/Hero";
import { LooksSection } from "@/components/LooksSection";
import { AboutSection } from "@/components/AboutSection";
import { BrandsSection } from "@/components/BrandsSection";
import { ModelsSection } from "@/components/ModelsSection";
import { CreditsSection } from "@/components/CreditsSection";
import { Footer } from "@/components/Footer";

export default async function Home() {
  const brands = await client.fetch(allBrandsQuery);

  return (
    <>
      <main>
        <Hero />
        <LooksSection />
        <AboutSection />
        <BrandsSection brands={brands} />
        <ModelsSection />
        <CreditsSection />
      </main>
      <Footer />
    </>
  );
}

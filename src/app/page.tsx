import { client } from "@/sanity/client";
import { allBrandsQuery } from "@/sanity/queries/brands";
import {
  allModelsQuery,
  executiveProducerQuery,
} from "@/sanity/queries/people";
import { Hero } from "@/components/Hero";
import { LooksSection } from "@/components/LooksSection";
import { AboutSection } from "@/components/AboutSection";
import { BrandsSection } from "@/components/BrandsSection";
import { ModelsSection } from "@/components/ModelsSection";
import { CreditsSection } from "@/components/CreditsSection";
import { Footer } from "@/components/Footer";

export default async function Home() {
  const [brands, models, executiveProducer] = await Promise.all([
    client.fetch(allBrandsQuery),
    client.fetch(allModelsQuery),
    client.fetch(executiveProducerQuery),
  ]);

  return (
    <>
      <main>
        <Hero />
        <LooksSection />
        <AboutSection executiveProducer={executiveProducer} />
        <BrandsSection brands={brands} />
        <ModelsSection models={models} />
        <CreditsSection />
      </main>
      <Footer />
    </>
  );
}

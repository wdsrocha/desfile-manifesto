import { client } from "@/sanity/client";
import { allBrandsQuery } from "@/sanity/queries/brands";
import { allCreditGroupsQuery } from "@/sanity/queries/credits";
import {
  currentEventQuery,
  nextEventQuery,
} from "@/sanity/queries/event";
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
  const [event, nextEvent, brands, models, executiveProducer, creditGroups] =
    await Promise.all([
      client.fetch(currentEventQuery),
      client.fetch(nextEventQuery),
      client.fetch(allBrandsQuery),
      client.fetch(allModelsQuery),
      client.fetch(executiveProducerQuery),
      client.fetch(allCreditGroupsQuery),
    ]);

  return (
    <>
      <main>
        <Hero event={event} />
        <LooksSection />
        <AboutSection
          event={event}
          nextEvent={nextEvent}
          executiveProducer={executiveProducer}
        />
        <BrandsSection brands={brands} />
        <ModelsSection models={models} />
        <CreditsSection groups={creditGroups} />
      </main>
      <Footer event={event} />
    </>
  );
}

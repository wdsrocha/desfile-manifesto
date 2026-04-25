import { Hero } from "@/components/Hero";
import { LooksSection } from "@/components/LooksSection";
import { AboutSection } from "@/components/AboutSection";

export default function Home() {
  return (
    <main>
      <Hero />
      <LooksSection />
      <AboutSection />
    </main>
  );
}

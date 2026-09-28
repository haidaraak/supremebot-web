import { Nav } from "@/components/landing/Nav";
import { Hero } from "@/components/landing/Hero";
import { LiveConsole } from "@/components/landing/LiveConsole";
import { Stats } from "@/components/landing/Stats";
import { NetworksMarquee } from "@/components/landing/NetworksMarquee";
import { ConsoleSection } from "@/components/landing/ConsoleSection";
import { Steps } from "@/components/landing/Steps";
import { Features } from "@/components/landing/Features";
import { Compare } from "@/components/landing/Compare";
import { Security } from "@/components/landing/Security";
import { ManagedServices } from "@/components/landing/ManagedServices";
import { Pricing } from "@/components/landing/Pricing";
import { Faq } from "@/components/landing/Faq";
import { Cta } from "@/components/landing/Cta";
import { Testimonial } from "@/components/landing/Testimonial";
import { Footer } from "@/components/landing/Footer";

export default function HomePage() {
  return (
    <main className="relative min-h-screen bg-bg">
      <Nav />
      <Hero />
      <Stats />
      <NetworksMarquee />
      <ConsoleSection />
      <Steps />
      <Features />
      <Compare />
      <Security />
      <ManagedServices />
      <Pricing />
      <Faq />
      <Testimonial />
      <Cta />
      <Footer />
    </main>
  );
}

/**
 * P.A.G.O. — Novo Tempo
 * Design Philosophy: "Governo Silencioso" — Elegância Subliminar
 * Inspired by quiet luxury, editorial design, and spiritual depth.
 * Color palette: Navy (#1A2744), Warm White (#FAFAF8), Sand (#E8E0D4), Gold (#B8A88A)
 * Typography: Cormorant (display), Lora (body), Montserrat (accent/labels)
 */

import { useAuth } from "@/_core/hooks/useAuth";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import PillarsSection from "@/components/PillarsSection";
import JeffersonSection from "@/components/JeffersonSection";
import KitSection from "@/components/KitSection";
import CTASection from "@/components/CTASection";
import FAQSection from "@/components/FAQSection";
import Footer from "@/components/Footer";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-warm-white">
      <Navbar />
      <HeroSection />
      <AboutSection />
      <PillarsSection />
      <JeffersonSection />
      <KitSection />
      <CTASection />
      <FAQSection />
      <Footer />
    </div>
  );
}

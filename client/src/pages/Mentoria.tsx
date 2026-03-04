import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MentoriaHeroSection from "@/components/mentoria/MentoriaHeroSection";
import MentoriaForWhoSection from "@/components/mentoria/MentoriaForWhoSection";
import MentoriaMethodologySection from "@/components/mentoria/MentoriaMethodologySection";
import MentoriaHowItWorksSection from "@/components/mentoria/MentoriaHowItWorksSection";
import MentoriaResultsSection from "@/components/mentoria/MentoriaResultsSection";
import MentoriaCTASection from "@/components/mentoria/MentoriaCTASection";

export default function Mentoria() {
  return (
    <div className="min-h-screen bg-warm-white">
      <Navbar />
      <MentoriaHeroSection />
      <MentoriaForWhoSection />
      <MentoriaMethodologySection />
      <MentoriaHowItWorksSection />
      <MentoriaResultsSection />
      <MentoriaCTASection />
      <Footer />
    </div>
  );
}

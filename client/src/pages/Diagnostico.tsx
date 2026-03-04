import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DiagnosticoQuestionnaire from "@/components/diagnostico/DiagnosticoQuestionnaire";

export default function Diagnostico() {
  return (
    <div className="min-h-screen bg-warm-white">
      <Navbar />
      <DiagnosticoQuestionnaire />
      <Footer />
    </div>
  );
}

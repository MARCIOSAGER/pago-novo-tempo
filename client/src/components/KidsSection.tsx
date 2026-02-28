import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { BookOpen, Palette, Calendar, Heart, Download, Eye, Star, Users } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const KIDS_COVER_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310419663028643999/FWKBucVCwodcLLRRkU5GKw/pago-kids-cover-YXFafqXyCNBnqLPKUrfJyB.png";
const KIDS_HOUSE_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310419663028643999/FWKBucVCwodcLLRRkU5GKw/pago-kids-ch6-house-jvqcdRzsdVKSQveo947cpe.png";
const KIDS_BUILDERS_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310419663028643999/FWKBucVCwodcLLRRkU5GKw/pago-kids-ch1-builders-YA5WrSMQaqx6SoHwYspcQM.png";

function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 25 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const featureIcons = [BookOpen, Palette, Calendar, Heart];

export default function KidsSection() {
  const { t } = useLanguage();

  return (
    <section id="kids" className="relative py-28 lg:py-36 overflow-hidden" style={{ background: "linear-gradient(135deg, #FFF8E7 0%, #FFF0D4 30%, #FFE8C8 60%, #FFECD6 100%)" }}>
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        {/* Floating circles */}
        <div className="absolute top-12 left-[8%] w-20 h-20 rounded-full bg-[#FFD166]/20 animate-pulse" />
        <div className="absolute top-32 right-[12%] w-14 h-14 rounded-full bg-[#06D6A0]/15 animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute bottom-20 left-[15%] w-16 h-16 rounded-full bg-[#EF476F]/10 animate-pulse" style={{ animationDelay: "2s" }} />
        <div className="absolute bottom-40 right-[8%] w-12 h-12 rounded-full bg-[#118AB2]/15 animate-pulse" style={{ animationDelay: "0.5s" }} />
        {/* Stars */}
        <Star className="absolute top-20 right-[25%] w-5 h-5 text-[#FFD166]/40 animate-spin" style={{ animationDuration: "8s" }} />
        <Star className="absolute bottom-32 left-[30%] w-4 h-4 text-[#EF476F]/30 animate-spin" style={{ animationDuration: "12s" }} />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <FadeIn>
            <div className="inline-flex items-center gap-2 mb-6">
              <span className="font-accent text-[11px] uppercase tracking-[0.4em] text-[#EF476F]">
                {t.kids.label}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-accent font-semibold bg-[#EF476F] text-white uppercase tracking-wider">
                {t.kids.badge}
              </span>
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h2 className="font-display text-5xl lg:text-6xl font-bold leading-[1.1] mb-6">
              <span className="text-navy">{t.kids.titleLine1}</span>{" "}
              <span className="relative inline-block">
                <span className="text-[#EF476F]">{t.kids.titleLine2}</span>
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 100 8" preserveAspectRatio="none">
                  <path d="M0 6 Q25 0 50 5 Q75 2 100 6" stroke="#FFD166" strokeWidth="3" fill="none" strokeLinecap="round" />
                </svg>
              </span>
            </h2>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="font-body text-base text-navy/60 leading-relaxed max-w-xl mx-auto">
              {t.kids.subtitle}
            </p>
          </FadeIn>
        </div>

        {/* Main content — Book showcase + Features */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-20">
          {/* Left — Book cover with floating illustrations */}
          <FadeIn delay={0.1}>
            <div className="relative flex justify-center">
              {/* Main book cover */}
              <motion.div
                className="relative z-10"
                whileHover={{ scale: 1.02, rotateY: -3 }}
                transition={{ duration: 0.4 }}
              >
                <div className="relative">
                  <img
                    src={KIDS_COVER_URL}
                    alt="P.A.G.O. Kids Ebook Cover"
                    className="w-72 lg:w-80 rounded-2xl shadow-2xl"
                    style={{ boxShadow: "0 25px 60px rgba(0,0,0,0.15), 0 10px 20px rgba(0,0,0,0.1)" }}
                  />
                  {/* Badge overlay */}
                  <div className="absolute -top-3 -right-3 bg-[#06D6A0] text-white rounded-full w-16 h-16 flex flex-col items-center justify-center shadow-lg">
                    <span className="text-[10px] font-accent font-bold uppercase leading-tight">100%</span>
                    <span className="text-[8px] font-accent uppercase leading-tight">Free</span>
                  </div>
                </div>
              </motion.div>

              {/* Floating illustration — builders */}
              <motion.img
                src={KIDS_BUILDERS_URL}
                alt="P.A.G.O. Kids Capítulo 1 - Crianças construtoras aprendendo princípios bíblicos"
                className="absolute -left-4 top-8 w-28 h-28 rounded-xl shadow-lg object-cover border-4 border-white z-0 hidden lg:block"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />

              {/* Floating illustration — house */}
              <motion.img
                src={KIDS_HOUSE_URL}
                alt="P.A.G.O. Kids Capítulo 6 - Casa construída sobre a rocha simbolizando obediência"
                className="absolute -right-4 bottom-8 w-24 h-24 rounded-xl shadow-lg object-cover border-4 border-white z-0 hidden lg:block"
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              />
            </div>
          </FadeIn>

          {/* Right — Features + CTA */}
          <div className="space-y-8">
            <FadeIn delay={0.2}>
              <p className="font-body text-sm text-navy/70 leading-relaxed">
                {t.kids.description}
              </p>
            </FadeIn>

            {/* Feature cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {t.kids.features.map((feature, i) => {
                const Icon = featureIcons[i];
                const colors = [
                  { bg: "bg-[#118AB2]/10", text: "text-[#118AB2]" },
                  { bg: "bg-[#EF476F]/10", text: "text-[#EF476F]" },
                  { bg: "bg-[#06D6A0]/10", text: "text-[#06D6A0]" },
                  { bg: "bg-[#FFD166]/15", text: "text-[#E6A800]" },
                ];
                return (
                  <FadeIn key={feature.title} delay={0.15 * (i + 1)}>
                    <div className="bg-white/70 backdrop-blur-sm rounded-xl p-5 border border-white/80 hover:shadow-md transition-all duration-300 h-full">
                      <div className={`w-10 h-10 rounded-lg ${colors[i].bg} flex items-center justify-center mb-3`}>
                        <Icon className={`w-5 h-5 ${colors[i].text}`} strokeWidth={1.5} />
                      </div>
                      <h3 className="font-display text-sm font-semibold text-navy mb-1.5">
                        {feature.title}
                      </h3>
                      <p className="font-body text-xs text-navy/50 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </FadeIn>
                );
              })}
            </div>

            {/* Meta info */}
            <FadeIn delay={0.5}>
              <div className="flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/60 text-[11px] font-accent text-navy/60 border border-white/80">
                  <Users className="w-3.5 h-3.5" />
                  {t.kids.ageRange}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/60 text-[11px] font-accent text-navy/60 border border-white/80">
                  <BookOpen className="w-3.5 h-3.5" />
                  {t.kids.pages}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/60 text-[11px] font-accent text-navy/60 border border-white/80">
                  <Palette className="w-3.5 h-3.5" />
                  {t.kids.format}
                </span>
              </div>
            </FadeIn>

            {/* CTA Buttons */}
            <FadeIn delay={0.6}>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="/api/downloads/ebook-kids-pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#EF476F] text-white font-accent text-sm uppercase tracking-[0.15em] rounded-xl hover:bg-[#D63D63] transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <Download className="w-4 h-4" />
                  {t.kids.ctaDownload}
                </a>
                <a
                  href="/api/downloads/ebook-kids-flipbook"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/80 text-navy font-accent text-sm uppercase tracking-[0.15em] rounded-xl hover:bg-white transition-all duration-300 border border-navy/10"
                >
                  <Eye className="w-4 h-4" />
                  {t.kids.ctaPreview}
                </a>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  );
}

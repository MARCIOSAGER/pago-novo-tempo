import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

const IMAGES = {
  principles: "https://d2xsxph8kpxj0f.cloudfront.net/310419663028643999/FWKBucVCwodcLLRRkU5GKw/pillar-principles-HDhT4DKjE38mG8ZkecmGd4.webp",
  alignment: "https://d2xsxph8kpxj0f.cloudfront.net/310419663028643999/FWKBucVCwodcLLRRkU5GKw/pillar-alignment-8YXRToADNaAGsGXCjL5Bc7.webp",
  government: "https://d2xsxph8kpxj0f.cloudfront.net/310419663028643999/FWKBucVCwodcLLRRkU5GKw/pillar-governo-new-RzVSXAyWeKmPtBV6tXgtTv.webp",
  obedience: "https://d2xsxph8kpxj0f.cloudfront.net/310419663028643999/FWKBucVCwodcLLRRkU5GKw/pillar-obedience-f5zof3JxmnB8U7Po4wBCp3.webp",
};

const pillarMeta = [
  { number: "I", letter: "P", image: IMAGES.principles },
  { number: "II", letter: "A", image: IMAGES.alignment },
  { number: "III", letter: "G", image: IMAGES.government },
  { number: "IV", letter: "O", image: IMAGES.obedience },
];

function PillarCard({ pillar, index }: { pillar: { number: string; letter: string; image: string; title: string; subtitle: string; description: string; verse: string }; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const isEven = index % 2 === 0;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      className={`grid lg:grid-cols-2 gap-0 items-stretch ${isEven ? "" : "lg:direction-rtl"}`}
    >
      {/* Image */}
      <div className={`relative overflow-hidden aspect-[4/3] lg:aspect-auto ${isEven ? "lg:order-1" : "lg:order-2"}`}>
        <motion.img
          initial={{ scale: 1.08 }}
          animate={isInView ? { scale: 1 } : {}}
          transition={{ duration: 1.2, ease: "easeOut" }}
          src={pillar.image}
          alt={pillar.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-navy/20" />
        <div className="absolute bottom-6 right-6">
          <span className="font-display text-7xl lg:text-8xl font-bold text-warm-white/15">
            {pillar.number}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className={`bg-navy p-10 lg:p-16 flex flex-col justify-center ${isEven ? "lg:order-2" : "lg:order-1"}`}>
        <div className="flex items-center gap-4 mb-6">
          <span className="font-display text-5xl font-bold text-gold">{pillar.letter}</span>
          <div className="w-8 h-[1px] bg-gold" />
        </div>

        <p className="font-accent text-[10px] uppercase tracking-[0.4em] text-gold/80 mb-3">
          {pillar.subtitle}
        </p>

        <h3 className="font-display text-3xl lg:text-4xl font-semibold text-warm-white mb-6">
          {pillar.title}
        </h3>

        <p className="font-body text-sm text-warm-white/70 leading-relaxed mb-8">
          {pillar.description}
        </p>

        <blockquote className="border-l border-gold/50 pl-5">
          <p className="font-display text-sm text-warm-white/60 italic leading-relaxed">
            {pillar.verse}
          </p>
        </blockquote>
      </div>
    </motion.div>
  );
}

export default function PillarsSection() {
  const { t } = useLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const pillars = pillarMeta.map((meta, i) => ({
    ...meta,
    title: t.pillars.items[i].title,
    subtitle: t.pillars.items[i].subtitle,
    description: t.pillars.items[i].description,
    verse: t.pillars.items[i].verse,
  }));

  return (
    <section id="pilares" className="py-28 lg:py-36 bg-sand">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 mb-16">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 25 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <p className="font-accent text-[11px] uppercase tracking-[0.4em] text-gold mb-6">
            {t.pillars.label}
          </p>
          <h2 className="font-display text-4xl lg:text-5xl font-semibold text-navy leading-[1.15] max-w-xl">
            {t.pillars.titleLine1}
            <br />
            <span className="text-gold">{t.pillars.titleLine2}</span>
          </h2>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 space-y-1">
        {pillars.map((pillar, i) => (
          <PillarCard key={pillar.letter} pillar={pillar} index={i} />
        ))}
      </div>
    </section>
  );
}

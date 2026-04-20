import { motion } from "framer-motion";
import { useState } from "react";
import { ArrowRight, ExternalLink, ImageOff } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";

type EbookLang = "pt" | "en" | "es";

const EBOOK_LANGS: { code: EbookLang; label: string; flag: string }[] = [
  { code: "pt", label: "PT", flag: "🇧🇷" },
  { code: "en", label: "EN", flag: "🇺🇸" },
  { code: "es", label: "ES", flag: "🇪🇸" },
];

interface DiagnosticoOfferProps {
  nome: string;
  onContinue: () => void;
}

export default function DiagnosticoOffer({ nome, onContinue }: DiagnosticoOfferProps) {
  const { t, language } = useLanguage();
  const { data: offers, isLoading } = trpc.offers.listForDiagnostico.useQuery();
  const defaultLang: EbookLang = language === "en" || language === "es" ? language : "pt";

  const offer = t.diagnostico.offer;
  const firstName = nome.split(" ")[0] || nome;
  const headline = offer.headline.replace("{nome}", firstName);

  return (
    <section className="min-h-screen bg-warm-white pt-24 lg:pt-28 pb-16 lg:pb-24">
      <div className="max-w-6xl mx-auto px-6 lg:px-12">
        {/* Skip link */}
        <div className="flex justify-end mb-8">
          <button
            type="button"
            onClick={onContinue}
            className="font-accent text-[11px] uppercase tracking-[0.2em] text-navy/60 hover:text-navy transition-colors inline-flex items-center gap-1.5"
          >
            {offer.skip}
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-14 lg:mb-20"
        >
          <p className="font-accent text-[11px] uppercase tracking-[0.4em] text-gold mb-6">
            P.A.G.O.
          </p>
          <h1 className="font-display text-3xl lg:text-5xl font-semibold text-navy leading-[1.15] mb-6">
            {headline}
          </h1>
          <div className="w-16 h-[1px] bg-gold mx-auto mb-6" />
          <p className="font-body text-base lg:text-lg leading-relaxed text-navy/70">
            {offer.subheadline}
          </p>
        </motion.div>

        {/* Offers grid / carousel */}
        {isLoading ? (
          <div className="grid md:grid-cols-3 gap-6 mb-14">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="border border-navy/10 bg-white h-96 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div
            className="mb-14 lg:mb-20 grid md:grid-cols-3 gap-6
                       max-md:flex max-md:grid-cols-none max-md:overflow-x-auto max-md:snap-x max-md:snap-mandatory
                       max-md:-mx-6 max-md:px-6 max-md:pb-4"
          >
            {offers?.map((product, i) => (
              <OfferCard
                key={product.id}
                product={product}
                index={i}
                comingSoonLabel={offer.comingSoon}
                languageLabel={offer.language}
                defaultLang={defaultLang}
              />
            ))}
          </div>
        )}

        {/* See result button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex justify-center"
        >
          <button
            type="button"
            onClick={onContinue}
            className="btn-shine font-accent text-xs uppercase tracking-[0.2em] bg-gold text-navy px-10 py-5 hover:bg-gold-light transition-all duration-300 inline-flex items-center gap-2"
          >
            {offer.seeResult}
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}

interface OfferCardProps {
  product: {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    ctaText: string;
    ctaUrl: string;
  };
  index: number;
  comingSoonLabel: string;
  languageLabel: string;
  defaultLang: EbookLang;
}

function OfferCard({ product, index, comingSoonLabel, languageLabel, defaultLang }: OfferCardProps) {
  const isAvailable = product.ctaUrl.trim().length > 0;
  const isExternal = /^https?:\/\//i.test(product.ctaUrl);
  const isEbook = product.id === "ebook";
  const [selectedLang, setSelectedLang] = useState<EbookLang>(defaultLang);

  const finalCtaUrl = (() => {
    if (!isAvailable) return product.ctaUrl;
    const ref = isEbook ? `ebook_${selectedLang}` : product.id;
    try {
      const url = new URL(product.ctaUrl, window.location.origin);
      url.searchParams.set("client_reference_id", ref);
      return url.toString();
    } catch {
      const sep = product.ctaUrl.includes("?") ? "&" : "?";
      return `${product.ctaUrl}${sep}client_reference_id=${ref}`;
    }
  })();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 + index * 0.1 }}
      className="border border-navy/10 bg-white flex flex-col
                 max-md:min-w-[85%] max-md:snap-center"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] bg-warm-beige/40 overflow-hidden flex items-center justify-center">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <ImageOff className="h-10 w-10 text-navy/20" />
        )}
      </div>

      {/* Content */}
      <div className="p-6 lg:p-8 flex-1 flex flex-col">
        <h3 className="font-display text-xl lg:text-2xl font-semibold text-navy mb-3">
          {product.title}
        </h3>
        <p className="font-body text-sm leading-relaxed text-navy/70 mb-6 flex-1">
          {product.description}
        </p>

        {isEbook && isAvailable && (
          <div className="mb-4">
            <p className="font-accent text-[10px] uppercase tracking-[0.2em] text-navy/50 mb-2">
              {languageLabel}
            </p>
            <div className="flex gap-1.5" role="radiogroup" aria-label={languageLabel}>
              {EBOOK_LANGS.map((lang) => {
                const active = selectedLang === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setSelectedLang(lang.code)}
                    className={
                      "font-accent text-[11px] tracking-wider px-3 py-2 border transition-colors inline-flex items-center gap-1.5 " +
                      (active
                        ? "border-navy bg-navy text-warm-white"
                        : "border-navy/20 text-navy/60 hover:border-navy/50 hover:text-navy")
                    }
                  >
                    <span aria-hidden>{lang.flag}</span>
                    {lang.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {isAvailable ? (
          <a
            href={finalCtaUrl}
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noopener noreferrer" : undefined}
            className="font-accent text-xs uppercase tracking-[0.2em] bg-navy text-warm-white px-6 py-4 hover:bg-navy-dark transition-colors inline-flex items-center justify-center gap-2"
          >
            {product.ctaText}
            {isExternal && <ExternalLink className="h-3 w-3" />}
          </a>
        ) : (
          <button
            type="button"
            disabled
            className="font-accent text-xs uppercase tracking-[0.2em] bg-navy/10 text-navy/40 px-6 py-4 cursor-not-allowed"
          >
            {comingSoonLabel}
          </button>
        )}
      </div>
    </motion.div>
  );
}

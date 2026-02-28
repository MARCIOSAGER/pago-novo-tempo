import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";

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

const HERO_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310419663028643999/FWKBucVCwodcLLRRkU5GKw/hero-bg-fyJtxWkcWj2UeE7kR85wJt.webp";

export default function CTASection() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    website: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lgpdConsent, setLgpdConsent] = useState(false);

  const submitMutation = trpc.mentoria.submit.useMutation({
    onSuccess: (data) => {
      toast.success(data.message, {
        description: t.cta.successMessage,
      });
      setFormData({ name: "", email: "", phone: "", message: "", website: "" });
    },
    onError: (error) => {
      toast.error(t.cta.errorMessage, {
        description: error.message || t.cta.errorRetry,
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!lgpdConsent) {
      toast.error(t.cta.lgpdRequired);
      return;
    }
    if (formData.name.trim().length < 2) {
      toast.error(t.cta.nameMinLength);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error(t.cta.emailInvalid);
      return;
    }

    setIsSubmitting(true);
    submitMutation.mutate({
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim() || undefined,
      message: formData.message.trim() || undefined,
      website: formData.website || undefined,
    });
  };

  const benefits = [t.cta.benefit1, t.cta.benefit2, t.cta.benefit3, t.cta.benefit4];

  return (
    <section id="inscricao" className="relative py-28 lg:py-36 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img src={HERO_BG} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-navy/90" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Left - Text */}
          <div>
            <FadeIn>
              <p className="font-accent text-[11px] uppercase tracking-[0.4em] text-gold mb-6">
                {t.cta.label}
              </p>
            </FadeIn>
            <FadeIn delay={0.1}>
              <h2 className="font-display text-4xl lg:text-5xl font-semibold text-warm-white leading-[1.15] mb-8">
                {t.cta.titleLine1}
                <br />
                {t.cta.titleLine2}
                <br />
                <span className="text-gold">{t.cta.titleLine3}</span>
              </h2>
            </FadeIn>
            <FadeIn delay={0.2}>
              <div className="section-divider mb-8" />
            </FadeIn>
            <FadeIn delay={0.3}>
              <p className="font-body text-base text-warm-white/60 leading-relaxed mb-8">
                {t.cta.description}
              </p>
            </FadeIn>
            <FadeIn delay={0.4}>
              <div className="space-y-4">
                {benefits.map((benefit, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-1 h-1 rounded-full bg-gold mt-2.5 shrink-0" />
                    <p className="font-body text-sm text-warm-white/50">{benefit}</p>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>

          {/* Right - Form */}
          <FadeIn delay={0.2}>
            <form
              onSubmit={handleSubmit}
              className="bg-warm-white/5 backdrop-blur-sm border border-warm-white/10 p-8 lg:p-10 space-y-6"
            >
              {/* Honeypot */}
              <div className="absolute -left-[9999px] -top-[9999px]" aria-hidden="true">
                <label htmlFor="website">Website</label>
                <input
                  type="text"
                  id="website"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                />
              </div>

              <div>
                <label className="font-accent text-[10px] uppercase tracking-[0.3em] text-gold block mb-2">
                  {t.cta.formName}
                </label>
                <input
                  type="text"
                  required
                  minLength={2}
                  maxLength={255}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-transparent border-b border-warm-white/20 text-warm-white font-body text-sm py-3 focus:border-gold outline-none transition-colors placeholder:text-warm-white/30"
                  placeholder={t.cta.formNamePlaceholder}
                />
              </div>
              <div>
                <label className="font-accent text-[10px] uppercase tracking-[0.3em] text-gold block mb-2">
                  {t.cta.formEmail}
                </label>
                <input
                  type="email"
                  required
                  maxLength={320}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-transparent border-b border-warm-white/20 text-warm-white font-body text-sm py-3 focus:border-gold outline-none transition-colors placeholder:text-warm-white/30"
                  placeholder={t.cta.formEmailPlaceholder}
                />
              </div>
              <div>
                <label className="font-accent text-[10px] uppercase tracking-[0.3em] text-gold block mb-2">
                  {t.cta.formPhone}
                </label>
                <input
                  type="tel"
                  maxLength={30}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-transparent border-b border-warm-white/20 text-warm-white font-body text-sm py-3 focus:border-gold outline-none transition-colors placeholder:text-warm-white/30"
                  placeholder={t.cta.formPhonePlaceholder}
                />
              </div>
              <div>
                <label className="font-accent text-[10px] uppercase tracking-[0.3em] text-gold block mb-2">
                  {t.cta.formMessage}
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={3}
                  maxLength={2000}
                  className="w-full bg-transparent border-b border-warm-white/20 text-warm-white font-body text-sm py-3 focus:border-gold outline-none transition-colors resize-none placeholder:text-warm-white/30"
                  placeholder={t.cta.formMessagePlaceholder}
                />
              </div>
              {/* LGPD Consent */}
              <div className="flex items-start gap-3 mt-2">
                <input
                  type="checkbox"
                  id="lgpd-consent"
                  checked={lgpdConsent}
                  onChange={(e) => setLgpdConsent(e.target.checked)}
                  className="mt-1 w-4 h-4 accent-gold shrink-0 cursor-pointer"
                />
                <label htmlFor="lgpd-consent" className="font-body text-[11px] text-warm-white/50 leading-relaxed cursor-pointer">
                  {t.cta.lgpdConsent}{" "}
                  <Link href="/privacidade">
                    <span className="text-gold hover:text-gold-light underline underline-offset-2 cursor-pointer">{t.cta.privacyPolicy}</span>
                  </Link>{" "}
                  {t.cta.and}{" "}
                  <Link href="/termos">
                    <span className="text-gold hover:text-gold-light underline underline-offset-2 cursor-pointer">{t.cta.termsOfUse}</span>
                  </Link>.
                  {" "}{t.cta.lgpdSuffix}
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !lgpdConsent}
                className="w-full font-accent text-xs uppercase tracking-[0.2em] bg-gold text-navy py-4 hover:bg-gold-light transition-all duration-300 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? t.cta.submitting : t.cta.submitButton}
              </button>
              <p className="font-body text-[11px] text-warm-white/30 text-center">
                {t.cta.lgpdFooter}
              </p>
            </form>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

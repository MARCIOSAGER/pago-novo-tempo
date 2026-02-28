import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";

const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310419663028643999/FWKBucVCwodcLLRRkU5GKw/pago-logo_ea5770c3.jpeg";

export default function Footer() {
  const { t } = useLanguage();

  const navLinks = [
    { label: t.nav.about, href: "#sobre" },
    { label: t.nav.pillars, href: "#pilares" },
    { label: t.nav.jefferson, href: "#jefferson" },
    { label: t.nav.kit, href: "#kit" },
    { label: t.nav.faq, href: "#faq" },
  ];

  return (
    <footer className="bg-navy py-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 mb-16">
          {/* Brand */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-3 mb-6">
              <img
                src={LOGO_URL}
                alt="P.A.G.O Novo Tempo"
                className="h-12 w-12 rounded-full object-cover"
              />
              <div>
                <span className="font-display text-xl font-semibold text-warm-white tracking-wide">
                  P.A.G.O
                </span>
                <span className="block font-accent text-[10px] uppercase tracking-[0.3em] text-gold">
                  {t.nav.tagline}
                </span>
              </div>
            </div>
            <p className="font-body text-sm text-warm-white/40 leading-relaxed max-w-sm">
              {t.footer.description}
            </p>
          </div>

          {/* Navigation */}
          <div className="lg:col-span-2">
            <p className="font-accent text-[10px] uppercase tracking-[0.3em] text-gold mb-6">
              {t.footer.navLabel}
            </p>
            <div className="space-y-3">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="block font-body text-sm text-warm-white/40 hover:text-warm-white transition-colors duration-300"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* Pillars */}
          <div className="lg:col-span-3">
            <p className="font-accent text-[10px] uppercase tracking-[0.3em] text-gold mb-6">
              {t.footer.pillarsLabel}
            </p>
            <div className="space-y-3">
              <p className="font-body text-sm text-warm-white/40">
                <span className="text-gold font-semibold">P</span> — {t.footer.pillarP}
              </p>
              <p className="font-body text-sm text-warm-white/40">
                <span className="text-gold font-semibold">A</span> — {t.footer.pillarA}
              </p>
              <p className="font-body text-sm text-warm-white/40">
                <span className="text-gold font-semibold">G</span> — {t.footer.pillarG}
              </p>
              <p className="font-body text-sm text-warm-white/40">
                <span className="text-gold font-semibold">O</span> — {t.footer.pillarO}
              </p>
            </div>
          </div>

          {/* Contact */}
          <div className="lg:col-span-3">
            <p className="font-accent text-[10px] uppercase tracking-[0.3em] text-gold mb-6">
              {t.footer.contactLabel}
            </p>
            <div className="space-y-3">
              <a
                href="#inscricao"
                className="block font-body text-sm text-warm-white/40 hover:text-warm-white transition-colors duration-300"
              >
                {t.footer.contactCta}
              </a>
              <p className="font-body text-sm text-warm-white/40">
                contato@metodopago.com
              </p>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="gold-line mb-8" />

        {/* Legal Links Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
          <p className="font-accent text-[10px] uppercase tracking-[0.2em] text-warm-white/30">
            &copy; {new Date().getFullYear()} {t.footer.copyright}
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacidade" className="font-accent text-[11px] uppercase tracking-[0.15em] text-warm-white/50 hover:text-gold transition-colors duration-300">
              {t.footer.privacy}
            </Link>
            <Link href="/termos" className="font-accent text-[11px] uppercase tracking-[0.15em] text-warm-white/50 hover:text-gold transition-colors duration-300">
              {t.footer.terms}
            </Link>
            <Link href="/cookies" className="font-accent text-[11px] uppercase tracking-[0.15em] text-warm-white/50 hover:text-gold transition-colors duration-300">
              {t.footer.cookies}
            </Link>
          </div>
        </div>

        {/* Quote */}
        <div className="text-center">
          <p className="font-body text-[11px] text-warm-white/20 italic">
            {t.footer.quote}
          </p>
        </div>
      </div>
    </footer>
  );
}

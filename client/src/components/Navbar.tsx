import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310419663028643999/FWKBucVCwodcLLRRkU5GKw/pago-logo_ea5770c3.jpeg";

const navLinks = [
  { label: "Sobre", href: "#sobre" },
  { label: "Os 4 Pilares", href: "#pilares" },
  { label: "Jefferson", href: "#jefferson" },
  { label: "Kit Mentoria", href: "#kit" },
  { label: "FAQ", href: "#faq" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-warm-white/95 backdrop-blur-md shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <a href="#" className="flex items-center gap-3">
              <img
                src={LOGO_URL}
                alt="P.A.G.O. Novo Tempo"
                className="h-12 w-12 rounded-full object-cover"
              />
              <div className="hidden sm:block">
                <span className="font-display text-xl font-semibold text-navy tracking-wide">
                  P.A.G.O.
                </span>
                <span className="block font-accent text-[10px] uppercase tracking-[0.3em] text-blue-muted">
                  Novo Tempo
                </span>
              </div>
            </a>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-10">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="font-accent text-xs uppercase tracking-[0.2em] text-navy/70 hover:text-navy transition-colors duration-300"
                >
                  {link.label}
                </a>
              ))}
              <a
                href="#inscricao"
                className="font-accent text-xs uppercase tracking-[0.2em] bg-navy text-warm-white px-6 py-3 hover:bg-navy-light transition-colors duration-300"
              >
                Inscreva-se
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden text-navy p-2"
              aria-label="Menu"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-warm-white pt-24 px-8"
          >
            <div className="flex flex-col gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="font-display text-3xl text-navy hover:text-gold transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <div className="gold-line mt-4" />
              <a
                href="#inscricao"
                onClick={() => setMobileOpen(false)}
                className="font-accent text-sm uppercase tracking-[0.2em] bg-navy text-warm-white px-8 py-4 text-center hover:bg-navy-light transition-colors"
              >
                Inscreva-se na Mentoria
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

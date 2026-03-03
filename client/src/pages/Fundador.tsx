import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Fundador() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-warm-white">
      <Navbar />

      {/* Hero */}
      <section className="bg-navy pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <Link href="/">
            <span className="inline-flex items-center gap-2 font-accent text-xs uppercase tracking-[0.2em] text-gold hover:text-gold-light transition-colors mb-10 cursor-pointer">
              <ArrowLeft size={14} /> {t.jefferson.founderPage.backToHome}
            </span>
          </Link>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Photo */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <img
                src="/images/jefferson.png"
                alt="Jefferson Evangelista"
                className="w-full max-w-lg mx-auto lg:mx-0 object-cover"
              />
            </motion.div>

            {/* Info */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-6"
            >
              <p className="font-accent text-[11px] uppercase tracking-[0.4em] text-gold">
                {t.jefferson.label}
              </p>
              <h1 className="font-display text-5xl lg:text-6xl font-semibold text-warm-white leading-[1.1]">
                {t.jefferson.name}
                <br />
                <span className="text-gold">{t.jefferson.nameSurname}</span>
              </h1>
              <div className="w-16 h-[1px] bg-gold" />
              <div className="flex flex-col gap-2">
                <p className="font-accent text-[10px] uppercase tracking-[0.3em] text-warm-white/60 flex items-center gap-2">
                  <span className="text-gold">—</span> {t.jefferson.role1}
                </p>
                <p className="font-accent text-[10px] uppercase tracking-[0.3em] text-warm-white/60 flex items-center gap-2">
                  <span className="text-gold">—</span> {t.jefferson.role2}
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Biography */}
      <section className="py-20 lg:py-28 bg-warm-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-12 space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <p className="font-body text-lg text-navy/80 leading-relaxed">
              {t.jefferson.bio1}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <p className="font-body text-base text-navy/70 leading-relaxed">
              {t.jefferson.bio2}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <blockquote className="border-l-2 border-gold pl-6 py-4 bg-sand/50">
              <p className="font-display text-xl text-navy italic leading-relaxed mb-4">
                {t.jefferson.quote}
              </p>
              <footer className="font-accent text-[10px] uppercase tracking-[0.3em] text-gold">
                — {t.jefferson.quoteAuthor}
              </footer>
            </blockquote>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <p className="font-body text-base text-navy/70 leading-relaxed">
              {t.jefferson.bio3}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-20 lg:py-28 bg-sand">
        <div className="max-w-4xl mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center mb-12"
          >
            <p className="font-accent text-[11px] uppercase tracking-[0.4em] text-gold mb-6">
              {t.jefferson.founderPage.visionLabel}
            </p>
            <h2 className="font-display text-3xl lg:text-4xl font-semibold text-navy">
              {t.jefferson.founderPage.visionTitle}
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="space-y-8"
          >
            <p className="font-body text-base text-navy/75 leading-relaxed text-center max-w-3xl mx-auto">
              {t.jefferson.founderPage.visionText}
            </p>
            <p className="font-body text-base text-navy/75 leading-relaxed text-center max-w-3xl mx-auto">
              {t.jefferson.founderPage.visionText2}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-center mt-12"
          >
            <a
              href="/#inscricao"
              className="inline-flex items-center gap-2 font-accent text-xs uppercase tracking-[0.2em] bg-gold text-navy px-8 py-4 hover:bg-gold-light transition-all duration-300"
            >
              {t.hero.ctaPrimary}
            </a>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

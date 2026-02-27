import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

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
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    website: "", // Honeypot field — hidden from users, filled by bots
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitMutation = trpc.mentoria.submit.useMutation({
    onSuccess: (data) => {
      toast.success(data.message, {
        description: "Obrigado pelo seu interesse no P.A.G.O.",
      });
      setFormData({ name: "", email: "", phone: "", message: "", website: "" });
    },
    onError: (error) => {
      toast.error("Erro ao enviar inscrição", {
        description: error.message || "Tente novamente mais tarde.",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation
    if (formData.name.trim().length < 2) {
      toast.error("Nome deve ter pelo menos 2 caracteres.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error("Por favor, insira um email válido.");
      return;
    }

    setIsSubmitting(true);
    submitMutation.mutate({
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim() || undefined,
      message: formData.message.trim() || undefined,
      website: formData.website || undefined, // Honeypot
    });
  };

  return (
    <section id="inscricao" className="relative py-28 lg:py-36 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src={HERO_BG}
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-navy/90" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Left - Text */}
          <div>
            <FadeIn>
              <p className="font-accent text-[11px] uppercase tracking-[0.4em] text-gold mb-6">
                Inscrição para Mentoria
              </p>
            </FadeIn>
            <FadeIn delay={0.1}>
              <h2 className="font-display text-4xl lg:text-5xl font-semibold text-warm-white leading-[1.15] mb-8">
                Está pronto para
                <br />
                reorganizar
                <br />
                <span className="text-gold">sua vida?</span>
              </h2>
            </FadeIn>
            <FadeIn delay={0.2}>
              <div className="section-divider mb-8" />
            </FadeIn>
            <FadeIn delay={0.3}>
              <p className="font-body text-base text-warm-white/60 leading-relaxed mb-8">
                O P.A.G.O. é para quem está cansado de viver desorganizado, de ter fé
                mas não ter estrutura, de ter chamado mas não ter direção. Se você deseja
                construir um legado que permaneça, esta mentoria é para você.
              </p>
            </FadeIn>
            <FadeIn delay={0.4}>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-1 h-1 rounded-full bg-gold mt-2.5 shrink-0" />
                  <p className="font-body text-sm text-warm-white/50">
                    Acompanhamento personalizado com a metodologia P.A.G.O.
                  </p>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-1 h-1 rounded-full bg-gold mt-2.5 shrink-0" />
                  <p className="font-body text-sm text-warm-white/50">
                    Kit completo: Bíblia BKJ, Caderno de Estudos, Caneta e Ebook
                  </p>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-1 h-1 rounded-full bg-gold mt-2.5 shrink-0" />
                  <p className="font-body text-sm text-warm-white/50">
                    Exercícios práticos e reflexões bíblicas para cada pilar
                  </p>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-1 h-1 rounded-full bg-gold mt-2.5 shrink-0" />
                  <p className="font-body text-sm text-warm-white/50">
                    Comunidade de homens e mulheres em transformação
                  </p>
                </div>
              </div>
            </FadeIn>
          </div>

          {/* Right - Form */}
          <FadeIn delay={0.2}>
            <form
              onSubmit={handleSubmit}
              className="bg-warm-white/5 backdrop-blur-sm border border-warm-white/10 p-8 lg:p-10 space-y-6"
            >
              {/* Honeypot field — invisible to users, bots will fill it */}
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
                  Nome Completo
                </label>
                <input
                  type="text"
                  required
                  minLength={2}
                  maxLength={255}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-transparent border-b border-warm-white/20 text-warm-white font-body text-sm py-3 focus:border-gold outline-none transition-colors placeholder:text-warm-white/30"
                  placeholder="Seu nome"
                />
              </div>
              <div>
                <label className="font-accent text-[10px] uppercase tracking-[0.3em] text-gold block mb-2">
                  Email
                </label>
                <input
                  type="email"
                  required
                  maxLength={320}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-transparent border-b border-warm-white/20 text-warm-white font-body text-sm py-3 focus:border-gold outline-none transition-colors placeholder:text-warm-white/30"
                  placeholder="seu@email.com"
                />
              </div>
              <div>
                <label className="font-accent text-[10px] uppercase tracking-[0.3em] text-gold block mb-2">
                  Telefone / WhatsApp
                </label>
                <input
                  type="tel"
                  maxLength={30}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-transparent border-b border-warm-white/20 text-warm-white font-body text-sm py-3 focus:border-gold outline-none transition-colors placeholder:text-warm-white/30"
                  placeholder="+55 (00) 00000-0000"
                />
              </div>
              <div>
                <label className="font-accent text-[10px] uppercase tracking-[0.3em] text-gold block mb-2">
                  Mensagem (opcional)
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={3}
                  maxLength={2000}
                  className="w-full bg-transparent border-b border-warm-white/20 text-warm-white font-body text-sm py-3 focus:border-gold outline-none transition-colors resize-none placeholder:text-warm-white/30"
                  placeholder="Conte-nos um pouco sobre você..."
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full font-accent text-xs uppercase tracking-[0.2em] bg-gold text-navy py-4 hover:bg-gold-light transition-all duration-300 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Enviando..." : "Quero me Inscrever"}
              </button>
              <p className="font-body text-[11px] text-warm-white/30 text-center">
                Ao se inscrever, você concorda com nossos termos de uso e política de privacidade.
              </p>
            </form>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

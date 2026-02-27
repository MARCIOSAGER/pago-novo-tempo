import { Link } from "wouter";

const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310419663028643999/FWKBucVCwodcLLRRkU5GKw/pago-logo_ea5770c3.jpeg";

export default function Footer() {
  return (
    <footer className="bg-navy py-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 mb-16">
          {/* Brand */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-3 mb-6">
              <img
                src={LOGO_URL}
                alt="P.A.G.O. Novo Tempo"
                className="h-12 w-12 rounded-full object-cover"
              />
              <div>
                <span className="font-display text-xl font-semibold text-warm-white tracking-wide">
                  P.A.G.O.
                </span>
                <span className="block font-accent text-[10px] uppercase tracking-[0.3em] text-gold">
                  Novo Tempo
                </span>
              </div>
            </div>
            <p className="font-body text-sm text-warm-white/40 leading-relaxed max-w-sm">
              Um sistema de reorganização de vida. Princípio, Alinhamento,
              Governo e Obediência — os fundamentos para construir um legado
              que permanece.
            </p>
          </div>

          {/* Navigation */}
          <div className="lg:col-span-2">
            <p className="font-accent text-[10px] uppercase tracking-[0.3em] text-gold mb-6">
              Navegação
            </p>
            <div className="space-y-3">
              {[
                { label: "Sobre", href: "#sobre" },
                { label: "Os 4 Pilares", href: "#pilares" },
                { label: "Jefferson", href: "#jefferson" },
                { label: "Kit Mentoria", href: "#kit" },
                { label: "FAQ", href: "#faq" },
              ].map((link) => (
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
              Os Pilares
            </p>
            <div className="space-y-3">
              <p className="font-body text-sm text-warm-white/40">
                <span className="text-gold font-semibold">P</span> — Princípio acima de Resultados
              </p>
              <p className="font-body text-sm text-warm-white/40">
                <span className="text-gold font-semibold">A</span> — Alinhamento gera Autoridade
              </p>
              <p className="font-body text-sm text-warm-white/40">
                <span className="text-gold font-semibold">G</span> — Governo inicia no Secreto
              </p>
              <p className="font-body text-sm text-warm-white/40">
                <span className="text-gold font-semibold">O</span> — Obediência sustenta o Invisível
              </p>
            </div>
          </div>

          {/* Contact */}
          <div className="lg:col-span-3">
            <p className="font-accent text-[10px] uppercase tracking-[0.3em] text-gold mb-6">
              Contato
            </p>
            <div className="space-y-3">
              <a
                href="#inscricao"
                className="block font-body text-sm text-warm-white/40 hover:text-warm-white transition-colors duration-300"
              >
                Inscreva-se na Mentoria
              </a>
              <p className="font-body text-sm text-warm-white/40">
                contato@pago.com.br
              </p>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="gold-line mb-8" />

        {/* Legal Links Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
          <p className="font-accent text-[10px] uppercase tracking-[0.2em] text-warm-white/30">
            &copy; {new Date().getFullYear()} P.A.G.O. Novo Tempo. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacidade" className="font-accent text-[11px] uppercase tracking-[0.15em] text-warm-white/50 hover:text-gold transition-colors duration-300">
              Privacidade
            </Link>
            <Link href="/termos" className="font-accent text-[11px] uppercase tracking-[0.15em] text-warm-white/50 hover:text-gold transition-colors duration-300">
              Termos de Uso
            </Link>
            <Link href="/cookies" className="font-accent text-[11px] uppercase tracking-[0.15em] text-warm-white/50 hover:text-gold transition-colors duration-300">
              Cookies
            </Link>
          </div>
        </div>

        {/* Quote */}
        <div className="text-center">
          <p className="font-body text-[11px] text-warm-white/20 italic">
            "Não estou construindo sucesso. Estou administrando uma visão."
          </p>
        </div>
      </div>
    </footer>
  );
}

import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function CookiePolicy() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FAFAF8" }}>
      {/* Header */}
      <div style={{ backgroundColor: "#1A2744" }} className="py-16">
        <div className="max-w-4xl mx-auto px-6 lg:px-12">
          <Link href="/">
            <span className="inline-flex items-center gap-2 font-accent text-xs uppercase tracking-[0.2em] hover:opacity-80 transition-opacity mb-8 cursor-pointer" style={{ color: "#B8A88A" }}>
              <ArrowLeft size={14} /> Voltar ao início
            </span>
          </Link>
          <h1 className="font-display text-4xl lg:text-5xl font-semibold" style={{ color: "#FAFAF8" }}>
            Política de Cookies
          </h1>
          <p className="font-body text-sm mt-4" style={{ color: "rgba(250,250,248,0.5)" }}>
            Última atualização: {new Date().toLocaleDateString("pt-BR")}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 lg:px-12 py-16">
        <div className="prose prose-lg max-w-none font-body leading-relaxed space-y-8" style={{ color: "rgba(26,39,68,0.8)" }}>
          <section>
            <h2 className="font-display text-2xl font-semibold mb-4" style={{ color: "#1A2744" }}>1. O que são Cookies?</h2>
            <p>
              Cookies são pequenos arquivos de texto armazenados no seu dispositivo (computador, tablet ou smartphone) quando você visita um site. Eles são amplamente utilizados para fazer os sites funcionarem de forma mais eficiente, bem como para fornecer informações aos proprietários do site.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-4" style={{ color: "#1A2744" }}>2. Tipos de Cookies que Utilizamos</h2>
            
            <h3 className="font-display text-xl font-semibold mt-6 mb-3" style={{ color: "#1A2744" }}>2.1 Cookies Essenciais (Necessários)</h3>
            <p>
              Estes cookies são indispensáveis para o funcionamento básico da plataforma. Sem eles, recursos essenciais como navegação e acesso a áreas seguras não funcionariam. Estes cookies não coletam informações que possam ser usadas para marketing.
            </p>
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr style={{ backgroundColor: "rgba(26,39,68,0.05)" }}>
                    <th className="text-left p-3 font-semibold" style={{ color: "#1A2744" }}>Cookie</th>
                    <th className="text-left p-3 font-semibold" style={{ color: "#1A2744" }}>Finalidade</th>
                    <th className="text-left p-3 font-semibold" style={{ color: "#1A2744" }}>Duração</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t" style={{ borderColor: "rgba(26,39,68,0.1)" }}>
                    <td className="p-3">session_token</td>
                    <td className="p-3">Autenticação e sessão do usuário</td>
                    <td className="p-3">Sessão</td>
                  </tr>
                  <tr className="border-t" style={{ borderColor: "rgba(26,39,68,0.1)" }}>
                    <td className="p-3">cookie_consent</td>
                    <td className="p-3">Armazena suas preferências de cookies</td>
                    <td className="p-3">365 dias</td>
                  </tr>
                  <tr className="border-t" style={{ borderColor: "rgba(26,39,68,0.1)" }}>
                    <td className="p-3">csrf_token</td>
                    <td className="p-3">Proteção contra ataques CSRF</td>
                    <td className="p-3">Sessão</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="font-display text-xl font-semibold mt-6 mb-3" style={{ color: "#1A2744" }}>2.2 Cookies de Desempenho (Analytics)</h3>
            <p>
              Estes cookies nos ajudam a entender como os visitantes interagem com a plataforma, coletando informações de forma anônima. Eles nos permitem melhorar continuamente a experiência do usuário.
            </p>
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr style={{ backgroundColor: "rgba(26,39,68,0.05)" }}>
                    <th className="text-left p-3 font-semibold" style={{ color: "#1A2744" }}>Cookie</th>
                    <th className="text-left p-3 font-semibold" style={{ color: "#1A2744" }}>Finalidade</th>
                    <th className="text-left p-3 font-semibold" style={{ color: "#1A2744" }}>Duração</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t" style={{ borderColor: "rgba(26,39,68,0.1)" }}>
                    <td className="p-3">umami_*</td>
                    <td className="p-3">Analytics de uso (anônimo, sem rastreamento pessoal)</td>
                    <td className="p-3">Sessão</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="font-display text-xl font-semibold mt-6 mb-3" style={{ color: "#1A2744" }}>2.3 Cookies de Funcionalidade</h3>
            <p>
              Estes cookies permitem que a plataforma se lembre de escolhas que você faz (como idioma ou região) e forneça recursos aprimorados e mais personalizados.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-4" style={{ color: "#1A2744" }}>3. Como Gerenciar Cookies</h2>
            <p>
              Você pode controlar e gerenciar cookies de diversas formas:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Banner de consentimento:</strong> Ao acessar nossa plataforma pela primeira vez, você verá um banner solicitando seu consentimento para o uso de cookies não essenciais.</li>
              <li><strong>Configurações do navegador:</strong> A maioria dos navegadores permite que você recuse ou aceite cookies, bem como exclua cookies já armazenados. Consulte a documentação do seu navegador para instruções específicas.</li>
              <li><strong>Revogação do consentimento:</strong> Você pode revogar seu consentimento a qualquer momento, ajustando as configurações de cookies ou limpando os cookies do navegador.</li>
            </ul>
            <p className="mt-4">
              <strong>Importante:</strong> A desativação de cookies essenciais pode afetar o funcionamento da plataforma, impedindo o acesso a determinados recursos.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-4" style={{ color: "#1A2744" }}>4. Cookies de Terceiros</h2>
            <p>
              Não utilizamos cookies de terceiros para publicidade ou rastreamento. Nosso sistema de analytics (Umami) é privacy-first e não coleta dados pessoais identificáveis.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-4" style={{ color: "#1A2744" }}>5. Base Legal (LGPD)</h2>
            <p>
              O uso de cookies essenciais é baseado no <strong>legítimo interesse</strong> (Art. 7º, IX da LGPD), pois são necessários para o funcionamento da plataforma. Cookies de desempenho e funcionalidade são utilizados com base no seu <strong>consentimento</strong> (Art. 7º, I da LGPD), obtido por meio do banner de cookies.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-4" style={{ color: "#1A2744" }}>6. Alterações nesta Política</h2>
            <p>
              Esta Política de Cookies pode ser atualizada periodicamente. Recomendamos que a revise regularmente. Alterações significativas serão comunicadas por meio da plataforma.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-4" style={{ color: "#1A2744" }}>7. Contato</h2>
            <div className="p-6 rounded-lg" style={{ backgroundColor: "rgba(232,224,212,0.3)" }}>
              <p><strong>E-mail:</strong> contato@metodopago.com</p>
              <p><strong>Responsável:</strong> Jefferson Evangelista</p>
              <p className="mt-2 text-sm" style={{ color: "rgba(26,39,68,0.6)" }}>
                Para mais informações sobre como tratamos seus dados, consulte nossa{" "}
                <Link href="/privacidade">
                  <span className="hover:underline cursor-pointer" style={{ color: "#B8A88A" }}>Política de Privacidade</span>
                </Link>.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

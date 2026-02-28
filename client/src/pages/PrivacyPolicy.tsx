import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-warm-white">
      {/* Header */}
      <div className="bg-navy py-16">
        <div className="max-w-4xl mx-auto px-6 lg:px-12">
          <Link href="/">
            <span className="inline-flex items-center gap-2 font-accent text-xs uppercase tracking-[0.2em] text-gold hover:text-gold-light transition-colors mb-8 cursor-pointer">
              <ArrowLeft size={14} /> Voltar ao início
            </span>
          </Link>
          <h1 className="font-display text-4xl lg:text-5xl font-semibold text-warm-white">
            Política de Privacidade
          </h1>
          <p className="font-body text-sm text-warm-white/50 mt-4">
            Última atualização: {new Date().toLocaleDateString("pt-BR")}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 lg:px-12 py-16">
        <div className="prose prose-lg max-w-none font-body text-navy/80 leading-relaxed space-y-8">
          <section>
            <h2 className="font-display text-2xl font-semibold text-navy mb-4">1. Introdução</h2>
            <p>
              A <strong>P.A.G.O — Novo Tempo</strong> ("nós", "nosso" ou "plataforma") valoriza a privacidade e a proteção dos dados pessoais de seus usuários. Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e protegemos suas informações pessoais, em conformidade com a <strong>Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018)</strong> e demais legislações aplicáveis.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold text-navy mb-4">2. Dados que Coletamos</h2>
            <p>Coletamos os seguintes tipos de dados pessoais:</p>
            <h3 className="font-display text-xl font-semibold text-navy mt-6 mb-3">2.1 Dados fornecidos diretamente por você</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Nome completo</strong> — para identificação e comunicação personalizada.</li>
              <li><strong>Endereço de e-mail</strong> — para envio de informações sobre a mentoria e comunicações relevantes.</li>
              <li><strong>Telefone/WhatsApp</strong> (opcional) — para contato direto relacionado à mentoria.</li>
              <li><strong>Mensagem pessoal</strong> (opcional) — para entender melhor suas necessidades e expectativas.</li>
            </ul>
            <h3 className="font-display text-xl font-semibold text-navy mt-6 mb-3">2.2 Dados coletados automaticamente</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Cookies e tecnologias semelhantes</strong> — para melhorar a experiência de navegação (veja nossa Política de Cookies).</li>
              <li><strong>Dados de navegação</strong> — endereço IP, tipo de navegador, páginas visitadas, tempo de permanência.</li>
              <li><strong>Dados de dispositivo</strong> — tipo de dispositivo, sistema operacional, resolução de tela.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold text-navy mb-4">3. Finalidade do Tratamento</h2>
            <p>Utilizamos seus dados pessoais para as seguintes finalidades:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Processar e gerenciar sua inscrição na mentoria P.A.G.O</li>
              <li>Enviar comunicações relacionadas à mentoria, incluindo materiais, atualizações e informações relevantes.</li>
              <li>Personalizar sua experiência na plataforma.</li>
              <li>Melhorar nossos serviços e conteúdos.</li>
              <li>Cumprir obrigações legais e regulatórias.</li>
              <li>Garantir a segurança da plataforma e prevenir fraudes.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold text-navy mb-4">4. Base Legal para o Tratamento</h2>
            <p>O tratamento de seus dados pessoais é realizado com base nas seguintes hipóteses legais previstas na LGPD:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Consentimento (Art. 7º, I)</strong> — quando você preenche o formulário de inscrição e aceita esta política.</li>
              <li><strong>Execução de contrato (Art. 7º, V)</strong> — para viabilizar a prestação dos serviços de mentoria.</li>
              <li><strong>Legítimo interesse (Art. 7º, IX)</strong> — para melhorias na plataforma e comunicações relevantes.</li>
              <li><strong>Cumprimento de obrigação legal (Art. 7º, II)</strong> — quando exigido por lei.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold text-navy mb-4">5. Compartilhamento de Dados</h2>
            <p>
              Seus dados pessoais <strong>não são vendidos, alugados ou compartilhados</strong> com terceiros para fins comerciais. Podemos compartilhar dados apenas nas seguintes situações:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Com prestadores de serviços essenciais (hospedagem, e-mail, processamento de pagamentos), sob contratos de confidencialidade.</li>
              <li>Quando exigido por lei, ordem judicial ou autoridade competente.</li>
              <li>Para proteger nossos direitos, propriedade ou segurança.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold text-navy mb-4">6. Armazenamento e Segurança</h2>
            <p>
              Seus dados são armazenados em servidores seguros com criptografia e protegidos por medidas técnicas e organizacionais adequadas, incluindo:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Criptografia de dados em trânsito (HTTPS/TLS).</li>
              <li>Controle de acesso restrito a pessoal autorizado.</li>
              <li>Monitoramento contínuo de segurança.</li>
              <li>Proteção contra ataques (rate limiting, firewall, sanitização de inputs).</li>
              <li>Backups regulares com criptografia.</li>
            </ul>
            <p className="mt-4">
              Os dados são retidos pelo tempo necessário para cumprir as finalidades descritas nesta política, ou conforme exigido por lei. Após o término do tratamento, os dados serão eliminados de forma segura.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold text-navy mb-4">7. Seus Direitos (LGPD)</h2>
            <p>Conforme a LGPD, você tem os seguintes direitos em relação aos seus dados pessoais:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Confirmação</strong> da existência de tratamento de dados.</li>
              <li><strong>Acesso</strong> aos seus dados pessoais.</li>
              <li><strong>Correção</strong> de dados incompletos, inexatos ou desatualizados.</li>
              <li><strong>Anonimização, bloqueio ou eliminação</strong> de dados desnecessários ou tratados em desconformidade.</li>
              <li><strong>Portabilidade</strong> dos dados a outro fornecedor de serviço.</li>
              <li><strong>Eliminação</strong> dos dados tratados com base no consentimento.</li>
              <li><strong>Informação</strong> sobre entidades com as quais seus dados foram compartilhados.</li>
              <li><strong>Revogação do consentimento</strong> a qualquer momento.</li>
            </ul>
            <p className="mt-4">
              Para exercer qualquer desses direitos, entre em contato conosco pelo e-mail: <strong>privacidade@pago.com.br</strong>
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold text-navy mb-4">8. Transferência Internacional de Dados</h2>
            <p>
              Alguns de nossos prestadores de serviços podem estar localizados fora do Brasil. Nesses casos, garantimos que a transferência de dados seja realizada em conformidade com a LGPD, mediante cláusulas contratuais adequadas ou outros mecanismos legais de proteção.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold text-navy mb-4">9. Alterações nesta Política</h2>
            <p>
              Esta Política de Privacidade pode ser atualizada periodicamente. Notificaremos sobre alterações significativas por meio da plataforma ou por e-mail. Recomendamos que revise esta política regularmente.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold text-navy mb-4">10. Contato e Encarregado de Dados (DPO)</h2>
            <p>
              Para dúvidas, solicitações ou reclamações relacionadas à proteção de dados pessoais, entre em contato com nosso Encarregado de Dados:
            </p>
            <div className="bg-sand/30 p-6 rounded-lg mt-4">
              <p><strong>E-mail:</strong> privacidade@pago.com.br</p>
              <p><strong>Responsável:</strong> Jefferson Evangelista</p>
              <p className="mt-2 text-sm text-navy/60">
                Você também pode registrar reclamação junto à Autoridade Nacional de Proteção de Dados (ANPD) em <a href="https://www.gov.br/anpd" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">www.gov.br/anpd</a>.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

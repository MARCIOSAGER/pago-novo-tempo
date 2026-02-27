import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function TermsOfUse() {
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
            Termos de Uso
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
            <h2 className="font-display text-2xl font-semibold text-navy mb-4">1. Aceitação dos Termos</h2>
            <p>
              Ao acessar e utilizar a plataforma <strong>P.A.G.O. — Novo Tempo</strong> ("Plataforma"), você declara que leu, compreendeu e concorda com estes Termos de Uso. Caso não concorde com qualquer disposição, solicitamos que não utilize a Plataforma.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold text-navy mb-4">2. Descrição do Serviço</h2>
            <p>
              A Plataforma P.A.G.O. é um sistema de mentoria e reorganização de vida fundamentado nos quatro pilares: <strong>Princípio, Alinhamento, Governo e Obediência</strong>. Os serviços incluem:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Programa de mentoria estruturado com acompanhamento personalizado.</li>
              <li>Acesso a conteúdos educacionais e materiais de estudo.</li>
              <li>Kit de mentoria (Bíblia BKJ, Caderno de Estudos, Caneta e Ebook).</li>
              <li>Participação em comunidade de mentorados.</li>
              <li>Assistente virtual (chatbot) para dúvidas sobre a metodologia.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold text-navy mb-4">3. Cadastro e Inscrição</h2>
            <p>Para se inscrever na mentoria, você deve:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Ter pelo menos 18 anos de idade ou contar com autorização de responsável legal.</li>
              <li>Fornecer informações verdadeiras, completas e atualizadas.</li>
              <li>Manter a confidencialidade de suas credenciais de acesso.</li>
            </ul>
            <p className="mt-4">
              Você é responsável por todas as atividades realizadas com suas credenciais. Em caso de uso não autorizado, notifique-nos imediatamente.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold text-navy mb-4">4. Propriedade Intelectual</h2>
            <p>
              Todo o conteúdo disponibilizado na Plataforma — incluindo, mas não se limitando a, textos, imagens, vídeos, metodologias, materiais didáticos, logotipos e design — é de propriedade exclusiva da <strong>P.A.G.O. — Novo Tempo</strong> e/ou de <strong>Jefferson Evangelista</strong>, protegido pelas leis de propriedade intelectual brasileiras e internacionais.
            </p>
            <p className="mt-4">É expressamente proibido:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Reproduzir, distribuir ou modificar qualquer conteúdo sem autorização prévia por escrito.</li>
              <li>Utilizar a metodologia P.A.G.O. para fins comerciais sem licenciamento adequado.</li>
              <li>Remover ou alterar avisos de direitos autorais ou marcas registradas.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold text-navy mb-4">5. Conduta do Usuário</h2>
            <p>Ao utilizar a Plataforma, você se compromete a:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Respeitar os demais usuários e a equipe da plataforma.</li>
              <li>Não utilizar a Plataforma para fins ilegais ou não autorizados.</li>
              <li>Não tentar acessar áreas restritas da Plataforma sem autorização.</li>
              <li>Não transmitir vírus, malware ou qualquer código malicioso.</li>
              <li>Não realizar engenharia reversa ou tentar comprometer a segurança da Plataforma.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold text-navy mb-4">6. Pagamentos e Reembolsos</h2>
            <p>
              Os valores e condições de pagamento para a mentoria serão informados no momento da inscrição. Eventuais reembolsos serão processados conforme o Código de Defesa do Consumidor (Lei nº 8.078/1990) e as condições específicas do programa de mentoria.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold text-navy mb-4">7. Limitação de Responsabilidade</h2>
            <p>
              A Plataforma P.A.G.O. é oferecida "como está" e "conforme disponível". Não garantimos que:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>A Plataforma estará disponível de forma ininterrupta ou livre de erros.</li>
              <li>Os resultados obtidos com a mentoria serão específicos ou garantidos, pois dependem do comprometimento individual de cada participante.</li>
            </ul>
            <p className="mt-4">
              Em nenhuma hipótese seremos responsáveis por danos indiretos, incidentais, especiais ou consequenciais decorrentes do uso ou impossibilidade de uso da Plataforma.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold text-navy mb-4">8. Modificações dos Termos</h2>
            <p>
              Reservamo-nos o direito de modificar estes Termos de Uso a qualquer momento. Alterações significativas serão comunicadas por meio da Plataforma ou por e-mail. O uso continuado da Plataforma após a publicação das alterações constitui aceitação dos novos termos.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold text-navy mb-4">9. Rescisão</h2>
            <p>
              Podemos suspender ou encerrar seu acesso à Plataforma, a nosso critério, caso haja violação destes Termos de Uso ou por qualquer outro motivo justificado, mediante notificação prévia quando possível.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold text-navy mb-4">10. Lei Aplicável e Foro</h2>
            <p>
              Estes Termos de Uso são regidos pelas leis da República Federativa do Brasil. Fica eleito o foro da comarca de domicílio do usuário para dirimir quaisquer controvérsias decorrentes destes Termos, conforme previsto no Código de Defesa do Consumidor.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold text-navy mb-4">11. Contato</h2>
            <div className="bg-sand/30 p-6 rounded-lg">
              <p><strong>E-mail:</strong> contato@pago.com.br</p>
              <p><strong>Responsável:</strong> Jefferson Evangelista</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

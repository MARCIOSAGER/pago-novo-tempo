import { TRPCError } from "@trpc/server";
import { createTransport } from "nodemailer";
import { ENV } from "./env";

export type NotificationPayload = {
  title: string;
  content: string;
};

const TITLE_MAX_LENGTH = 1200;
const CONTENT_MAX_LENGTH = 20000;

const trimValue = (value: string): string => value.trim();
const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const validatePayload = (input: NotificationPayload): NotificationPayload => {
  if (!isNonEmptyString(input.title)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required.",
    });
  }
  if (!isNonEmptyString(input.content)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required.",
    });
  }

  const title = trimValue(input.title);
  const content = trimValue(input.content);

  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`,
    });
  }

  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`,
    });
  }

  return { title, content };
};

function getTransporter() {
  return createTransport({
    host: ENV.smtpHost,
    port: parseInt(ENV.smtpPort, 10),
    secure: ENV.smtpPort === "465",
    auth: {
      user: ENV.smtpUser,
      pass: ENV.smtpPass,
    },
  });
}

function isSmtpConfigured(): boolean {
  return !!(ENV.smtpHost && ENV.smtpUser && ENV.smtpPass);
}

/**
 * Sends an email notification to the project owner via SMTP.
 * Returns `true` if the email was sent, `false` on failure.
 */
export async function notifyOwner(
  payload: NotificationPayload
): Promise<boolean> {
  const { title, content } = validatePayload(payload);

  if (!isSmtpConfigured() || !ENV.ownerEmail) {
    console.warn("[Notification] SMTP not configured, skipping email.");
    return false;
  }

  try {
    await getTransporter().sendMail({
      from: `"P.A.G.O. Notificações" <${ENV.smtpUser}>`,
      to: ENV.ownerEmail,
      subject: title,
      text: content,
      encoding: "utf-8",
      html: `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body><div style="font-family: 'Lora', serif; color: #1A2744;">
        <h2 style="color: #B8A88A;">${title}</h2>
        <p>${content.replace(/\n/g, "<br>")}</p>
        <hr style="border-color: #E8E0D4;" />
        <small style="color: #888;">P.A.G.O. — Novo Tempo</small>
      </div></body></html>`,
    });

    return true;
  } catch (error) {
    console.warn("[Notification] Email send failed:", error);
    return false;
  }
}

/**
 * Sends a confirmation email to the subscriber and notifies the admin.
 * Runs in background (fire-and-forget) so it doesn't block the API response.
 */
export type InscriptionData = {
  name: string;
  email: string;
  phone?: string | null;
  message?: string | null;
};

/**
 * Sends a test email to a specific address. Admin-only utility.
 */
export async function sendTestEmail(to: string): Promise<boolean> {
  if (!isSmtpConfigured()) {
    console.warn("[Notification] SMTP not configured, skipping test email.");
    return false;
  }

  try {
    await getTransporter().sendMail({
      from: `"P.A.G.O. — Novo Tempo" <${ENV.smtpUser}>`,
      to,
      subject: "Teste de email — P.A.G.O.",
      text: "Este é um email de teste do sistema P.A.G.O. Se você recebeu, o envio está funcionando!",
      encoding: "utf-8",
      html: `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body><div style="font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 600px; margin: 0 auto; color: #1A2744;">
        <div style="background: linear-gradient(135deg, #1A2744, #2A3A5C); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: #C8A951; margin: 0; font-size: 24px;">P.A.G.O.</h1>
          <p style="color: rgba(255,255,255,0.7); margin: 5px 0 0; font-size: 13px;">Novo Tempo</p>
        </div>
        <div style="padding: 30px; background: #FAFAF8; border: 1px solid #E8E0D4; border-top: none; border-radius: 0 0 8px 8px;">
          <p style="font-size: 16px;">Este é um <strong>email de teste</strong> do sistema P.A.G.O.</p>
          <div style="background: #E8F5E9; border-left: 4px solid #4CAF50; padding: 15px; margin: 20px 0; border-radius: 0 6px 6px 0;">
            <p style="margin: 0; color: #2E7D32;">Se você recebeu este email, o envio está funcionando corretamente!</p>
          </div>
          <p style="color: #888; font-size: 13px;">Enviado de: ${ENV.smtpUser}<br>Enviado para: ${to}</p>
        </div>
      </div></body></html>`,
    });

    console.log(`[Notification] Test email sent to ${to}`);
    return true;
  } catch (error) {
    console.warn("[Notification] Test email failed:", error);
    return false;
  }
}

// ─── Diagnostico P.A.G.O. Email ─────────────────────────────

export type DiagnosticEmailData = {
  nome: string;
  email: string;
  mediaP: number;
  mediaA: number;
  mediaG: number;
  mediaO: number;
  mediaGeral: number;
  pilarMaisFraco: string;
};

function getStatusLabel(media: number): { label: string; color: string } {
  if (media >= 8) return { label: "Pilar Sólido", color: "#2E5E3E" };
  if (media >= 5) return { label: "Em Construção", color: "#B8A88A" };
  if (media >= 3) return { label: "Pilar Frágil", color: "#8B6914" };
  return { label: "Em Colapso", color: "#7A3030" };
}

const pillarNames: Record<string, string> = {
  P: "Princípio",
  A: "Alinhamento",
  G: "Governo",
  O: "Obediência",
};

export async function sendDiagnosticEmail(data: DiagnosticEmailData): Promise<void> {
  if (!isSmtpConfigured()) {
    console.warn("[Notification] SMTP not configured, skipping diagnostic email.");
    return;
  }

  const transporter = getTransporter();
  const fromAddress = `"P.A.G.O. — Novo Tempo" <${ENV.smtpUser}>`;
  const overallStatus = getStatusLabel(data.mediaGeral);

  const pillarRows = (["P", "A", "G", "O"] as const).map((p) => {
    const media = data[`media${p}` as keyof DiagnosticEmailData] as number;
    const status = getStatusLabel(media);
    const isWeakest = p === data.pilarMaisFraco;
    return `<tr style="${isWeakest ? "background: #FFF8E1;" : ""}">
      <td style="padding: 12px; border-bottom: 1px solid #E8E0D4; font-weight: 600;">${p}</td>
      <td style="padding: 12px; border-bottom: 1px solid #E8E0D4;">${pillarNames[p]}</td>
      <td style="padding: 12px; border-bottom: 1px solid #E8E0D4; text-align: center; font-weight: 600;">${media.toFixed(1)}</td>
      <td style="padding: 12px; border-bottom: 1px solid #E8E0D4; text-align: center;">
        <span style="color: ${status.color}; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">${status.label}</span>
      </td>
    </tr>`;
  }).join("");

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>
<div style="font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 600px; margin: 0 auto; color: #1A2744;">
  <div style="background: linear-gradient(135deg, #1A2744, #2A3A5C); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: #C8A951; margin: 0; font-size: 24px;">P.A.G.O.</h1>
    <p style="color: rgba(255,255,255,0.7); margin: 5px 0 0; font-size: 13px;">Diagnóstico — Resultado</p>
  </div>
  <div style="padding: 30px; background: #FAFAF8; border: 1px solid #E8E0D4; border-top: none;">
    <p style="font-size: 16px;">Olá <strong>${data.nome}</strong>,</p>
    <p>Aqui está o resultado do seu Diagnóstico P.A.G.O.:</p>

    <div style="text-align: center; margin: 25px 0; padding: 20px; background: #F5F0E8; border-radius: 8px;">
      <p style="margin: 0 0 5px; color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">Média Geral</p>
      <p style="margin: 0; font-size: 36px; font-weight: 700; color: #1A2744;">${data.mediaGeral.toFixed(1)}</p>
      <p style="margin: 5px 0 0; font-size: 13px; font-weight: 600; color: ${overallStatus.color};">${overallStatus.label}</p>
    </div>

    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
      <thead>
        <tr style="background: #1A2744; color: #FAFAF8;">
          <th style="padding: 10px; text-align: left; font-size: 12px;">Pilar</th>
          <th style="padding: 10px; text-align: left; font-size: 12px;">Nome</th>
          <th style="padding: 10px; text-align: center; font-size: 12px;">Média</th>
          <th style="padding: 10px; text-align: center; font-size: 12px;">Status</th>
        </tr>
      </thead>
      <tbody>${pillarRows}</tbody>
    </table>

    <div style="background: #F5F0E8; border-left: 4px solid #C8A951; padding: 15px; margin: 20px 0; border-radius: 0 6px 6px 0;">
      <p style="margin: 0; font-size: 13px; color: #5A4E3A;">
        <strong>Pilar que mais precisa de atenção:</strong> ${pillarNames[data.pilarMaisFraco]} (${data.pilarMaisFraco})
      </p>
    </div>

    <div style="text-align: center; margin-top: 25px;">
      <a href="https://metodopago.com/mentoria" style="display: inline-block; background: #1A2744; color: #C8A951; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px;">Conheça a Mentoria P.A.G.O.</a>
    </div>
  </div>
  <p style="text-align: center; color: #999; font-size: 11px; font-style: italic; margin-top: 15px;">
    Este diagnóstico é uma ferramenta de reflexão. Os resultados são um ponto de partida para conversa com um mentor.
  </p>
  <p style="text-align: center; color: #999; font-size: 10px; margin-top: 8px;">
    Este email foi enviado porque você completou o diagnóstico em metodopago.com
  </p>
</div></body></html>`;

  try {
    await transporter.sendMail({
      from: fromAddress,
      to: data.email,
      subject: `Seu Diagnóstico P.A.G.O. — Média ${data.mediaGeral.toFixed(1)}`,
      text: `Olá ${data.nome},\n\nSeu Diagnóstico P.A.G.O.:\nMédia Geral: ${data.mediaGeral.toFixed(1)}\nP (Princípio): ${data.mediaP.toFixed(1)}\nA (Alinhamento): ${data.mediaA.toFixed(1)}\nG (Governo): ${data.mediaG.toFixed(1)}\nO (Obediência): ${data.mediaO.toFixed(1)}\nPilar mais fraco: ${pillarNames[data.pilarMaisFraco]}\n\nConheça a Mentoria P.A.G.O.: https://metodopago.com/mentoria\n\nEste diagnóstico é uma ferramenta de reflexão. Os resultados são um ponto de partida para conversa com um mentor.`,
      encoding: "utf-8",
      html,
    });
    console.log(`[Notification] Diagnostic email sent to ${data.email}`);
  } catch (error) {
    console.warn("[Notification] Diagnostic email failed:", error);
  }
}

// ─── Diagnostico P.A.G.O. Email with PDF attachment ─────────

export type DiagnosticEmailWithPdfData = DiagnosticEmailData & {
  pdfBase64: string;
};

export async function sendDiagnosticEmailWithPdf(data: DiagnosticEmailWithPdfData): Promise<void> {
  if (!isSmtpConfigured()) {
    console.warn("[Notification] SMTP not configured, skipping diagnostic email with PDF.");
    return;
  }

  const transporter = getTransporter();
  const fromAddress = `"P.A.G.O. — Novo Tempo" <${ENV.smtpUser}>`;
  const overallStatus = getStatusLabel(data.mediaGeral);

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>
<div style="font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 600px; margin: 0 auto; color: #1A2744;">
  <div style="background: linear-gradient(135deg, #1A2744, #2A3A5C); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: #C8A951; margin: 0; font-size: 24px;">P.A.G.O.</h1>
    <p style="color: rgba(255,255,255,0.7); margin: 5px 0 0; font-size: 13px;">Diagnóstico — Resultado Completo</p>
  </div>
  <div style="padding: 30px; background: #FAFAF8; border: 1px solid #E8E0D4; border-top: none;">
    <p style="font-size: 16px;">Olá <strong>${data.nome}</strong>,</p>
    <p>Seu relatório completo do Diagnóstico P.A.G.O. está em anexo (PDF).</p>

    <div style="text-align: center; margin: 25px 0; padding: 20px; background: #F5F0E8; border-radius: 8px;">
      <p style="margin: 0 0 5px; color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">Média Geral</p>
      <p style="margin: 0; font-size: 36px; font-weight: 700; color: #1A2744;">${data.mediaGeral.toFixed(1)}</p>
      <p style="margin: 5px 0 0; font-size: 13px; font-weight: 600; color: ${overallStatus.color};">${overallStatus.label}</p>
    </div>

    <p style="font-size: 13px; color: #666; text-align: center;">Abra o PDF anexo para ver a análise detalhada de cada pilar, o gráfico radar e as recomendações personalizadas.</p>

    <div style="text-align: center; margin-top: 25px;">
      <a href="https://metodopago.com/mentoria" style="display: inline-block; background: #1A2744; color: #C8A951; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px;">Conheça a Mentoria P.A.G.O.</a>
    </div>
  </div>
  <p style="text-align: center; color: #999; font-size: 11px; font-style: italic; margin-top: 15px;">
    Este diagnóstico é uma ferramenta de reflexão. Os resultados são um ponto de partida para conversa com um mentor.
  </p>
  <p style="text-align: center; color: #999; font-size: 10px; margin-top: 8px;">
    Este email foi enviado porque você completou o diagnóstico em metodopago.com
  </p>
</div></body></html>`;

  try {
    await transporter.sendMail({
      from: fromAddress,
      to: data.email,
      subject: `Seu Diagnóstico P.A.G.O. — Relatório Completo (${data.mediaGeral.toFixed(1)})`,
      text: `Olá ${data.nome},\n\nSeu relatório completo do Diagnóstico P.A.G.O. está em anexo.\n\nMédia Geral: ${data.mediaGeral.toFixed(1)}\n\nConheça a Mentoria P.A.G.O.: https://metodopago.com/mentoria`,
      encoding: "utf-8",
      html,
      attachments: [
        {
          filename: `diagnostico-${data.nome.replace(/\s+/g, "-")}.pdf`,
          content: data.pdfBase64,
          encoding: "base64",
          contentType: "application/pdf",
        },
      ],
    });
    console.log(`[Notification] Diagnostic email with PDF sent to ${data.email}`);
  } catch (error) {
    console.warn("[Notification] Diagnostic email with PDF failed:", error);
  }
}

// ─── Corporate Invite Email ──────────────────────────────────

export type InviteEmailData = {
  recipientEmail: string;
  recipientName?: string;
  orgName: string;
  inviterName: string;
  inviteToken: string;
  role: string;
};

export async function sendInviteEmail(data: InviteEmailData): Promise<boolean> {
  if (!isSmtpConfigured()) {
    console.warn("[Notification] SMTP not configured, skipping invite email.");
    return false;
  }

  const roleLabels: Record<string, string> = {
    owner: "Proprietário",
    hr_admin: "Administrador RH",
    hr_viewer: "Visualizador RH",
    employee: "Colaborador",
  };
  const roleLabel = roleLabels[data.role] || data.role;
  const acceptUrl = `https://metodopago.com/corporate/invite/${data.inviteToken}`;

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>
<div style="font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 600px; margin: 0 auto; color: #1A2744;">
  <div style="background: linear-gradient(135deg, #1A2744, #2A3A5C); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: #C8A951; margin: 0; font-size: 24px;">P.A.G.O.</h1>
    <p style="color: rgba(255,255,255,0.7); margin: 5px 0 0; font-size: 13px;">Diagnóstico Corporativo</p>
  </div>
  <div style="padding: 30px; background: #FAFAF8; border: 1px solid #E8E0D4; border-top: none;">
    <p style="font-size: 16px;">Olá${data.recipientName ? ` <strong>${data.recipientName}</strong>` : ""},</p>
    <p>Você foi convidado(a) por <strong>${data.inviterName}</strong> para participar do Diagnóstico Corporativo P.A.G.O. na organização <strong>${data.orgName}</strong>.</p>

    <div style="background: #F5F0E8; border-left: 4px solid #C8A951; padding: 15px; margin: 20px 0; border-radius: 0 6px 6px 0;">
      <p style="margin: 0 0 5px; font-size: 13px; color: #888;">Sua função:</p>
      <p style="margin: 0; font-weight: 600; color: #5A4E3A;">${roleLabel}</p>
    </div>

    <div style="text-align: center; margin: 25px 0;">
      <a href="${acceptUrl}" style="display: inline-block; background: #1A2744; color: #C8A951; padding: 14px 35px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 15px;">Aceitar Convite</a>
    </div>

    <p style="font-size: 12px; color: #999; text-align: center;">Este convite expira em 7 dias.</p>
  </div>
  <p style="text-align: center; color: #999; font-size: 10px; margin-top: 15px;">
    Ao aceitar, você autoriza o tratamento dos seus dados para fins de diagnóstico organizacional, conforme a LGPD (Lei 13.709/2018).
  </p>
</div></body></html>`;

  try {
    await getTransporter().sendMail({
      from: `"P.A.G.O. — Novo Tempo" <${ENV.smtpUser}>`,
      to: data.recipientEmail,
      subject: `Convite — Diagnóstico Corporativo P.A.G.O. | ${data.orgName}`,
      text: `Olá${data.recipientName ? ` ${data.recipientName}` : ""},\n\nVocê foi convidado(a) para participar do Diagnóstico Corporativo P.A.G.O. na organização ${data.orgName}.\n\nAceite o convite: ${acceptUrl}\n\nEste convite expira em 7 dias.`,
      encoding: "utf-8",
      html,
    });
    console.log(`[Notification] Invite email sent to ${data.recipientEmail}`);
    return true;
  } catch (error) {
    console.warn("[Notification] Invite email failed:", error);
    return false;
  }
}

// ─── Corporate Demo Request Email ───────────────────────────

export type DemoRequestEmailData = {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  employeeRange: string;
  message?: string | null;
};

export async function sendDemoRequestEmail(data: DemoRequestEmailData): Promise<boolean> {
  if (!isSmtpConfigured()) {
    console.warn("[Notification] SMTP not configured, skipping demo request email.");
    return false;
  }

  const transporter = getTransporter();
  const fromAddress = `"P.A.G.O. — Novo Tempo" <${ENV.smtpUser}>`;
  const toAddress = "contato@metodopago.com";

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>
<div style="font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 600px; margin: 0 auto; color: #1A2744;">
  <div style="background: linear-gradient(135deg, #1A2744, #2A3A5C); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: #C8A951; margin: 0; font-size: 24px;">P.A.G.O.</h1>
    <p style="color: rgba(255,255,255,0.7); margin: 5px 0 0; font-size: 13px;">Corporativo — Nova Solicitação</p>
  </div>
  <div style="padding: 30px; background: #FAFAF8; border: 1px solid #E8E0D4; border-top: none; border-radius: 0 0 8px 8px;">
    <h2 style="color: #1A2744; margin: 0 0 20px; font-size: 18px;">Solicitação de Demonstração</h2>
    <table style="width: 100%; border-collapse: collapse;">
      <tr><td style="padding: 10px 0; color: #888; width: 140px; border-bottom: 1px solid #E8E0D4;">Empresa</td><td style="padding: 10px 0; font-weight: 600; border-bottom: 1px solid #E8E0D4;">${data.companyName}</td></tr>
      <tr><td style="padding: 10px 0; color: #888; border-bottom: 1px solid #E8E0D4;">Responsável</td><td style="padding: 10px 0; font-weight: 600; border-bottom: 1px solid #E8E0D4;">${data.contactName}</td></tr>
      <tr><td style="padding: 10px 0; color: #888; border-bottom: 1px solid #E8E0D4;">Email</td><td style="padding: 10px 0; border-bottom: 1px solid #E8E0D4;"><a href="mailto:${data.email}" style="color: #2A3A5C;">${data.email}</a></td></tr>
      <tr><td style="padding: 10px 0; color: #888; border-bottom: 1px solid #E8E0D4;">Telefone</td><td style="padding: 10px 0; border-bottom: 1px solid #E8E0D4;"><a href="tel:${data.phone}" style="color: #2A3A5C;">${data.phone}</a></td></tr>
      <tr><td style="padding: 10px 0; color: #888; border-bottom: 1px solid #E8E0D4;">Colaboradores</td><td style="padding: 10px 0; font-weight: 600; border-bottom: 1px solid #E8E0D4;">${data.employeeRange}</td></tr>
      ${data.message ? `<tr><td style="padding: 10px 0; color: #888; vertical-align: top;">Mensagem</td><td style="padding: 10px 0;">${data.message}</td></tr>` : ""}
    </table>
    <div style="margin-top: 25px; text-align: center;">
      <a href="https://metodopago.com/admin/organizations" style="display: inline-block; background: #1A2744; color: #C8A951; padding: 10px 25px; border-radius: 6px; text-decoration: none; font-weight: 600;">Ver no Painel Admin</a>
    </div>
  </div>
</div></body></html>`;

  try {
    await transporter.sendMail({
      from: fromAddress,
      to: toAddress,
      subject: `Nova Solicitação Corporativa — ${data.companyName}`,
      text: `Nova solicitação de demonstração corporativa:\n\nEmpresa: ${data.companyName}\nResponsável: ${data.contactName}\nEmail: ${data.email}\nTelefone: ${data.phone}\nColaboradores: ${data.employeeRange}\n${data.message ? `Mensagem: ${data.message}` : ""}`,
      encoding: "utf-8",
      html,
    });
    console.log(`[Notification] Demo request email sent for ${data.companyName}`);
    return true;
  } catch (error) {
    console.warn("[Notification] Demo request email failed:", error);
    return false;
  }
}

export async function notifyInscription(data: InscriptionData): Promise<void> {
  if (!isSmtpConfigured()) {
    console.warn("[Notification] SMTP not configured, skipping inscription emails.");
    return;
  }

  const transporter = getTransporter();
  const fromAddress = `"P.A.G.O. — Novo Tempo" <${ENV.smtpUser}>`;

  // 1. Confirmation email to subscriber
  try {
    await transporter.sendMail({
      from: fromAddress,
      to: data.email,
      subject: "Inscrição recebida — P.A.G.O. Novo Tempo",
      text: `Olá ${data.name},\n\nSua inscrição na mentoria P.A.G.O. foi recebida com sucesso!\n\nEm breve entraremos em contato.\n\nAbraço,\nEquipe P.A.G.O.`,
      encoding: "utf-8",
      html: `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body><div style="font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 600px; margin: 0 auto; color: #1A2744;">
        <div style="background: linear-gradient(135deg, #1A2744, #2A3A5C); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: #C8A951; margin: 0; font-size: 24px;">P.A.G.O.</h1>
          <p style="color: rgba(255,255,255,0.7); margin: 5px 0 0; font-size: 13px;">Novo Tempo</p>
        </div>
        <div style="padding: 30px; background: #FAFAF8; border: 1px solid #E8E0D4; border-top: none; border-radius: 0 0 8px 8px;">
          <p style="font-size: 16px;">Olá <strong>${data.name}</strong>,</p>
          <p>Sua inscrição na mentoria <strong>P.A.G.O.</strong> foi recebida com sucesso!</p>
          <div style="background: #F5F0E8; border-left: 4px solid #C8A951; padding: 15px; margin: 20px 0; border-radius: 0 6px 6px 0;">
            <p style="margin: 0; color: #5A4E3A;">Em breve entraremos em contato para os próximos passos.</p>
          </div>
          <p>Abraço,<br><strong>Equipe P.A.G.O.</strong></p>
        </div>
        <p style="text-align: center; color: #999; font-size: 11px; margin-top: 15px;">
          Este email foi enviado porque você se inscreveu em metodopago.com
        </p>
      </div></body></html>`,
    });
    console.log(`[Notification] Confirmation email sent to ${data.email}`);
  } catch (error) {
    console.warn("[Notification] Confirmation email failed:", error);
  }

  // 2. Notification email to admin/owner
  if (ENV.ownerEmail) {
    try {
      const details = [
        `Nome: ${data.name}`,
        `Email: ${data.email}`,
        data.phone ? `Telefone: ${data.phone}` : null,
        data.message ? `Mensagem: ${data.message}` : null,
      ].filter(Boolean).join("\n");

      await transporter.sendMail({
        from: fromAddress,
        to: ENV.ownerEmail,
        subject: `Nova inscrição — ${data.name}`,
        text: `Nova inscrição na mentoria P.A.G.O.:\n\n${details}`,
        encoding: "utf-8",
      html: `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body><div style="font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 600px; margin: 0 auto; color: #1A2744;">
          <div style="background: linear-gradient(135deg, #1A2744, #2A3A5C); padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h2 style="color: #C8A951; margin: 0;">Nova Inscrição</h2>
          </div>
          <div style="padding: 25px; background: #FAFAF8; border: 1px solid #E8E0D4; border-top: none; border-radius: 0 0 8px 8px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; color: #888; width: 100px;">Nome</td><td style="padding: 8px 0; font-weight: 600;">${data.name}</td></tr>
              <tr><td style="padding: 8px 0; color: #888;">Email</td><td style="padding: 8px 0;"><a href="mailto:${data.email}" style="color: #2A3A5C;">${data.email}</a></td></tr>
              ${data.phone ? `<tr><td style="padding: 8px 0; color: #888;">Telefone</td><td style="padding: 8px 0;"><a href="tel:${data.phone}" style="color: #2A3A5C;">${data.phone}</a></td></tr>` : ""}
              ${data.message ? `<tr><td style="padding: 8px 0; color: #888; vertical-align: top;">Mensagem</td><td style="padding: 8px 0;">${data.message}</td></tr>` : ""}
            </table>
            <div style="margin-top: 20px; text-align: center;">
              <a href="https://metodopago.com/admin" style="background: #1A2744; color: #C8A951; padding: 10px 25px; border-radius: 6px; text-decoration: none; font-weight: 600;">Ver no Painel</a>
            </div>
          </div>
        </div></body></html>`,
      });
      console.log(`[Notification] Admin notification sent to ${ENV.ownerEmail}`);
    } catch (error) {
      console.warn("[Notification] Admin notification failed:", error);
    }
  }
}

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

// ─── Password Reset Email ───────────────────────────────────

export async function sendPasswordResetEmail(email: string, name: string, resetUrl: string): Promise<boolean> {
  if (!isSmtpConfigured()) {
    console.warn("[Notification] SMTP not configured, skipping password reset email.");
    return false;
  }

  const transporter = getTransporter();
  const fromAddress = `"P.A.G.O. — Novo Tempo" <${ENV.smtpUser}>`;

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>
<div style="font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 600px; margin: 0 auto; color: #1A2744;">
  <div style="background: linear-gradient(135deg, #1A2744, #2A3A5C); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: #C8A951; margin: 0; font-size: 24px;">P.A.G.O.</h1>
    <p style="color: rgba(255,255,255,0.7); margin: 5px 0 0; font-size: 13px;">Redefinição de Senha</p>
  </div>
  <div style="padding: 30px; background: #FAFAF8; border: 1px solid #E8E0D4; border-top: none; border-radius: 0 0 8px 8px;">
    <p style="margin: 0 0 15px;">Olá${name ? ` ${name}` : ""},</p>
    <p style="margin: 0 0 20px;">Recebemos uma solicitação para redefinir a sua senha. Clique no botão abaixo para criar uma nova senha:</p>
    <div style="text-align: center; margin: 25px 0;">
      <a href="${resetUrl}" style="display: inline-block; background: #1A2744; color: #C8A951; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: 600;">Redefinir Senha</a>
    </div>
    <p style="margin: 0 0 10px; font-size: 13px; color: #666;">Este link expira em 1 hora.</p>
    <p style="margin: 0; font-size: 13px; color: #666;">Se você não solicitou esta redefinição, ignore este email.</p>
  </div>
</div></body></html>`;

  try {
    await transporter.sendMail({
      from: fromAddress,
      to: email,
      subject: "Redefinir Senha — P.A.G.O.",
      text: `Olá${name ? ` ${name}` : ""},\n\nClique no link abaixo para redefinir a sua senha:\n${resetUrl}\n\nEste link expira em 1 hora.\n\nSe você não solicitou esta redefinição, ignore este email.`,
      encoding: "utf-8",
      html,
    });
    console.log(`[Notification] Password reset email sent to ${email}`);
    return true;
  } catch (error) {
    console.warn("[Notification] Password reset email failed:", error);
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

export async function sendDemoConfirmationEmail(data: DemoRequestEmailData): Promise<boolean> {
  if (!isSmtpConfigured()) return false;

  const transporter = getTransporter();
  const fromAddress = `"P.A.G.O. — Novo Tempo" <${ENV.smtpUser}>`;

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>
<div style="font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 600px; margin: 0 auto; color: #1A2744;">
  <div style="background: linear-gradient(135deg, #1A2744, #2A3A5C); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: #C8A951; margin: 0; font-size: 24px;">P.A.G.O.</h1>
    <p style="color: rgba(255,255,255,0.7); margin: 5px 0 0; font-size: 13px;">Corporativo</p>
  </div>
  <div style="padding: 30px; background: #FAFAF8; border: 1px solid #E8E0D4; border-top: none; border-radius: 0 0 8px 8px;">
    <h2 style="color: #1A2744; margin: 0 0 15px; font-size: 18px;">Recebemos a sua solicitação!</h2>
    <p style="margin: 0 0 20px; color: #555; line-height: 1.6;">Olá ${data.contactName},</p>
    <p style="margin: 0 0 20px; color: #555; line-height: 1.6;">Obrigado pelo interesse no <strong>P.A.G.O. Corporativo</strong>. Recebemos os dados da empresa <strong>${data.companyName}</strong> e a nossa equipa irá analisá-los.</p>
    <p style="margin: 0 0 20px; color: #555; line-height: 1.6;">Em breve entraremos em contacto para agendar uma demonstração e explicar como o diagnóstico pode transformar a performance da sua equipa.</p>
    <div style="background: #F5F0E8; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <p style="margin: 0; font-size: 13px; color: #888;">Próximos passos:</p>
      <ol style="margin: 10px 0 0; padding-left: 20px; color: #555; font-size: 14px; line-height: 1.8;">
        <li>A nossa equipa analisa a sua solicitação</li>
        <li>Entramos em contacto para agendar a demonstração</li>
        <li>Após aprovação, você recebe um convite para criar a sua conta</li>
        <li>Configure a sua equipa e inicie o diagnóstico</li>
      </ol>
    </div>
    <p style="margin: 0; color: #888; font-size: 13px;">Se tiver alguma dúvida, responda a este email.</p>
  </div>
</div></body></html>`;

  try {
    await transporter.sendMail({
      from: fromAddress,
      to: data.email,
      subject: `Recebemos a sua solicitação — P.A.G.O. Corporativo`,
      text: `Olá ${data.contactName},\n\nObrigado pelo interesse no P.A.G.O. Corporativo. Recebemos os dados da empresa ${data.companyName} e a nossa equipa irá analisá-los.\n\nEm breve entraremos em contacto para agendar uma demonstração.\n\nEquipa P.A.G.O.`,
      encoding: "utf-8",
      html,
    });
    console.log(`[Notification] Demo confirmation email sent to ${data.email}`);
    return true;
  } catch (error) {
    console.warn("[Notification] Demo confirmation email failed:", error);
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

// ─── Purchase Delivery Emails ───────────────────────────────

export type EbookDeliveryData = {
  email: string;
  nome: string;
  downloadUrl: string;
  refundUrl?: string;
  language: "pt" | "en" | "es";
  expiresAt: Date;
  maxDownloads: number;
};

export async function sendEbookDeliveryEmail(data: EbookDeliveryData): Promise<void> {
  if (!isSmtpConfigured()) {
    console.warn("[Notification] SMTP not configured, skipping ebook delivery email.");
    return;
  }
  const transporter = getTransporter();
  const fromAddress = `"P.A.G.O. — Novo Tempo" <${ENV.smtpUser}>`;
  const langNames = { pt: "Português", en: "English", es: "Español" } as const;
  const expiresStr = data.expiresAt.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>
<div style="font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 600px; margin: 0 auto; color: #1A2744;">
  <div style="background: linear-gradient(135deg, #1A2744, #2A3A5C); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: #C8A951; margin: 0; font-size: 24px;">P.A.G.O.</h1>
    <p style="color: rgba(255,255,255,0.7); margin: 5px 0 0; font-size: 13px;">Seu Ebook chegou</p>
  </div>
  <div style="padding: 30px; background: #FAFAF8; border: 1px solid #E8E0D4; border-top: none;">
    <p style="font-size: 16px;">Olá <strong>${data.nome}</strong>,</p>
    <p>Obrigado pela sua compra! Seu ebook <strong>P.A.G.O. (${langNames[data.language]})</strong> está pronto para download.</p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.downloadUrl}" style="display: inline-block; background: #C8A951; color: #1A2744; padding: 16px 40px; border-radius: 6px; text-decoration: none; font-weight: 700; font-size: 15px; letter-spacing: 0.05em;">BAIXAR EBOOK</a>
    </div>

    <div style="background: #F5F0E8; border-left: 4px solid #C8A951; padding: 15px; margin: 20px 0; border-radius: 0 6px 6px 0; font-size: 13px; color: #5A4E3A;">
      <p style="margin: 0 0 8px;"><strong>Informações importantes:</strong></p>
      <ul style="margin: 0; padding-left: 18px;">
        <li>Link válido até <strong>${expiresStr}</strong></li>
        <li>Até <strong>${data.maxDownloads} downloads</strong> permitidos</li>
        <li>Este link é pessoal — não compartilhe</li>
      </ul>
    </div>

    <p style="font-size: 13px; color: #666; margin-top: 25px;">Se o botão não funcionar, copie e cole este link no seu navegador:<br/>
      <a href="${data.downloadUrl}" style="color: #1A2744; word-break: break-all; font-size: 12px;">${data.downloadUrl}</a>
    </p>

    ${data.refundUrl ? `<div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #E8E0D4; font-size: 12px; color: #888;">
      <p style="margin: 0 0 6px;"><strong>Garantia de 7 dias (CDC Art. 49)</strong></p>
      <p style="margin: 0;">Não ficou satisfeito? Você pode <a href="${data.refundUrl}" style="color: #1A2744;">solicitar reembolso</a> dentro de 7 dias da compra, sem precisar justificar.</p>
    </div>` : ""}
  </div>
  <p style="text-align: center; color: #999; font-size: 10px; margin-top: 15px;">
    Pagamento processado por Stripe · metodopago.com
  </p>
</div></body></html>`;

  try {
    await transporter.sendMail({
      from: fromAddress,
      to: data.email,
      subject: `Seu Ebook P.A.G.O. (${langNames[data.language]}) — Link de Download`,
      text: `Olá ${data.nome},\n\nObrigado pela sua compra! Baixe seu ebook P.A.G.O. (${langNames[data.language]}) aqui:\n${data.downloadUrl}\n\nLink válido até ${expiresStr} · Até ${data.maxDownloads} downloads permitidos.`,
      encoding: "utf-8",
      html,
    });
    console.log(`[Notification] Ebook delivery email sent to ${data.email} (${data.language})`);
  } catch (error) {
    console.error("[Notification] Ebook delivery email failed:", error);
    throw error;
  }
}

type Lang = "pt" | "en" | "es";

const REFUND_COPY: Record<Lang, {
  receivedSubject: (product: string) => string;
  receivedHeadline: string;
  receivedP1: (nome: string) => string;
  receivedP2: (product: string) => string;
  receivedP3: string;
  receivedSignature: string;
  deniedSubject: (product: string) => string;
  deniedHeadline: string;
  deniedP1: (nome: string) => string;
  deniedP2: (product: string) => string;
  deniedNoteLabel: string;
  deniedFooter: string;
}> = {
  pt: {
    receivedSubject: (p) => `Solicitação de reembolso recebida — ${p}`,
    receivedHeadline: "Solicitação Recebida",
    receivedP1: (n) => `Olá ${n},`,
    receivedP2: (p) => `Recebemos sua solicitação de reembolso da sua compra de <strong>${p}</strong>.`,
    receivedP3: "Nossa equipe vai analisar e retornar em até 2 dias úteis pelo email. Se for aprovado dentro do prazo de 7 dias (CDC Art. 49), o valor é devolvido integralmente na mesma forma de pagamento.",
    receivedSignature: "Obrigado pela paciência.",
    deniedSubject: (p) => `Atualização sobre sua solicitação de reembolso — ${p}`,
    deniedHeadline: "Solicitação Analisada",
    deniedP1: (n) => `Olá ${n},`,
    deniedP2: (p) => `Analisamos sua solicitação de reembolso de <strong>${p}</strong> e, neste caso, não conseguimos atender ao pedido.`,
    deniedNoteLabel: "Motivo",
    deniedFooter: "Se tiver dúvidas adicionais, responda este email — estamos à disposição.",
  },
  en: {
    receivedSubject: (p) => `Refund request received — ${p}`,
    receivedHeadline: "Request Received",
    receivedP1: (n) => `Hi ${n},`,
    receivedP2: (p) => `We received your refund request for <strong>${p}</strong>.`,
    receivedP3: "Our team will review and reply within 2 business days. Approved requests within the 7-day window are refunded to the original payment method.",
    receivedSignature: "Thanks for your patience.",
    deniedSubject: (p) => `Update on your refund request — ${p}`,
    deniedHeadline: "Request Reviewed",
    deniedP1: (n) => `Hi ${n},`,
    deniedP2: (p) => `We reviewed your refund request for <strong>${p}</strong> and could not approve it this time.`,
    deniedNoteLabel: "Reason",
    deniedFooter: "If you have further questions, reply to this email — we're here to help.",
  },
  es: {
    receivedSubject: (p) => `Solicitud de reembolso recibida — ${p}`,
    receivedHeadline: "Solicitud Recibida",
    receivedP1: (n) => `Hola ${n},`,
    receivedP2: (p) => `Recibimos tu solicitud de reembolso de <strong>${p}</strong>.`,
    receivedP3: "Nuestro equipo revisará y responderá en hasta 2 días hábiles. Las aprobaciones dentro de 7 días son reembolsadas en la forma de pago original.",
    receivedSignature: "Gracias por tu paciencia.",
    deniedSubject: (p) => `Actualización sobre tu solicitud de reembolso — ${p}`,
    deniedHeadline: "Solicitud Revisada",
    deniedP1: (n) => `Hola ${n},`,
    deniedP2: (p) => `Revisamos tu solicitud de reembolso de <strong>${p}</strong> y no podemos aprobarla en este caso.`,
    deniedNoteLabel: "Motivo",
    deniedFooter: "Si tienes más preguntas, responde este email — estamos disponibles.",
  },
};

export type RefundRequestReceivedData = {
  email: string;
  nome: string;
  productName: string;
  language: Lang;
};

export async function sendRefundRequestReceivedEmail(data: RefundRequestReceivedData): Promise<void> {
  if (!isSmtpConfigured()) return;
  const t = REFUND_COPY[data.language];
  const fromAddress = `"P.A.G.O. — Novo Tempo" <${ENV.smtpUser}>`;

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>
<div style="font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 600px; margin: 0 auto; color: #1A2744;">
  <div style="background: linear-gradient(135deg, #1A2744, #2A3A5C); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: #C8A951; margin: 0; font-size: 22px;">P.A.G.O.</h1>
    <p style="color: rgba(255,255,255,0.7); margin: 5px 0 0; font-size: 13px;">${t.receivedHeadline}</p>
  </div>
  <div style="padding: 30px; background: #FAFAF8; border: 1px solid #E8E0D4; border-top: none;">
    <p style="font-size: 16px;">${t.receivedP1(data.nome)}</p>
    <p>${t.receivedP2(data.productName)}</p>
    <p style="font-size: 14px; color: #5A4E3A;">${t.receivedP3}</p>
    <p style="margin-top: 25px;">${t.receivedSignature}</p>
  </div>
</div></body></html>`;

  await getTransporter().sendMail({
    from: fromAddress,
    to: data.email,
    subject: t.receivedSubject(data.productName),
    text: `${t.receivedP1(data.nome)}\n\n${t.receivedP2(data.productName).replace(/<[^>]+>/g, "")}\n\n${t.receivedP3}\n\n${t.receivedSignature}`,
    encoding: "utf-8",
    html,
  });
}

export type RefundRequestAdminNotificationData = {
  purchaseId: number;
  customerEmail: string;
  customerName: string;
  productName: string;
  amountCents: number;
  reason: string;
};

export async function sendRefundRequestAdminNotification(data: RefundRequestAdminNotificationData): Promise<void> {
  if (!isSmtpConfigured() || !ENV.ownerEmail) return;
  const fromAddress = `"P.A.G.O. — Alertas" <${ENV.smtpUser}>`;
  const amount = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(data.amountCents / 100);
  const escapeHtml = (s: string) => s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>
<div style="font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 600px; margin: 0 auto; color: #1A2744;">
  <div style="background: #7A3030; padding: 24px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: #fff; margin: 0; font-size: 20px;">⚠️ Solicitação de Reembolso</h1>
  </div>
  <div style="padding: 30px; background: #FAFAF8; border: 1px solid #E8E0D4; border-top: none;">
    <p>Um cliente solicitou reembolso. Decida no painel.</p>
    <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
      <tr><td style="padding: 8px 0; color: #888; width: 120px;">Cliente</td><td style="padding: 8px 0;"><strong>${escapeHtml(data.customerName)}</strong></td></tr>
      <tr><td style="padding: 8px 0; color: #888;">Email</td><td style="padding: 8px 0;">${escapeHtml(data.customerEmail)}</td></tr>
      <tr><td style="padding: 8px 0; color: #888;">Produto</td><td style="padding: 8px 0;">${escapeHtml(data.productName)}</td></tr>
      <tr><td style="padding: 8px 0; color: #888;">Valor</td><td style="padding: 8px 0;"><strong>${amount}</strong></td></tr>
    </table>
    <div style="background: #F5F0E8; border-left: 4px solid #C8A951; padding: 15px; margin: 15px 0; border-radius: 0 6px 6px 0;">
      <p style="margin: 0 0 6px; font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 0.1em;">Motivo informado</p>
      <p style="margin: 0; font-size: 14px; white-space: pre-wrap;">${escapeHtml(data.reason)}</p>
    </div>
    <div style="text-align: center; margin-top: 20px;">
      <a href="${ENV.siteUrl}/admin/compras" style="display: inline-block; background: #1A2744; color: #C8A951; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px;">ABRIR PAINEL</a>
    </div>
    <p style="font-size: 12px; color: #888; margin-top: 20px;">Purchase #${data.purchaseId}. Se aprovar, processe o reembolso no dashboard.stripe.com — o webhook atualiza o status automaticamente.</p>
  </div>
</div></body></html>`;

  await getTransporter().sendMail({
    from: fromAddress,
    to: ENV.ownerEmail,
    subject: `[AÇÃO] Reembolso solicitado: ${data.productName} — ${data.customerName}`,
    text: `Cliente: ${data.customerName} <${data.customerEmail}>\nProduto: ${data.productName}\nValor: ${amount}\n\nMotivo:\n${data.reason}\n\nAbrir: ${ENV.siteUrl}/admin/compras`,
    encoding: "utf-8",
    html,
  });
}

export type RefundDeniedData = {
  email: string;
  nome: string;
  productName: string;
  note: string;
  language: Lang;
};

export async function sendRefundDeniedEmail(data: RefundDeniedData): Promise<void> {
  if (!isSmtpConfigured()) return;
  const t = REFUND_COPY[data.language];
  const fromAddress = `"P.A.G.O. — Novo Tempo" <${ENV.smtpUser}>`;
  const escapeHtml = (s: string) => s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>
<div style="font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 600px; margin: 0 auto; color: #1A2744;">
  <div style="background: linear-gradient(135deg, #1A2744, #2A3A5C); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: #C8A951; margin: 0; font-size: 22px;">P.A.G.O.</h1>
    <p style="color: rgba(255,255,255,0.7); margin: 5px 0 0; font-size: 13px;">${t.deniedHeadline}</p>
  </div>
  <div style="padding: 30px; background: #FAFAF8; border: 1px solid #E8E0D4; border-top: none;">
    <p style="font-size: 16px;">${t.deniedP1(data.nome)}</p>
    <p>${t.deniedP2(data.productName)}</p>
    <div style="background: #F5F0E8; border-left: 4px solid #7A3030; padding: 15px; margin: 20px 0; border-radius: 0 6px 6px 0;">
      <p style="margin: 0 0 6px; font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 0.1em;">${t.deniedNoteLabel}</p>
      <p style="margin: 0; font-size: 14px; color: #1A2744; white-space: pre-wrap;">${escapeHtml(data.note)}</p>
    </div>
    <p style="font-size: 13px; color: #666; margin-top: 20px;">${t.deniedFooter}</p>
  </div>
</div></body></html>`;

  await getTransporter().sendMail({
    from: fromAddress,
    to: data.email,
    subject: t.deniedSubject(data.productName),
    text: `${t.deniedP1(data.nome)}\n\n${t.deniedP2(data.productName).replace(/<[^>]+>/g, "")}\n\n${t.deniedNoteLabel}: ${data.note}\n\n${t.deniedFooter}`,
    encoding: "utf-8",
    html,
  });
}

export type PurchaseConfirmationData = {
  email: string;
  nome: string;
  productName: string;
  nextStep: string;
};

export async function sendPurchaseConfirmationEmail(data: PurchaseConfirmationData): Promise<void> {
  if (!isSmtpConfigured()) {
    console.warn("[Notification] SMTP not configured, skipping confirmation email.");
    return;
  }
  const transporter = getTransporter();
  const fromAddress = `"P.A.G.O. — Novo Tempo" <${ENV.smtpUser}>`;

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>
<div style="font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 600px; margin: 0 auto; color: #1A2744;">
  <div style="background: linear-gradient(135deg, #1A2744, #2A3A5C); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: #C8A951; margin: 0; font-size: 24px;">P.A.G.O.</h1>
    <p style="color: rgba(255,255,255,0.7); margin: 5px 0 0; font-size: 13px;">Pagamento Confirmado</p>
  </div>
  <div style="padding: 30px; background: #FAFAF8; border: 1px solid #E8E0D4; border-top: none;">
    <p style="font-size: 16px;">Olá <strong>${data.nome}</strong>,</p>
    <p>Recebemos seu pagamento de <strong>${data.productName}</strong>. Obrigado pela confiança!</p>

    <div style="background: #F5F0E8; border-left: 4px solid #C8A951; padding: 18px; margin: 25px 0; border-radius: 0 6px 6px 0;">
      <p style="margin: 0 0 6px; font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 0.1em;">Próximo passo</p>
      <p style="margin: 0; font-size: 14px; color: #1A2744;">${data.nextStep}</p>
    </div>

    <p style="font-size: 13px; color: #666;">Se tiver qualquer dúvida, responda este email — estamos à disposição.</p>
  </div>
  <p style="text-align: center; color: #999; font-size: 10px; margin-top: 15px;">
    Pagamento processado por Stripe · metodopago.com
  </p>
</div></body></html>`;

  try {
    await transporter.sendMail({
      from: fromAddress,
      to: data.email,
      subject: `${data.productName} — Pagamento Confirmado`,
      text: `Olá ${data.nome},\n\nRecebemos seu pagamento de ${data.productName}.\n\nPróximo passo: ${data.nextStep}\n\nSe tiver qualquer dúvida, responda este email.`,
      encoding: "utf-8",
      html,
    });
    console.log(`[Notification] Confirmation email sent to ${data.email} (${data.productName})`);
  } catch (error) {
    console.error("[Notification] Confirmation email failed:", error);
    throw error;
  }
}

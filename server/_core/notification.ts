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
      html: `<div style="font-family: 'Lora', serif; color: #1A2744;">
        <h2 style="color: #B8A88A;">${title}</h2>
        <p>${content.replace(/\n/g, "<br>")}</p>
        <hr style="border-color: #E8E0D4;" />
        <small style="color: #888;">P.A.G.O. — Novo Tempo</small>
      </div>`,
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
      html: `<div style="font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 600px; margin: 0 auto; color: #1A2744;">
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
      </div>`,
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
        html: `<div style="font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 600px; margin: 0 auto; color: #1A2744;">
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
        </div>`,
      });
      console.log(`[Notification] Admin notification sent to ${ENV.ownerEmail}`);
    } catch (error) {
      console.warn("[Notification] Admin notification failed:", error);
    }
  }
}

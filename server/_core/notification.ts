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

/**
 * Sends an email notification to the project owner via SMTP.
 * Returns `true` if the email was sent, `false` on failure.
 */
export async function notifyOwner(
  payload: NotificationPayload
): Promise<boolean> {
  const { title, content } = validatePayload(payload);

  if (!ENV.smtpHost || !ENV.smtpUser || !ENV.ownerEmail) {
    console.warn("[Notification] SMTP not configured, skipping email.");
    return false;
  }

  try {
    const transporter = createTransport({
      host: ENV.smtpHost,
      port: parseInt(ENV.smtpPort, 10),
      secure: ENV.smtpPort === "465",
      auth: {
        user: ENV.smtpUser,
        pass: ENV.smtpPass,
      },
    });

    await transporter.sendMail({
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

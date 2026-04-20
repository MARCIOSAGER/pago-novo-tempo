import Stripe from "stripe";
import { nanoid } from "nanoid";
import { ENV } from "./_core/env";
import {
  createPurchase,
  getPurchaseBySessionId,
  getPurchaseByPaymentIntent,
  markPurchaseDelivered,
  markPurchaseFailed,
  markPurchaseRefunded,
  revokePurchaseToken,
} from "./db";
import { sendEbookDeliveryEmail, sendPurchaseConfirmationEmail } from "./_core/notification";

let stripeClient: Stripe | null = null;

export function getStripeClient(): Stripe {
  if (!ENV.stripeSecretKey) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  if (!stripeClient) {
    stripeClient = new Stripe(ENV.stripeSecretKey, {
      apiVersion: "2026-03-25.dahlia",
      typescript: true,
    });
  }
  return stripeClient;
}

export function isStripeConfigured(): boolean {
  return Boolean(ENV.stripeSecretKey);
}

// SEC: strip CRLF to prevent log injection (fake log lines from user-controlled fields)
const safeLog = (s: string): string => String(s).replace(/[\r\n]/g, " ").slice(0, 300);

export const DOWNLOAD_TOKEN_TTL_DAYS = 30;
export const DOWNLOAD_TOKEN_MAX_USES = 10;

type ProductSlug = "ebook" | "kit" | "mentoria";
type EbookLang = "pt" | "en" | "es";

function parseClientReferenceId(ref: string | null): { product?: ProductSlug; language?: EbookLang } {
  if (!ref) return {};
  const parts = ref.split("_");
  const product = parts[0] as ProductSlug;
  const language = (parts[1] as EbookLang) || undefined;
  if (["ebook", "kit", "mentoria"].includes(product)) {
    const out: { product: ProductSlug; language?: EbookLang } = { product };
    if (language && ["pt", "en", "es"].includes(language)) out.language = language;
    return out;
  }
  return {};
}

function extractProductSlug(session: Stripe.Checkout.Session): { slug: ProductSlug | null; language: EbookLang | null } {
  const fromRef = parseClientReferenceId(session.client_reference_id ?? null);
  if (fromRef.product) {
    return { slug: fromRef.product, language: fromRef.language ?? null };
  }
  const metadataProduct = session.metadata?.product as ProductSlug | undefined;
  if (metadataProduct && ["ebook", "kit", "mentoria"].includes(metadataProduct)) {
    return { slug: metadataProduct, language: null };
  }
  return { slug: null, language: null };
}

export async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session): Promise<void> {
  const existing = await getPurchaseBySessionId(session.id);
  if (existing && existing.status === "delivered") {
    console.log(`[Stripe] Session ${session.id} already delivered, skipping`);
    return;
  }

  const { slug, language } = extractProductSlug(session);
  if (!slug) {
    console.error(`[Stripe] Could not identify product for session ${session.id}`);
    return;
  }

  const email = session.customer_details?.email ?? session.customer_email ?? "";
  const customerName = session.customer_details?.name ?? "";
  if (!email) {
    console.error(`[Stripe] No email found for session ${session.id}`);
    return;
  }

  const finalLanguage: EbookLang | null = slug === "ebook" ? (language ?? "pt") : null;
  const downloadToken = slug === "ebook" ? nanoid(32) : null;
  const tokenExpiresAt = slug === "ebook"
    ? new Date(Date.now() + DOWNLOAD_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000)
    : null;

  const purchase = existing ?? await createPurchase({
    stripeSessionId: session.id,
    stripePaymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : null,
    email: email.toLowerCase(),
    customerName: customerName || null,
    productSlug: slug,
    language: finalLanguage,
    amountCents: session.amount_total ?? 0,
    currency: session.currency ?? "brl",
    downloadToken,
    maxDownloads: DOWNLOAD_TOKEN_MAX_USES,
    tokenExpiresAt,
    status: "pending",
    rawSession: session as unknown as Record<string, unknown>,
  });

  try {
    if (slug === "ebook" && downloadToken && tokenExpiresAt) {
      const downloadUrl = `${ENV.siteUrl}/api/purchases/download?token=${downloadToken}`;
      const refundUrl = `${ENV.siteUrl}/reembolso?session_id=${encodeURIComponent(session.id)}`;
      await sendEbookDeliveryEmail({
        email: purchase.email,
        nome: purchase.customerName || purchase.email.split("@")[0],
        downloadUrl,
        refundUrl,
        language: finalLanguage ?? "pt",
        expiresAt: tokenExpiresAt,
        maxDownloads: DOWNLOAD_TOKEN_MAX_USES,
      });
    } else if (slug === "kit") {
      await sendPurchaseConfirmationEmail({
        email: purchase.email,
        nome: purchase.customerName || purchase.email.split("@")[0],
        productName: "Kit P.A.G.O.",
        nextStep: "Entraremos em contato em até 2 dias úteis no seu email para combinar o envio dos materiais físicos.",
      });
    } else if (slug === "mentoria") {
      await sendPurchaseConfirmationEmail({
        email: purchase.email,
        nome: purchase.customerName || purchase.email.split("@")[0],
        productName: "Mentoria P.A.G.O.",
        nextStep: "Nossa equipe entrará em contato nas próximas 24h úteis no seu email para agendar a primeira sessão.",
      });
    }
    await markPurchaseDelivered(purchase.id);
  } catch (error) {
    console.error(`[Stripe] Failed to deliver purchase ${purchase.id}:`, error);
    await markPurchaseFailed(purchase.id).catch(() => {});
    throw error;
  }
}

export async function handleCheckoutSessionExpired(session: Stripe.Checkout.Session): Promise<void> {
  const existing = await getPurchaseBySessionId(session.id);
  if (existing) return; // already recorded (either completed or previously abandoned)

  const { slug, language } = extractProductSlug(session);
  if (!slug) {
    console.log(`[Stripe] Expired session ${session.id} without product — skipping`);
    return;
  }

  const email = session.customer_details?.email ?? session.customer_email ?? "";
  if (!email) {
    console.log(`[Stripe] Expired session ${session.id} without email — skipping (no recovery possible)`);
    return;
  }

  await createPurchase({
    stripeSessionId: session.id,
    stripePaymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : null,
    email: email.toLowerCase(),
    customerName: session.customer_details?.name ?? null,
    productSlug: slug,
    language: slug === "ebook" ? (language ?? "pt") : null,
    amountCents: session.amount_total ?? 0,
    currency: session.currency ?? "brl",
    downloadToken: null,
    maxDownloads: 0,
    tokenExpiresAt: null,
    status: "abandoned",
    rawSession: session as unknown as Record<string, unknown>,
  });
  console.log(`[Stripe] Recorded abandoned cart for ${safeLog(email)} (${slug})`);
}

export async function handleChargeRefunded(charge: Stripe.Charge): Promise<void> {
  const paymentIntentId = typeof charge.payment_intent === "string" ? charge.payment_intent : null;
  if (!paymentIntentId) {
    console.warn("[Stripe] charge.refunded without payment_intent");
    return;
  }
  const purchase = await getPurchaseByPaymentIntent(paymentIntentId);
  if (!purchase) {
    console.warn(`[Stripe] Refunded charge ${charge.id} not found in purchases (pi: ${paymentIntentId})`);
    return;
  }
  if (purchase.status === "refunded") return;

  await markPurchaseRefunded(purchase.id);

  if (purchase.productSlug === "ebook" && purchase.downloadToken) {
    await revokePurchaseToken(purchase.id);
    console.log(`[Stripe] Revoked ebook token for refunded purchase ${purchase.id}`);
  }
  console.log(`[Stripe] Purchase ${purchase.id} marked as refunded (${safeLog(purchase.email)})`);
}

export async function handleChargeDisputeCreated(dispute: Stripe.Dispute): Promise<void> {
  const paymentIntentId = typeof dispute.payment_intent === "string" ? dispute.payment_intent : null;
  if (!paymentIntentId) {
    console.warn("[Stripe] dispute.created without payment_intent");
    return;
  }
  const purchase = await getPurchaseByPaymentIntent(paymentIntentId);
  if (!purchase) {
    console.warn(`[Stripe] Disputed charge ${dispute.charge} not found in purchases (pi: ${paymentIntentId})`);
    return;
  }
  await markPurchaseFailed(purchase.id);
  if (purchase.productSlug === "ebook" && purchase.downloadToken) {
    await revokePurchaseToken(purchase.id);
  }
  console.log(`[Stripe] Purchase ${purchase.id} flagged as disputed (${safeLog(purchase.email)})`);
}

export function constructWebhookEvent(rawBody: Buffer, signature: string): Stripe.Event {
  if (!ENV.stripeWebhookSecret) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not configured");
  }
  const stripe = getStripeClient();
  return stripe.webhooks.constructEvent(rawBody, signature, ENV.stripeWebhookSecret);
}

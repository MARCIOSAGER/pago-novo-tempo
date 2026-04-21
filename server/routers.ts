import { z } from "zod";
import { nanoid } from "nanoid";
import { timingSafeEqual } from "node:crypto";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import {
  getSiteSetting,
  listPurchases,
  listPurchasesByEmail,
  listRefundRequests,
  createLookupToken,
  validateLookupToken,
  invalidatePriorLookupTokens,
  getPurchaseById,
  getPurchaseBySessionId,
  getPurchaseMetrics,
  regeneratePurchaseToken,
  revokePurchaseToken,
  requestPurchaseRefund,
  denyPurchaseRefund,
  writeAuditLog,
  listAuditLog,
  createInscription,
  listInscriptions,
  updateInscriptionStatus,
  getInscriptionMetrics,
  listInscriptionsFiltered,
  getInscriptionById,
  deleteInscription,
  exportAllInscriptions,
  createFileRecord,
  listFiles,
  getFileById,
  deleteFileRecord,
  getAllSiteSettings,
  upsertSiteSetting,
  createDiagnostico,
  listDiagnosticosFiltered,
  getDiagnosticoById,
  getDiagnosticoByIdLite,
  updateDiagnosticoStatus,
  deleteDiagnostico,
  exportAllDiagnosticos,
  getDiagnosticoMetrics,
  saveDiagnosticoPdf,
  createOrganization,
  listOrganizations,
  getOrganizationById,
  getOrganizationBySlug,
  updateOrganization,
  deleteOrganization,
  listOrgMembers,
  countActiveOrgMembers,
  createOrgMember,
  getOrgMemberByInviteToken,
  updateOrgMember,
  getActiveQuestionnaire,
  createCorporateDiagnostic,
  listCorporateDiagnosticsByMember,
  getCompanyAverages,
  listDiagnosticosByEmail,
  createDemoRequest,
  listDemoRequests,
  updateDemoRequestStatus,
  getDemoRequestById,
  getOrgStats,
  listAllUsersWithOrgs,
  getCorporateMetrics,
} from "./db";
import { storagePut } from "./storage";
import { honeypotCheck, validateFileUpload } from "./security";
import { TRPCError } from "@trpc/server";
import { ENV } from "./_core/env";
import { notifyInscription, sendDiagnosticEmail, sendDiagnosticEmailWithPdf, sendInviteEmail, sendDemoRequestEmail, sendDemoConfirmationEmail, sendEbookDeliveryEmail, sendPurchaseConfirmationEmail, sendRefundRequestReceivedEmail, sendRefundRequestAdminNotification, sendRefundDeniedEmail, sendRefundApprovedEmail, sendLookupLinkEmail } from "./_core/notification";
import { issueStripeRefund } from "./stripe";
import { formatRefundProtocol } from "../shared/refund";
import { createHash } from "node:crypto";
import { generateDiagnosticoPdfBase64 } from "./diagnosticoPdf";
import { computePillarSubgroups, computeWeakestSubgroupPerPillar } from "../shared/diagnostico";
import pt from "../client/src/i18n/pt";

// ─── Diagnostic Offers ──────────────────────────────────────────

type DiagnosticoOffer = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  ctaText: string;
  ctaUrl: string;
};

const DEFAULT_DIAGNOSTICO_OFFERS: DiagnosticoOffer[] = [
  {
    id: "ebook",
    title: "Ebook P.A.G.O.",
    description: "O livro completo com os 4 pilares — Princípio, Alinhamento, Governo e Obediência — e como aplicá-los na sua vida.",
    imageUrl: "",
    ctaText: "Quero o ebook",
    ctaUrl: "",
  },
  {
    id: "kit",
    title: "Kit P.A.G.O.",
    description: "Ebook + diário de prática + caderno de reflexões + guia de estudos. Tudo que você precisa para começar.",
    imageUrl: "",
    ctaText: "Ver o kit",
    ctaUrl: "",
  },
  {
    id: "mentoria",
    title: "Mentoria P.A.G.O.",
    description: "Acompanhamento individual para aprofundar os 4 pilares com aplicação no seu contexto pessoal e profissional.",
    imageUrl: "",
    ctaText: "Saber mais",
    ctaUrl: "/mentoria",
  },
];

// ─── Zod Schemas (strict input validation) ──────────────────────

const inscriptionSchema = z.object({
  name: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(255, "Nome muito longo")
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "Nome contém caracteres inválidos"),
  email: z
    .string()
    .email("Email inválido")
    .max(320, "Email muito longo")
    .toLowerCase(),
  phone: z
    .string()
    .max(30, "Telefone muito longo")
    .regex(/^[\d\s\+\-\(\)]+$/, "Telefone contém caracteres inválidos")
    .optional()
    .nullable(),
  message: z
    .string()
    .max(2000, "Mensagem muito longa (máximo 2000 caracteres)")
    .optional()
    .nullable(),
  // Honeypot field — must be empty for legitimate users
  website: z.string().optional().nullable(),
});

const updateStatusSchema = z.object({
  id: z.number().int().positive(),
  status: z.enum(["pending", "contacted", "enrolled", "rejected"]),
});

const fileUploadSchema = z.object({
  filename: z.string().min(1).max(255),
  mimeType: z.string().min(1).max(128),
  size: z.number().int().positive().max(50 * 1024 * 1024), // 50MB max
  category: z.string().max(64).optional().nullable(),
  description: z.string().max(500).optional().nullable(),
  data: z.string(), // base64 encoded file data
});

const listFilesSchema = z.object({
  category: z.string().max(64).optional(),
});

const listInscriptionsFilteredSchema = z.object({
  status: z.string().optional(),
  search: z.string().max(200).optional(),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
});

const diagnosticoSubmitSchema = z.object({
  nome: z.string().min(1).max(255),
  email: z.string().email().max(320).toLowerCase().optional().nullable(),
  answersP: z.array(z.number().min(1).max(4)).length(8),
  answersA: z.array(z.number().min(1).max(4)).length(12),
  answersG: z.array(z.number().min(1).max(4)).length(12),
  answersO: z.array(z.number().min(1).max(4)).length(12),
  mediaP: z.number().min(0).max(10),
  mediaA: z.number().min(0).max(10),
  mediaG: z.number().min(0).max(10),
  mediaO: z.number().min(0).max(10),
  mediaGeral: z.number().min(0).max(10),
  pilarMaisFraco: z.enum(["P", "A", "G", "O"]),
  sendEmail: z.boolean().default(false),
});

const listDiagnosticosFilteredSchema = z.object({
  status: z.string().optional(),
  search: z.string().max(200).optional(),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
});

// ─── Admin check middleware ─────────────────────────────────────

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Acesso restrito a administradores.",
    });
  }
  return next({ ctx });
});

/**
 * Logs an admin action to the audit log. Fire-and-forget (does not block the response).
 * Extracts IP from the request, including forwarded headers for reverse-proxy setups.
 */
function audit(ctx: { user: { id: number; email?: string | null }; req?: { ip?: string; headers?: Record<string, unknown> } },
  action: string,
  opts?: { targetType?: string; targetId?: string | number; details?: Record<string, unknown> }
): void {
  const forwarded = ctx.req?.headers?.["x-forwarded-for"];
  const ipFromHeader = typeof forwarded === "string" ? forwarded.split(",")[0].trim() : undefined;
  const ipAddress = ipFromHeader || ctx.req?.ip || undefined;
  writeAuditLog({
    actorUserId: ctx.user.id,
    actorEmail: ctx.user.email || null,
    action,
    targetType: opts?.targetType ?? null,
    targetId: opts?.targetId != null ? String(opts.targetId) : null,
    details: opts?.details ?? null,
    ipAddress: ipAddress ? ipAddress.slice(0, 64) : null,
  }).catch(() => {});
}

// ─── Umami Analytics Helper ─────────────────────────────────────

let umamiToken: string | null = null;

async function getUmamiToken(): Promise<string> {
  if (umamiToken) return umamiToken;
  const endpoint = ENV.analyticsEndpoint;
  if (!endpoint || !ENV.umamiUsername || !ENV.umamiPassword) {
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Analytics credentials not configured." });
  }
  const res = await fetch(`${endpoint}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: ENV.umamiUsername, password: ENV.umamiPassword }),
  });
  if (!res.ok) {
    console.error(`[Analytics] Umami login failed: ${res.status}`);
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Falha na autenticação com Umami." });
  }
  const data = await res.json() as { token: string };
  umamiToken = data.token;
  return umamiToken;
}

async function fetchUmami(path: string) {
  const endpoint = ENV.analyticsEndpoint;
  if (!endpoint) {
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Analytics endpoint not configured." });
  }
  const token = await getUmamiToken();
  const url = `${endpoint}${path}`;
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
  });
  if (res.status === 401) {
    umamiToken = null;
    const newToken = await getUmamiToken();
    const retry = await fetch(url, {
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${newToken}` },
    });
    if (!retry.ok) {
      console.error(`[Analytics] Umami API error: ${retry.status} ${retry.statusText}`);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao buscar dados de analytics." });
    }
    return retry.json();
  }
  if (!res.ok) {
    console.error(`[Analytics] Umami API error: ${res.status} ${res.statusText}`);
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao buscar dados de analytics." });
  }
  return res.json();
}// ─── Router ─────────────────────────────────────────────────────────────

// ─── PAGO Chatbot System Prompt ───────────────────────────────

const PAGO_SYSTEM_PROMPT = `Você é o Assistente P.A.G.O. — Novo Tempo, um chatbot especializado na metodologia P.A.G.O. criada por Jefferson Evangelista.

Sobre o P.A.G.O.:
P.A.G.O. significa: Princípio, Alinhamento, Governo e Obediência. É um sistema de reorganização de vida para pessoas que amam a Deus mas vivem desorganizadas. É uma resposta para estruturar a vida espiritual, emocional e prática.

Os 4 Pilares:
1. PRINCÍPIO (P) — Princípios acima de resultados. Prosperidade sem princípio gera queda. A vida deve ser orientada por valores imutáveis, não por ganhos temporários.
2. ALINHAMENTO (A) — Alinhamento gera autoridade. Crescimento sem estrutura gera colapso. É necessário alinhar espírito, emoção e estratégia.
3. GOVERNO (G) — Governo inicia no secreto. Governo espiritual precede crescimento financeiro. A vida de oração e intimidade com Deus é o fundamento.
4. OBEDIÊNCIA (O) — Obediência sustenta o invisível. Obediência precede autoridade. Constância vence talento, disciplina vence motivação.

Sobre Jefferson Evangelista:
Criador do P.A.G.O., empreendedor, construtor de estruturas e organizador de destinos. À frente da Interaja e múltiplas frentes empresariais. Atleta de resistência (endurance). Líder do movimento Legendários.

Produtos disponíveis:
1. DIAGNÓSTICO P.A.G.O. — Gratuito. Avaliação completa em 44 perguntas dos 4 pilares. Acesse em /diagnostico
2. EBOOK P.A.G.O. — Livro completo com a metodologia. Disponível em Português, Inglês e Espanhol. Compra via checkout seguro (Stripe), entrega imediata por email com link de download.
3. KIT P.A.G.O. — Ebook + Diário de Prática + Caderno de Reflexões + Guia de Estudos. Produto físico/digital complementar.
4. MENTORIA P.A.G.O. — Acompanhamento individual com Jefferson. Página: /mentoria
5. P.A.G.O. KIDS — Ebook adaptado para crianças 6-12 anos com os 4 pilares.

Fluxo de compra e pós-venda:
- Depois do diagnóstico, o usuário vê uma landing com os produtos à venda e pode comprar direto
- Após a compra do Ebook: recebe email com link único de download (válido 30 dias, até 10 downloads), link para solicitar reembolso, e link para consultar pedidos
- GARANTIA DE 7 DIAS: conforme CDC Art. 49, o cliente pode solicitar reembolso em até 7 dias sem justificativa. Basta acessar /reembolso (link também vem no email de entrega). Reembolso é processado em até 2 dias úteis.
- PROTOCOLO DE REEMBOLSO: toda solicitação gera um código tipo "REE-42-2026" para referência futura
- PERDEU O EMAIL? O cliente pode acessar /consultar-pedidos, digitar o email da compra e receber um link seguro (válido 30min) para ver todos os seus pedidos, baixar o ebook de novo, solicitar ou consultar reembolsos
- QUEM TEM CONTA: acessa /minhas-compras direto pelo menu do topo (avatar → Minhas Compras)

Links úteis para compartilhar quando apropriado:
- Diagnóstico gratuito: /diagnostico
- Mentoria: /mentoria
- Consultar pedidos (sem conta): /consultar-pedidos
- Solicitar reembolso: /reembolso (precisa do session_id que veio no email)
- Minhas compras (com conta): /minhas-compras

Regras:
- Responda SEMPRE em português brasileiro (a menos que o usuário fale em inglês ou espanhol)
- Seja acolhedor, respeitoso e profundo
- Use linguagem que equilibre espiritualidade com praticidade
- Se o usuário perguntar sobre problemas de pagamento, entrega, reembolso ou acesso a pedidos, SEMPRE forneça o link /consultar-pedidos ou /reembolso conforme o caso
- Não invente informações — se não souber, oriente o usuário a se inscrever na mentoria ou consultar pedidos
- Mantenha respostas concisas (máximo 3 parágrafos)
- Não faça proselitismo agressivo — seja subliminar e elegante
- Se perguntado sobre preços ou valores específicos, oriente a acessar /diagnostico (onde verá os produtos) ou /mentoria
- Nunca peça dados pessoais sensíveis (senha, cartão, CPF). Se precisar, oriente a usar os canais oficiais (checkout Stripe, /reembolso com session_id, /consultar-pedidos com email)
`;

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ─── Mentoria Inscriptions ──────────────────────────────────
  mentoria: router({
    // Public: anyone can submit an inscription
    submit: publicProcedure
      .input(inscriptionSchema)
      .mutation(async ({ input }) => {
        // Honeypot check — bots fill hidden fields
        if (honeypotCheck(input.website)) {
          // Silently accept but don't save (don't reveal to bots)
          console.warn("[SECURITY] Honeypot triggered — bot submission blocked");
          return { success: true, message: "Inscrição recebida com sucesso!" };
        }

        await createInscription({
          name: input.name,
          email: input.email,
          phone: input.phone ?? null,
          message: input.message ?? null,
        });

        // Fire-and-forget: send confirmation + admin notification emails
        notifyInscription({
          name: input.name,
          email: input.email,
          phone: input.phone,
          message: input.message,
        }).catch((err) => console.warn("[Notification] Inscription email error:", err));

        return { success: true, message: "Inscrição recebida com sucesso!" };
      }),

    // Admin: list all inscriptions (simple, backwards compat)
    list: adminProcedure.query(async () => {
      return listInscriptions();
    }),

    // Admin: update inscription status
    updateStatus: adminProcedure
      .input(updateStatusSchema)
      .mutation(async ({ input }) => {
        await updateInscriptionStatus(input.id, input.status);
        return { success: true };
      }),

    // Admin: dashboard metrics
    metrics: adminProcedure.query(async () => {
      return getInscriptionMetrics();
    }),

    // Admin: filtered & paginated list
    listFiltered: adminProcedure
      .input(listInscriptionsFilteredSchema)
      .query(async ({ input }) => {
        return listInscriptionsFiltered({
          status: input.status,
          search: input.search,
          page: input.page,
          pageSize: input.pageSize,
        });
      }),

    // Admin: get single inscription by ID
    getById: adminProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .query(async ({ input }) => {
        const inscription = await getInscriptionById(input.id);
        if (!inscription) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Inscrição não encontrada." });
        }
        return inscription;
      }),

    // Admin: delete inscription
    delete: adminProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ input }) => {
        const inscription = await getInscriptionById(input.id);
        if (!inscription) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Inscrição não encontrada." });
        }
        await deleteInscription(input.id);
        return { success: true };
      }),

    // Admin: export all inscriptions for CSV
    export: adminProcedure.query(async () => {
      return exportAllInscriptions();
    }),
  }),

  // ─── Chatbot P.A.G.O. ──────────────────────────────────────
  chat: router({
    sendMessage: publicProcedure
      .input(z.object({ message: z.string().min(1).max(2000) }))
      .mutation(async ({ input }) => {
        try {
          const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${ENV.openaiApiKey}`,
            },
            body: JSON.stringify({
              model: "gpt-4o",
              messages: [
                { role: "system", content: PAGO_SYSTEM_PROMPT },
                { role: "user", content: input.message },
              ],
              max_tokens: 500,
              temperature: 0.7,
            }),
          });

          if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.status}`);
          }

          const data = await response.json() as { choices: Array<{ message: { content: string } }> };
          const reply = data.choices?.[0]?.message?.content || "Desculpe, não consegui processar sua pergunta.";

          return { reply };
        } catch (error) {
          console.error("[Chat] Error:", error);
          return {
            reply: "Desculpe, estou com dificuldades técnicas no momento. Por favor, tente novamente em alguns instantes ou utilize o formulário de inscrição para entrar em contato.",
          };
        }
      }),
  }),

  // ─── File Storage ───────────────────────────────────────────
  files: router({
    // Protected: upload a file to S3
    upload: protectedProcedure
      .input(fileUploadSchema)
      .mutation(async ({ input, ctx }) => {
        // Validate file
        const validation = validateFileUpload(input.filename, input.mimeType, input.size);
        if (!validation.valid) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: validation.error || "Arquivo inválido.",
          });
        }

        // Generate unique key to prevent enumeration
        const suffix = nanoid(12);
        const safeFilename = input.filename.replace(/[^a-zA-Z0-9._-]/g, "_");
        const fileKey = `pago-files/${ctx.user.id}/${suffix}-${safeFilename}`;

        // Decode base64 and upload to S3
        const buffer = Buffer.from(input.data, "base64");
        const { url } = await storagePut(fileKey, buffer, input.mimeType);

        // Save metadata to database
        await createFileRecord({
          fileKey,
          url,
          filename: input.filename,
          mimeType: input.mimeType,
          size: input.size,
          category: input.category ?? null,
          description: input.description ?? null,
          uploadedBy: ctx.user.id,
        });

        return { success: true, url, fileKey };
      }),

    // Protected: list files
    list: protectedProcedure
      .input(listFilesSchema.optional())
      .query(async ({ input }) => {
        return listFiles(input?.category);
      }),

    // Protected: get file by ID
    getById: protectedProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .query(async ({ input }) => {
        const file = await getFileById(input.id);
        if (!file) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Arquivo não encontrado." });
        }
        return file;
      }),

    // Admin: delete a file
    delete: adminProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ input }) => {
        const file = await getFileById(input.id);
        if (!file) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Arquivo não encontrado." });
        }
        await deleteFileRecord(input.id);
        return { success: true };
      }),
  }),

  // ─── Site Settings (dynamic images) ────────────────────────
  siteSettings: router({
    // Public: get all site image URLs
    getImages: publicProcedure.query(async () => {
      const settings = await getAllSiteSettings();
      const imageMap: Record<string, string> = {};
      for (const s of settings) {
        if (s.key.startsWith("image.")) {
          imageMap[s.key] = s.value;
        }
      }
      return imageMap;
    }),

    // Admin: upload a new image and save its URL
    updateImage: adminProcedure
      .input(
        z.object({
          key: z.string().min(1).max(128).regex(/^image\./),
          filename: z.string().min(1).max(255),
          mimeType: z.string().min(1).max(128),
          data: z.string(), // base64
        })
      )
      .mutation(async ({ input, ctx }) => {
        // Validate it's an image
        const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
        if (!allowedTypes.includes(input.mimeType)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Tipo de arquivo não permitido. Use JPEG, PNG, WebP ou GIF.",
          });
        }

        const buffer = Buffer.from(input.data, "base64");
        const suffix = nanoid(12);
        const safeFilename = input.filename.replace(/[^a-zA-Z0-9._-]/g, "_");
        const fileKey = `pago-site/${input.key.replace(/\./g, "/")}/${suffix}-${safeFilename}`;

        const { url } = await storagePut(fileKey, buffer, input.mimeType);
        await upsertSiteSetting(input.key, url);

        return { success: true, url };
      }),

    // Public: get all site link URLs
    getLinks: publicProcedure.query(async () => {
      const settings = await getAllSiteSettings();
      const linkMap: Record<string, string> = {};
      for (const s of settings) {
        if (s.key.startsWith("link.")) {
          linkMap[s.key] = s.value;
        }
      }
      return linkMap;
    }),

    // Admin: update a link URL
    updateLink: adminProcedure
      .input(
        z.object({
          key: z.string().min(1).max(128).regex(/^link\./),
          value: z.string().min(1).max(2048),
        })
      )
      .mutation(async ({ input }) => {
        await upsertSiteSetting(input.key, input.value);
        return { success: true };
      }),
  }),

  // ─── Diagnostico P.A.G.O. ─────────────────────────────────
  diagnostico: router({
    // Public: submit diagnostic results
    submit: publicProcedure
      .input(diagnosticoSubmitSchema)
      .mutation(async ({ input }) => {
        await createDiagnostico({
          nome: input.nome,
          email: input.email ?? null,
          answersP: input.answersP,
          answersA: input.answersA,
          answersG: input.answersG,
          answersO: input.answersO,
          mediaP: input.mediaP,
          mediaA: input.mediaA,
          mediaG: input.mediaG,
          mediaO: input.mediaO,
          mediaGeral: input.mediaGeral,
          pilarMaisFraco: input.pilarMaisFraco,
        });

        // Send email if requested and email provided
        if (input.sendEmail && input.email) {
          sendDiagnosticEmail({
            nome: input.nome,
            email: input.email,
            mediaP: input.mediaP,
            mediaA: input.mediaA,
            mediaG: input.mediaG,
            mediaO: input.mediaO,
            mediaGeral: input.mediaGeral,
            pilarMaisFraco: input.pilarMaisFraco,
          }).catch((err) => console.warn("[Notification] Diagnostic email error:", err));
        }

        return { success: true };
      }),

    // Public: send diagnostic email with PDF attachment
    sendEmailWithPdf: publicProcedure
      .input(z.object({
        nome: z.string().min(1).max(255),
        email: z.string().email().max(320).toLowerCase(),
        mediaGeral: z.number().min(0).max(10),
        pilarMaisFraco: z.enum(["P", "A", "G", "O"]),
        mediaP: z.number().min(0).max(10),
        mediaA: z.number().min(0).max(10),
        mediaG: z.number().min(0).max(10),
        mediaO: z.number().min(0).max(10),
        pdfBase64: z.string().min(1).max(5_000_000), // ~3.7MB PDF max
      }))
      .mutation(async ({ input }) => {
        // Save PDF to database for admin resend
        await saveDiagnosticoPdf(input.nome, input.mediaGeral, input.email, input.pdfBase64);

        await sendDiagnosticEmailWithPdf({
          nome: input.nome,
          email: input.email,
          mediaP: input.mediaP,
          mediaA: input.mediaA,
          mediaG: input.mediaG,
          mediaO: input.mediaO,
          mediaGeral: input.mediaGeral,
          pilarMaisFraco: input.pilarMaisFraco,
          pdfBase64: input.pdfBase64,
        });
        return { success: true };
      }),

    // Public: generate PDF on server and return base64
    generatePdf: publicProcedure
      .input(z.object({
        nome: z.string().min(1).max(255),
        pillarAverages: z.object({
          P: z.number().min(0).max(10),
          A: z.number().min(0).max(10),
          G: z.number().min(0).max(10),
          O: z.number().min(0).max(10),
        }),
        overallAverage: z.number().min(0).max(10),
        weakestPillar: z.enum(["P", "A", "G", "O"]),
        pillarSubgroups: z.object({
          A: z.object({ vertical: z.number(), horizontal: z.number(), internal: z.number() }),
          G: z.object({ spiritual: z.number(), emotional: z.number(), financial: z.number(), temporal: z.number() }),
          O: z.object({ basic: z.number(), radical: z.number(), fruit: z.number() }),
        }),
        weakestSubgroupPerPillar: z.object({
          P: z.string().nullable(),
          A: z.string().nullable(),
          G: z.string().nullable(),
          O: z.string().nullable(),
        }),
        t: z.any(),
      }))
      .mutation(async ({ input }) => {
        const pdfBase64 = await generateDiagnosticoPdfBase64(input);
        return { pdfBase64 };
      }),

    // Public: get evolution history by email
    history: publicProcedure
      .input(z.object({
        email: z.string().email().max(320).toLowerCase(),
      }))
      .query(async ({ input }) => {
        const items = await listDiagnosticosByEmail(input.email);
        return { items };
      }),

    // Admin: filtered & paginated list
    listFiltered: adminProcedure
      .input(listDiagnosticosFilteredSchema)
      .query(async ({ input }) => {
        return listDiagnosticosFiltered({
          status: input.status,
          search: input.search,
          page: input.page,
          pageSize: input.pageSize,
        });
      }),

    // Admin: get single diagnostic by ID (without heavy pdfBase64)
    getById: adminProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .query(async ({ input }) => {
        const result = await getDiagnosticoByIdLite(input.id);
        if (!result) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Diagnóstico não encontrado." });
        }
        return result;
      }),

    // Admin: update diagnostic status
    updateStatus: adminProcedure
      .input(z.object({
        id: z.number().int().positive(),
        status: z.enum(["new", "reviewed", "archived"]),
      }))
      .mutation(async ({ input, ctx }) => {
        await updateDiagnosticoStatus(input.id, input.status);
        audit(ctx, "diagnostico.updateStatus", {
          targetType: "diagnostico",
          targetId: input.id,
          details: { status: input.status },
        });
        return { success: true };
      }),

    // Admin: delete diagnostic
    delete: adminProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ input, ctx }) => {
        const result = await getDiagnosticoById(input.id);
        if (!result) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Diagnóstico não encontrado." });
        }
        await deleteDiagnostico(input.id);
        audit(ctx, "diagnostico.delete", {
          targetType: "diagnostico",
          targetId: input.id,
          details: { nome: result.nome, email: result.email },
        });
        return { success: true };
      }),

    // Admin: send/resend diagnostic email (always generates PDF on-demand)
    sendEmail: adminProcedure
      .input(z.object({
        id: z.number().int().positive(),
        email: z.string().email().max(320).toLowerCase(),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await getDiagnosticoById(input.id);
        if (!result) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Diagnóstico não encontrado." });
        }
        const emailData = {
          nome: result.nome,
          email: input.email,
          mediaP: result.mediaP,
          mediaA: result.mediaA,
          mediaG: result.mediaG,
          mediaO: result.mediaO,
          mediaGeral: result.mediaGeral,
          pilarMaisFraco: result.pilarMaisFraco,
        };

        // Use saved PDF if available, otherwise generate on-demand
        let pdfBase64 = result.pdfBase64;
        if (!pdfBase64) {
          const subgroups = computePillarSubgroups(
            result.answersA as number[],
            result.answersG as number[],
            result.answersO as number[],
          );
          const weakestSubs = computeWeakestSubgroupPerPillar(subgroups);
          pdfBase64 = await generateDiagnosticoPdfBase64({
            nome: result.nome,
            pillarAverages: { P: result.mediaP, A: result.mediaA, G: result.mediaG, O: result.mediaO },
            overallAverage: result.mediaGeral,
            weakestPillar: result.pilarMaisFraco as "P" | "A" | "G" | "O",
            pillarSubgroups: subgroups,
            weakestSubgroupPerPillar: weakestSubs,
            t: { diagnostico: pt.diagnostico },
          });
        }

        await sendDiagnosticEmailWithPdf({ ...emailData, pdfBase64 });
        audit(ctx, "diagnostico.sendEmail", {
          targetType: "diagnostico",
          targetId: input.id,
          details: { recipientEmail: input.email },
        });
        return { success: true };
      }),

    // Admin: download PDF (uses saved PDF if available, otherwise generates on-demand)
    getPdf: adminProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ input }) => {
        const result = await getDiagnosticoById(input.id);
        if (!result) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Diagnóstico não encontrado." });
        }

        let pdfBase64 = result.pdfBase64;
        if (!pdfBase64) {
          const subgroups = computePillarSubgroups(
            result.answersA as number[],
            result.answersG as number[],
            result.answersO as number[],
          );
          const weakestSubs = computeWeakestSubgroupPerPillar(subgroups);
          pdfBase64 = await generateDiagnosticoPdfBase64({
            nome: result.nome,
            pillarAverages: { P: result.mediaP, A: result.mediaA, G: result.mediaG, O: result.mediaO },
            overallAverage: result.mediaGeral,
            weakestPillar: result.pilarMaisFraco as "P" | "A" | "G" | "O",
            pillarSubgroups: subgroups,
            weakestSubgroupPerPillar: weakestSubs,
            t: { diagnostico: pt.diagnostico },
          });
        }

        const filename = `diagnostico-${result.nome.replace(/\s+/g, "-")}-${result.id}.pdf`;
        return { pdfBase64, filename };
      }),

    // Admin: bulk delete diagnostics
    bulkDelete: adminProcedure
      .input(z.object({ ids: z.array(z.number().int().positive()).min(1).max(100) }))
      .mutation(async ({ input, ctx }) => {
        for (const id of input.ids) {
          await deleteDiagnostico(id);
        }
        audit(ctx, "diagnostico.bulkDelete", {
          targetType: "diagnostico",
          targetId: `[${input.ids.length} ids]`,
          details: { count: input.ids.length, ids: input.ids },
        });
        return { success: true, deleted: input.ids.length };
      }),

    // Admin: export all diagnostics for CSV
    export: adminProcedure.query(async () => {
      return exportAllDiagnosticos();
    }),

    // Admin: dashboard metrics
    metrics: adminProcedure.query(async () => {
      return getDiagnosticoMetrics();
    }),
  }),

  // ─── Admin Audit Log ────────────────────────────────────────
  audit: router({
    list: adminProcedure
      .input(z.object({
        page: z.number().int().min(1).default(1),
        pageSize: z.number().int().min(1).max(200).default(50),
        action: z.string().max(64).optional(),
        actorUserId: z.number().int().positive().optional(),
        targetType: z.string().max(32).optional(),
      }))
      .query(async ({ input }) => {
        return listAuditLog(input);
      }),
  }),

  // ─── Purchases (Stripe-backed orders) ──────────────────────
  purchases: router({
    // Admin: list purchases with filters.
    // SEC: strip rawSession (full Stripe session JSON) and downloadToken (live ebook token)
    // before returning — defense-in-depth if admin session is compromised.
    list: adminProcedure
      .input(z.object({
        page: z.number().int().min(1).default(1),
        pageSize: z.number().int().min(1).max(200).default(50),
        productSlug: z.string().max(64).optional(),
        status: z.enum(["pending", "delivered", "failed", "refunded", "abandoned"]).optional(),
      }))
      .query(async ({ input }) => {
        const { rows, total } = await listPurchases(input);
        const sanitized = rows.map(({ rawSession, downloadToken, ...rest }) => ({
          ...rest,
          hasDownloadToken: Boolean(downloadToken),
        }));
        return { rows: sanitized, total };
      }),

    // Admin: aggregated metrics (respects optional filters)
    metrics: adminProcedure
      .input(z.object({
        productSlug: z.string().max(64).optional(),
        status: z.enum(["pending", "delivered", "failed", "refunded", "abandoned"]).optional(),
      }))
      .query(async ({ input }) => {
        return getPurchaseMetrics(input);
      }),

    // Admin: get single purchase.
    // SEC: strip rawSession and downloadToken (defense-in-depth).
    getById: adminProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .query(async ({ input }) => {
        const row = await getPurchaseById(input.id);
        if (!row) throw new TRPCError({ code: "NOT_FOUND", message: "Compra não encontrada." });
        const { rawSession: _rs, downloadToken, ...rest } = row;
        return { ...rest, hasDownloadToken: Boolean(downloadToken) };
      }),

    // Admin: resend delivery email (regenerates token for ebook)
    resend: adminProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ input, ctx }) => {
        const purchase = await getPurchaseById(input.id);
        if (!purchase) throw new TRPCError({ code: "NOT_FOUND", message: "Compra não encontrada." });

        if (purchase.productSlug === "ebook") {
          const newToken = nanoid(32);
          const newExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
          await regeneratePurchaseToken(purchase.id, newToken, newExpiresAt);
          const downloadUrl = `${ENV.siteUrl}/api/purchases/download?token=${newToken}`;
          const refundUrl = `${ENV.siteUrl}/reembolso?session_id=${encodeURIComponent(purchase.stripeSessionId)}`;
          await sendEbookDeliveryEmail({
            email: purchase.email,
            nome: purchase.customerName || purchase.email.split("@")[0],
            downloadUrl,
            refundUrl,
            language: (purchase.language as "pt" | "en" | "es") || "pt",
            expiresAt: newExpiresAt,
            maxDownloads: purchase.maxDownloads,
          });
        } else {
          const productName = purchase.productSlug === "kit" ? "Kit P.A.G.O." : "Mentoria P.A.G.O.";
          const nextStep = purchase.productSlug === "kit"
            ? "Entraremos em contato em até 2 dias úteis no seu email para combinar o envio dos materiais físicos."
            : "Nossa equipe entrará em contato nas próximas 24h úteis no seu email para agendar a primeira sessão.";
          await sendPurchaseConfirmationEmail({
            email: purchase.email,
            nome: purchase.customerName || purchase.email.split("@")[0],
            productName,
            nextStep,
          });
        }
        audit(ctx, "purchase.resend", {
          targetType: "purchase",
          targetId: purchase.id,
          details: { productSlug: purchase.productSlug, email: purchase.email },
        });
        return { success: true };
      }),

    // Admin: revoke download token (ebook only)
    revokeToken: adminProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ input, ctx }) => {
        const purchase = await getPurchaseById(input.id);
        if (!purchase) throw new TRPCError({ code: "NOT_FOUND", message: "Compra não encontrada." });
        if (purchase.productSlug !== "ebook") {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Apenas compras de ebook têm token." });
        }
        await revokePurchaseToken(purchase.id);
        audit(ctx, "purchase.revokeToken", {
          targetType: "purchase",
          targetId: purchase.id,
          details: { email: purchase.email },
        });
        return { success: true };
      }),

    // Authenticated: list purchases for the current user (by ctx.user.email)
    listMine: protectedProcedure.query(async ({ ctx }) => {
      const email = ctx.user.email;
      if (!email) return [];
      const rows = await listPurchasesByEmail(email);
      // Hide abandoned from customer view (they don't need to see their own abandonments)
      // and strip sensitive fields (token, rawSession)
      return rows
        .filter(r => r.status !== "abandoned")
        .map(r => ({
          id: r.id,
          stripeSessionId: r.stripeSessionId,
          productSlug: r.productSlug,
          language: r.language,
          amountCents: r.amountCents,
          currency: r.currency,
          status: r.status,
          downloadCount: r.downloadCount,
          maxDownloads: r.maxDownloads,
          tokenExpiresAt: r.tokenExpiresAt,
          tokenActive: Boolean(r.downloadToken),
          refundRequestedAt: r.refundRequestedAt,
          refundDeniedAt: r.refundDeniedAt,
          createdAt: r.createdAt,
          deliveredAt: r.deliveredAt,
        }));
    }),

    // Authenticated: reissue the ebook download token for one of the user's own purchases
    reissueMyDownload: protectedProcedure
      .input(z.object({ purchaseId: z.number().int().positive() }))
      .mutation(async ({ input, ctx }) => {
        const email = ctx.user.email;
        if (!email) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Email da conta não disponível." });
        }
        const purchase = await getPurchaseById(input.purchaseId);
        if (!purchase) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Compra não encontrada." });
        }
        // Ownership check: compare emails case-insensitively
        if (purchase.email.toLowerCase() !== email.toLowerCase()) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Esta compra não é sua." });
        }
        if (purchase.productSlug !== "ebook") {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Apenas ebook tem download." });
        }
        if (purchase.status !== "delivered") {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Esta compra não está disponível para download." });
        }

        const newToken = nanoid(32);
        const newExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        await regeneratePurchaseToken(purchase.id, newToken, newExpiresAt);

        const downloadUrl = `${ENV.siteUrl}/api/purchases/download?token=${newToken}`;
        return { downloadUrl };
      }),

    // Public: request a magic-link email to consult orders (anonymous customers).
    // Always returns success to prevent email enumeration. Invalidates prior unused
    // tokens for the email before issuing a new one.
    sendLookupLink: publicProcedure
      .input(z.object({ email: z.string().email().max(320) }))
      .mutation(async ({ input }) => {
        const emailLower = input.email.trim().toLowerCase();
        // Only send link if the email has at least one non-abandoned purchase
        const purchases = await listPurchasesByEmail(emailLower);
        const hasPurchases = purchases.some(p => p.status !== "abandoned");
        if (hasPurchases) {
          await invalidatePriorLookupTokens(emailLower);
          const rawToken = nanoid(32);
          const tokenHash = createHash("sha256").update(rawToken).digest("hex");
          const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 min
          await createLookupToken(emailLower, tokenHash, expiresAt);
          const linkUrl = `${ENV.siteUrl}/meus-pedidos/${rawToken}`;
          try {
            await sendLookupLinkEmail({ email: emailLower, linkUrl, expiresInMinutes: 30 });
          } catch (e) {
            console.warn("[LookupLink] email send failed:", (e as Error).message);
          }
        }
        // Always return success regardless of whether email exists (anti-enumeration)
        return { success: true };
      }),

    // Public: consume a magic-link token and return the user's purchases.
    // Token is single-use and atomic (consumed even if multiple tabs are open).
    consumeLookupToken: publicProcedure
      .input(z.object({ token: z.string().regex(/^[A-Za-z0-9_-]{32}$/) }))
      .mutation(async ({ input }) => {
        const tokenHash = createHash("sha256").update(input.token).digest("hex");
        const consumed = await validateLookupToken(tokenHash);
        if (!consumed) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Link inválido ou expirado." });
        }
        const rows = await listPurchasesByEmail(consumed.emailLower);
        return {
          email: consumed.emailLower,
          purchases: rows
            .filter(r => r.status !== "abandoned")
            .map(r => ({
              id: r.id,
              stripeSessionId: r.stripeSessionId,
              productSlug: r.productSlug,
              language: r.language,
              amountCents: r.amountCents,
              currency: r.currency,
              status: r.status,
              downloadCount: r.downloadCount,
              maxDownloads: r.maxDownloads,
              tokenActive: Boolean(r.downloadToken),
              refundRequestedAt: r.refundRequestedAt,
              refundDeniedAt: r.refundDeniedAt,
              createdAt: r.createdAt,
              deliveredAt: r.deliveredAt,
            })),
        };
      }),

    // Public: anonymous download re-issue via lookup-token session (client re-sends token + purchase id).
    // Used when the /meus-pedidos page wants to give the user a fresh ebook download link.
    reissueAnonymousDownload: publicProcedure
      .input(z.object({
        token: z.string().regex(/^[A-Za-z0-9_-]{32}$/),
        purchaseId: z.number().int().positive(),
      }))
      .mutation(async ({ input }) => {
        const tokenHash = createHash("sha256").update(input.token).digest("hex");
        const purchase = await getPurchaseById(input.purchaseId);
        if (!purchase || purchase.productSlug !== "ebook" || purchase.status !== "delivered") {
          throw new TRPCError({ code: "NOT_FOUND", message: "Download indisponível." });
        }
        const session = await validateLookupToken(tokenHash);
        if (!session || session.emailLower !== purchase.email.toLowerCase()) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Token inválido para este pedido." });
        }

        const newToken = nanoid(32);
        const newExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        await regeneratePurchaseToken(purchase.id, newToken, newExpiresAt);
        const downloadUrl = `${ENV.siteUrl}/api/purchases/download?token=${newToken}`;
        return { downloadUrl };
      }),

    // Public: lookup purchase by session_id + email (for /reembolso page).
    // Requires email to prevent session_id enumeration PII leakage. Timing-safe compare.
    lookupBySession: publicProcedure
      .input(z.object({
        sessionId: z.string().min(1).max(255),
        email: z.string().email().max(320).optional(),
      }))
      .query(async ({ input }) => {
        const purchase = await getPurchaseBySessionId(input.sessionId);
        // Always return NOT_FOUND for both missing and email-mismatch to avoid enumeration oracle.
        if (!purchase) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Compra não encontrada." });
        }
        if (input.email) {
          const storedBuf = Buffer.from(purchase.email.toLowerCase());
          const providedBuf = Buffer.from(input.email.trim().toLowerCase());
          const match = storedBuf.length === providedBuf.length
            && timingSafeEqual(storedBuf, providedBuf);
          if (!match) {
            throw new TRPCError({ code: "NOT_FOUND", message: "Compra não encontrada." });
          }
        } else {
          // If no email provided, expose only NON-PII purchase meta (to allow the page to render the
          // "enter your email to continue" prompt without leaking buyer identity).
          return {
            id: purchase.id,
            email: null,
            customerName: null,
            productSlug: purchase.productSlug,
            language: purchase.language,
            amountCents: purchase.amountCents,
            currency: purchase.currency,
            status: purchase.status,
            createdAt: purchase.createdAt,
            refundRequestedAt: purchase.refundRequestedAt,
            refundDeniedAt: purchase.refundDeniedAt,
            requiresEmail: true,
          } as const;
        }
        return {
          id: purchase.id,
          email: purchase.email,
          customerName: purchase.customerName,
          productSlug: purchase.productSlug,
          language: purchase.language,
          amountCents: purchase.amountCents,
          currency: purchase.currency,
          status: purchase.status,
          createdAt: purchase.createdAt,
          refundRequestedAt: purchase.refundRequestedAt,
          refundDeniedAt: purchase.refundDeniedAt,
          requiresEmail: false,
        } as const;
      }),

    // Public: submit refund request (identified by session_id + email match)
    requestRefund: publicProcedure
      .input(z.object({
        sessionId: z.string().min(1).max(255),
        email: z.string().email().max(320),
        reason: z.string().min(5).max(2000),
      }))
      .mutation(async ({ input }) => {
        const purchase = await getPurchaseBySessionId(input.sessionId);
        // Generic NOT_FOUND for both cases to avoid oracle
        if (!purchase) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Compra não encontrada." });
        }
        const storedBuf = Buffer.from(purchase.email.toLowerCase());
        const providedBuf = Buffer.from(input.email.trim().toLowerCase());
        const emailMatches = storedBuf.length === providedBuf.length
          && timingSafeEqual(storedBuf, providedBuf);
        if (!emailMatches) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Compra não encontrada." });
        }
        if (purchase.status === "refunded") {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Esta compra já foi reembolsada." });
        }
        if (purchase.status === "abandoned") {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Esta compra não foi concluída." });
        }
        if (purchase.refundRequestedAt && !purchase.refundDeniedAt) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Solicitação de reembolso já registrada. Aguarde retorno." });
        }
        // 7-day window per Brazilian CDC Art. 49
        const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
        const elapsedMs = Date.now() - new Date(purchase.createdAt).getTime();
        if (elapsedMs > sevenDaysMs) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "O prazo de 7 dias para reembolso sem justificativa expirou. Entre em contato pelo email para casos especiais." });
        }

        await requestPurchaseRefund(purchase.id, input.reason);

        // Send confirmation to customer + notification to admin (best-effort; don't block response)
        const lang = (purchase.language as "pt" | "en" | "es") || "pt";
        const productLabels: Record<string, string> = { ebook: "Ebook P.A.G.O.", kit: "Kit P.A.G.O.", mentoria: "Mentoria P.A.G.O." };
        const customerName = purchase.customerName || purchase.email.split("@")[0];
        const productName = productLabels[purchase.productSlug] || purchase.productSlug;

        const protocol = formatRefundProtocol(purchase.id, purchase.createdAt);
        try {
          await sendRefundRequestReceivedEmail({
            email: purchase.email,
            nome: customerName,
            productName,
            protocol,
            language: lang,
          });
        } catch (e) {
          console.warn("[Refund] customer confirmation email failed:", e);
        }
        try {
          await sendRefundRequestAdminNotification({
            purchaseId: purchase.id,
            customerEmail: purchase.email,
            customerName,
            productName,
            amountCents: purchase.amountCents,
            reason: input.reason,
          });
        } catch (e) {
          console.warn("[Refund] admin notification email failed:", e);
        }

        return { success: true, protocol };
      }),

    // Admin: deny a refund request
    denyRefund: adminProcedure
      .input(z.object({
        id: z.number().int().positive(),
        note: z.string().min(5).max(2000),
      }))
      .mutation(async ({ input, ctx }) => {
        const purchase = await getPurchaseById(input.id);
        if (!purchase) throw new TRPCError({ code: "NOT_FOUND", message: "Compra não encontrada." });
        if (!purchase.refundRequestedAt) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Esta compra não tem solicitação de reembolso." });
        }
        if (purchase.status === "refunded") {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Esta compra já foi reembolsada." });
        }
        await denyPurchaseRefund(purchase.id, input.note);

        const protocol = formatRefundProtocol(purchase.id, purchase.createdAt);
        try {
          const lang = (purchase.language as "pt" | "en" | "es") || "pt";
          const productLabels: Record<string, string> = { ebook: "Ebook P.A.G.O.", kit: "Kit P.A.G.O.", mentoria: "Mentoria P.A.G.O." };
          await sendRefundDeniedEmail({
            email: purchase.email,
            nome: purchase.customerName || purchase.email.split("@")[0],
            productName: productLabels[purchase.productSlug] || purchase.productSlug,
            note: input.note,
            protocol,
            language: lang,
          });
        } catch (e) {
          console.warn("[Refund] denial email failed:", e);
        }
        audit(ctx, "refund.deny", {
          targetType: "purchase",
          targetId: purchase.id,
          details: { email: purchase.email, note: input.note, protocol },
        });
        return { success: true };
      }),

    // Admin: list refund requests by tab (pending/approved/denied)
    listRefunds: adminProcedure
      .input(z.object({
        tab: z.enum(["pending", "approved", "denied"]),
        page: z.number().int().min(1).default(1),
        pageSize: z.number().int().min(1).max(200).default(50),
      }))
      .query(async ({ input }) => {
        const { rows, total } = await listRefundRequests(input);
        const sanitized = rows.map(({ rawSession, downloadToken, ...rest }) => ({
          ...rest,
          protocol: formatRefundProtocol(rest.id, rest.createdAt),
        }));
        return { rows: sanitized, total };
      }),

    // Admin: approve a refund request (executes refund via Stripe API).
    // Webhook charge.refunded will later mark purchase.status=refunded and revoke token (idempotent).
    approveRefund: adminProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ input, ctx }) => {
        const purchase = await getPurchaseById(input.id);
        if (!purchase) throw new TRPCError({ code: "NOT_FOUND", message: "Compra não encontrada." });
        if (purchase.status === "refunded") {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Esta compra já foi reembolsada." });
        }
        if (purchase.status === "abandoned") {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Compra abandonada não pode ser reembolsada." });
        }
        if (!purchase.stripePaymentIntentId) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Esta compra não tem payment_intent — reembolso não pode ser processado." });
        }

        const protocol = formatRefundProtocol(purchase.id, purchase.createdAt);
        let refundId: string;
        try {
          const result = await issueStripeRefund({
            paymentIntentId: purchase.stripePaymentIntentId,
            metadata: { purchaseId: String(purchase.id), protocol },
          });
          refundId = result.refundId;
        } catch (e) {
          console.error("[Refund] Stripe refund failed:", (e as Error).message);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Falha no Stripe: ${(e as Error).message}`,
          });
        }

        // Send approval email (best-effort; don't block if it fails)
        try {
          const lang = (purchase.language as "pt" | "en" | "es") || "pt";
          const productLabels: Record<string, string> = { ebook: "Ebook P.A.G.O.", kit: "Kit P.A.G.O.", mentoria: "Mentoria P.A.G.O." };
          await sendRefundApprovedEmail({
            email: purchase.email,
            nome: purchase.customerName || purchase.email.split("@")[0],
            productName: productLabels[purchase.productSlug] || purchase.productSlug,
            protocol,
            language: lang,
          });
        } catch (e) {
          console.warn("[Refund] approval email failed:", (e as Error).message);
        }

        audit(ctx, "refund.approve", {
          targetType: "purchase",
          targetId: purchase.id,
          details: { email: purchase.email, protocol, stripeRefundId: refundId, amountCents: purchase.amountCents },
        });
        return { success: true, protocol, refundId };
      }),
  }),

  // ─── Diagnostic Offers (post-questionnaire landing) ────────
  offers: router({
    // Public: list offers shown on the post-diagnostico landing
    listForDiagnostico: publicProcedure.query(async () => {
      const raw = await getSiteSetting("diagnostico_offers");
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) return parsed as DiagnosticoOffer[];
        } catch {
          // fall through to defaults
        }
      }
      return DEFAULT_DIAGNOSTICO_OFFERS;
    }),

    // Admin: replace the full offers array
    save: adminProcedure
      .input(z.object({
        offers: z.array(z.object({
          id: z.string().min(1).max(64),
          title: z.string().min(1).max(200),
          description: z.string().min(1).max(1000),
          // SEC: URL allowlist — only https:// or absolute internal paths. Rejects
          // javascript:, vbscript:, data:, blob:, file:, and protocol-relative (//evil.com).
          imageUrl: z.string().max(2000).default("").refine(
            (s) => s === "" || /^https:\/\/[^\s]+$/.test(s) || (/^\/[^\/]/.test(s) && !s.includes("://")),
            { message: "imageUrl deve ser https:// ou caminho interno /..." }
          ),
          ctaText: z.string().min(1).max(80),
          ctaUrl: z.string().max(2000).default("").refine(
            (s) => s === "" || /^https:\/\/[^\s]+$/.test(s) || (/^\/[^\/]/.test(s) && !s.includes("://")),
            { message: "ctaUrl deve ser https:// ou caminho interno /..." }
          ),
        })).min(1).max(12),
      }))
      .mutation(async ({ input, ctx }) => {
        await upsertSiteSetting("diagnostico_offers", JSON.stringify(input.offers));
        audit(ctx, "offers.save", {
          targetType: "offers",
          details: { count: input.offers.length, ids: input.offers.map(o => o.id) },
        });
        return { success: true };
      }),
  }),

  // ─── Ebook Downloads ───────────────────────────────────────
  downloads: router({
    // Public: get download links for all ebook formats
    getLinks: publicProcedure.query(() => {
      return {
        pdf: "/api/downloads/ebook-pdf",
        pdfGrafica: "/api/downloads/ebook-pdf-grafica",
        epub: "/api/downloads/ebook-epub",
        mobi: "/api/downloads/ebook-mobi",
        flipbook: "/api/downloads/ebook-flipbook",
        html: "/api/downloads/ebook-html",
        version: "2.0",
        updatedAt: "2025-02-27",
      };
    }),
  }),

  // ─── Analytics (Umami proxy) ────────────────────────────────
  analytics: router({
    // Admin: get active visitors
    active: adminProcedure.query(async () => {
      return fetchUmami(`/api/websites/${ENV.analyticsWebsiteId}/active`);
    }),

    // Admin: get website stats (pageviews, visitors, visits, bounces, totaltime)
    stats: adminProcedure
      .input(
        z.object({
          startAt: z.number(),
          endAt: z.number(),
        })
      )
      .query(async ({ input }) => {
        const params = new URLSearchParams({
          startAt: input.startAt.toString(),
          endAt: input.endAt.toString(),
        });
        return fetchUmami(
          `/api/websites/${ENV.analyticsWebsiteId}/stats?${params}`
        );
      }),

    // Admin: get pageviews time series
    pageviews: adminProcedure
      .input(
        z.object({
          startAt: z.number(),
          endAt: z.number(),
          unit: z.enum(["minute", "hour", "day", "month", "year"]).default("day"),
          timezone: z.string().default("Africa/Luanda"),
        })
      )
      .query(async ({ input }) => {
        const params = new URLSearchParams({
          startAt: input.startAt.toString(),
          endAt: input.endAt.toString(),
          unit: input.unit,
          timezone: input.timezone,
        });
        return fetchUmami(
          `/api/websites/${ENV.analyticsWebsiteId}/pageviews?${params}`
        );
      }),

    // Admin: get metrics by type (path, country, browser, os, device, referrer, etc.)
    metrics: adminProcedure
      .input(
        z.object({
          startAt: z.number(),
          endAt: z.number(),
          type: z.enum([
            "path",
            "referrer",
            "browser",
            "os",
            "device",
            "country",
            "region",
            "city",
            "language",
            "screen",
            "event",
            "hostname",
          ]),
          limit: z.number().int().min(1).max(100).default(10),
        })
      )
      .query(async ({ input }) => {
        const params = new URLSearchParams({
          startAt: input.startAt.toString(),
          endAt: input.endAt.toString(),
          type: input.type,
          limit: input.limit.toString(),
        });
        return fetchUmami(
          `/api/websites/${ENV.analyticsWebsiteId}/metrics?${params}`
        );
      }),
  }),

  // ─── Access Management (Admin) ──────────────────────────────────
  accessManagement: router({
    corporateMetrics: adminProcedure.query(async () => {
      return getCorporateMetrics();
    }),

    listUsers: adminProcedure
      .input(z.object({
        search: z.string().optional(),
        page: z.number().int().min(1).default(1),
        pageSize: z.number().int().min(1).max(100).default(20),
      }))
      .query(async ({ input }) => {
        return listAllUsersWithOrgs(input);
      }),
  }),

  accessRequests: router({
    list: adminProcedure
      .input(z.object({
        status: z.enum(["pending", "contacted", "closed"]).optional(),
        page: z.number().int().min(1).default(1),
        pageSize: z.number().int().min(1).max(100).default(20),
      }))
      .query(async ({ input }) => {
        return listDemoRequests(input);
      }),

    getById: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getDemoRequestById(input.id);
      }),

    updateStatus: adminProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["pending", "contacted", "closed"]),
      }))
      .mutation(async ({ input }) => {
        return updateDemoRequestStatus(input.id, input.status);
      }),

    approve: adminProcedure
      .input(z.object({
        id: z.number(),
        slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/),
        maxMembers: z.number().int().min(1).max(10000).default(50),
      }))
      .mutation(async ({ input }) => {
        const request = await getDemoRequestById(input.id);
        if (!request) throw new TRPCError({ code: "NOT_FOUND", message: "Solicitação não encontrada." });

        // Create org
        const org = await createOrganization({
          name: request.companyName,
          slug: input.slug,
          maxMembers: input.maxMembers,
        });

        // Create member as owner
        const token = nanoid(32);
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await createOrgMember({
          orgId: org.id,
          email: request.email,
          name: request.contactName,
          role: "owner",
          inviteToken: token,
          inviteExpiresAt: expiresAt,
        });

        // Send invite email
        sendInviteEmail({
          recipientEmail: request.email,
          recipientName: request.contactName,
          orgName: request.companyName,
          inviterName: "P.A.G.O. Admin",
          role: "owner",
          inviteToken: token,
        }).catch(() => {});

        // Mark request as closed
        await updateDemoRequestStatus(input.id, "closed");

        return { orgId: org.id, orgSlug: input.slug };
      }),
  }),

  // ─── Corporate Module ───────────────────────────────────────────
  corporate: router({
    // Public: Demo request form
    requestDemo: publicProcedure
      .input(z.object({
        companyName: z.string().min(2).max(255),
        contactName: z.string().min(2).max(255),
        email: z.string().email().max(320),
        phone: z.string().min(8).max(40),
        employeeRange: z.enum(["1-50", "51-200", "201-500", "500+"]),
        message: z.string().max(1000).optional(),
      }))
      .mutation(async ({ input }) => {
        const row = await createDemoRequest(input);
        sendDemoRequestEmail(input).catch(() => {});
        sendDemoConfirmationEmail(input).catch(() => {});
        return { id: row.id };
      }),

    // Admin: CRUD for organizations (super admin only)
    createOrg: adminProcedure
      .input(z.object({
        name: z.string().min(2).max(255),
        slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
        cnpj: z.string().max(18).optional(),
        maxMembers: z.number().int().min(1).max(10000).default(50),
      }))
      .mutation(async ({ input }) => {
        return createOrganization({
          name: input.name,
          slug: input.slug,
          cnpj: input.cnpj,
          maxMembers: input.maxMembers,
        });
      }),

    listOrgs: adminProcedure
      .input(z.object({
        search: z.string().optional(),
        page: z.number().int().min(1).default(1),
        pageSize: z.number().int().min(1).max(100).default(20),
      }))
      .query(async ({ input }) => {
        return listOrganizations(input);
      }),

    getOrg: adminProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .query(async ({ input }) => {
        const org = await getOrganizationById(input.id);
        if (!org) throw new TRPCError({ code: "NOT_FOUND", message: "Organization not found" });
        const stats = await getOrgStats(input.id);
        return { ...org, ...stats };
      }),

    getOrgMembers: adminProcedure
      .input(z.object({
        orgId: z.number().int().positive(),
        page: z.number().int().min(1).default(1),
        pageSize: z.number().int().min(1).max(100).default(50),
      }))
      .query(async ({ input }) => {
        return listOrgMembers(input.orgId, { page: input.page, pageSize: input.pageSize });
      }),

    myOrgs: protectedProcedure
      .query(async ({ ctx }) => {
        // Super admin sees all orgs
        if (ctx.user.role === "admin") {
          const all = await listOrganizations({ page: 1, pageSize: 100 });
          return all.items.map((o) => ({ orgId: o.id, orgName: o.name, orgSlug: o.slug, orgLogo: o.logo, memberRole: "owner" as const }));
        }
        const { getOrgsByUserId } = await import("./db");
        return getOrgsByUserId(ctx.user.id);
      }),

    getOrgBySlug: publicProcedure
      .input(z.object({ slug: z.string().min(1) }))
      .query(async ({ input }) => {
        const org = await getOrganizationBySlug(input.slug);
        if (!org) throw new TRPCError({ code: "NOT_FOUND", message: "Organization not found" });
        return { id: org.id, name: org.name, slug: org.slug, logo: org.logo };
      }),

    getMyMembership: protectedProcedure
      .input(z.object({ orgSlug: z.string().min(1) }))
      .query(async ({ input, ctx }) => {
        const org = await getOrganizationBySlug(input.orgSlug);
        if (!org) throw new TRPCError({ code: "NOT_FOUND", message: "Organization not found" });

        // Super admin gets virtual owner access
        if (ctx.user.role === "admin") {
          return { orgId: org.id, orgName: org.name, orgSlug: org.slug, orgLogo: org.logo, memberRole: "owner" as const, memberId: 0 };
        }

        const member = await import("./db").then((m) => m.getOrgMemberByUserAndOrg(ctx.user.id, org.id));
        if (!member || member.status !== "active") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Você não é membro desta organização." });
        }

        return { orgId: org.id, orgName: org.name, orgSlug: org.slug, orgLogo: org.logo, memberRole: member.role, memberId: member.id };
      }),

    updateOrg: adminProcedure
      .input(z.object({
        id: z.number().int().positive(),
        name: z.string().min(2).max(255).optional(),
        status: z.enum(["active", "suspended", "trial"]).optional(),
        activeUntil: z.string().optional().nullable(),
        maxMembers: z.number().int().min(1).max(10000).optional(),
        cnpj: z.string().max(18).optional(),
        privacyMinResponses: z.number().int().min(1).max(100).optional(),
        privacyShowIndividual: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, activeUntil, ...rest } = input;
        const data: any = { ...rest };
        if (activeUntil !== undefined) {
          data.activeUntil = activeUntil ? new Date(activeUntil) : null;
        }
        const org = await updateOrganization(id, data);
        if (!org) throw new TRPCError({ code: "NOT_FOUND", message: "Organization not found" });
        return org;
      }),

    deleteOrg: adminProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ input }) => {
        await deleteOrganization(input.id);
        return { success: true };
      }),

    hrMetrics: protectedProcedure
      .input(z.object({ orgId: z.number().int().positive() }))
      .query(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") {
          const member = await import("./db").then((m) => m.getOrgMemberByUserAndOrg(ctx.user.id, input.orgId));
          if (!member || !["owner", "hr_admin", "hr_viewer"].includes(member.role)) {
            throw new TRPCError({ code: "FORBIDDEN", message: "Sem permissão." });
          }
        }
        const totalMembers = await countActiveOrgMembers(input.orgId);
        const allMembers = await listOrgMembers(input.orgId, { page: 1, pageSize: 1000 });
        const activeMembers = allMembers.items.filter((m: any) => m.status === "active").length;

        const avg = await getCompanyAverages(input.orgId);
        const diagnosticCount = avg?.count ?? 0;
        const completionRate = activeMembers > 0 ? Math.round((diagnosticCount / activeMembers) * 100) : 0;

        // Find weakest pillar across org
        let weakestPillar = "—";
        if (avg && avg.count > 0) {
          const scores: Record<string, number> = {
            P: Number(avg.avgP ?? 0), A: Number(avg.avgA ?? 0),
            G: Number(avg.avgG ?? 0), O: Number(avg.avgO ?? 0),
          };
          const minScore = Math.min(...Object.values(scores));
          weakestPillar = Object.keys(scores).find((k) => scores[k] === minScore) || "—";
        }

        return {
          totalMembers,
          activeMembers,
          diagnosticCount,
          completionRate,
          weakestPillar,
          avgGeral: avg ? Number(avg.avgGeral?.toFixed(1) ?? 0) : 0,
          avgP: avg ? Number(avg.avgP?.toFixed(1) ?? 0) : 0,
          avgA: avg ? Number(avg.avgA?.toFixed(1) ?? 0) : 0,
          avgG: avg ? Number(avg.avgG?.toFixed(1) ?? 0) : 0,
          avgO: avg ? Number(avg.avgO?.toFixed(1) ?? 0) : 0,
        };
      }),

    listMembers: protectedProcedure
      .input(z.object({
        orgId: z.number().int().positive(),
        status: z.string().optional(),
        role: z.string().optional(),
        search: z.string().optional(),
        page: z.number().int().min(1).default(1),
        pageSize: z.number().int().min(1).max(100).default(20),
      }))
      .query(async ({ input, ctx }) => {
        // Allow super admin or HR members of the org
        if (ctx.user.role !== "admin") {
          const member = await import("./db").then((m) => m.getOrgMemberByUserAndOrg(ctx.user.id, input.orgId));
          if (!member || !["owner", "hr_admin", "hr_viewer"].includes(member.role)) {
            throw new TRPCError({ code: "FORBIDDEN", message: "Sem permissão para ver membros." });
          }
        }
        const { orgId, ...params } = input;
        return listOrgMembers(orgId, params);
      }),

    // ─── Invite Endpoints ──────────────────────────────────────
    sendInvites: protectedProcedure
      .input(z.object({
        orgId: z.number().int().positive(),
        invites: z.array(z.object({
          email: z.string().email().max(320).transform((v) => v.toLowerCase()),
          name: z.string().min(1).max(255).optional(),
          role: z.enum(["hr_admin", "hr_viewer", "employee"]).default("employee"),
          department: z.string().max(128).optional(),
        })).min(1).max(50),
      }))
      .mutation(async ({ input, ctx }) => {
        // Allow super admin or HR writers of the org
        if (ctx.user.role !== "admin") {
          const member = await import("./db").then((m) => m.getOrgMemberByUserAndOrg(ctx.user.id, input.orgId));
          if (!member || !["owner", "hr_admin"].includes(member.role)) {
            throw new TRPCError({ code: "FORBIDDEN", message: "Sem permissão para enviar convites." });
          }
        }

        const org = await getOrganizationById(input.orgId);
        if (!org) throw new TRPCError({ code: "NOT_FOUND", message: "Organization not found" });

        const currentCount = await countActiveOrgMembers(input.orgId);
        if (currentCount + input.invites.length > org.maxMembers) {
          throw new TRPCError({ code: "BAD_REQUEST", message: `Limite de ${org.maxMembers} membros atingido.` });
        }

        let sent = 0;
        const skipped: string[] = [];

        for (const invite of input.invites) {
          // Check if already a member
          const existing = await listOrgMembers(input.orgId, { search: invite.email, page: 1, pageSize: 1 });
          if (existing.items.some((m) => m.email.toLowerCase() === invite.email)) {
            skipped.push(invite.email);
            continue;
          }

          const token = nanoid(32);
          const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

          await createOrgMember({
            orgId: input.orgId,
            email: invite.email,
            name: invite.name,
            role: invite.role,
            department: invite.department,
            status: "invited",
            inviteToken: token,
            inviteExpiresAt: expiresAt,
          });

          // Fire-and-forget email
          sendInviteEmail({
            recipientEmail: invite.email,
            recipientName: invite.name,
            orgName: org.name,
            inviterName: ctx.user.name || "Administrador",
            inviteToken: token,
            role: invite.role,
          }).catch(() => {});

          sent++;
        }

        return { sent, skipped };
      }),

    validateInvite: publicProcedure
      .input(z.object({ token: z.string().min(1).max(64) }))
      .query(async ({ input }) => {
        const member = await getOrgMemberByInviteToken(input.token);
        if (!member) return { valid: false, expired: false } as const;

        const expired = member.inviteExpiresAt ? new Date() > member.inviteExpiresAt : false;
        if (expired || member.status !== "invited") {
          return { valid: false, expired: true } as const;
        }

        const org = await getOrganizationById(member.orgId);
        return {
          valid: true,
          expired: false,
          orgName: org?.name ?? "Organização",
          email: member.email,
          role: member.role,
          name: member.name,
        } as const;
      }),

    acceptInvite: protectedProcedure
      .input(z.object({
        token: z.string().min(1).max(64),
        consentGiven: z.boolean(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (!input.consentGiven) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Consentimento LGPD é obrigatório." });
        }

        const member = await getOrgMemberByInviteToken(input.token);
        if (!member) throw new TRPCError({ code: "NOT_FOUND", message: "Convite não encontrado." });

        const expired = member.inviteExpiresAt ? new Date() > member.inviteExpiresAt : false;
        if (expired || member.status !== "invited") {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Este convite expirou." });
        }

        await updateOrgMember(member.id, {
          userId: ctx.user.id,
          status: "active",
          inviteToken: null as any,
          consentGivenAt: new Date(),
        });

        const org = await getOrganizationById(member.orgId);
        return { orgId: member.orgId, orgSlug: org?.slug ?? "" };
      }),

    cancelInvite: adminProcedure
      .input(z.object({ memberId: z.number().int().positive() }))
      .mutation(async ({ input }) => {
        const db = await import("./db").then((m) => m.getDb());
        if (db) {
          const { orgMembers } = await import("../drizzle/schema");
          const { eq } = await import("drizzle-orm");
          await db.delete(orgMembers).where(eq(orgMembers.id, input.memberId));
        }
        return { success: true };
      }),

    // ─── Corporate Diagnostic Endpoints ─────────────────────────
    getQuestionnaire: protectedProcedure
      .query(async () => {
        const q = await getActiveQuestionnaire("corporate");
        if (!q) return null;
        return { id: q.id, name: q.name, version: q.version, questions: q.questions };
      }),

    submitDiagnostic: protectedProcedure
      .input(z.object({
        orgId: z.number().int().positive(),
        questionnaireId: z.number().int().positive(),
        answersP: z.array(z.number().min(1).max(4)),
        answersA: z.array(z.number().min(1).max(4)),
        answersG: z.array(z.number().min(1).max(4)),
        answersO: z.array(z.number().min(1).max(4)),
        mediaP: z.number(),
        mediaA: z.number(),
        mediaG: z.number(),
        mediaO: z.number(),
        mediaGeral: z.number(),
        pilarMaisFraco: z.enum(["P", "A", "G", "O"]),
      }))
      .mutation(async ({ input, ctx }) => {
        // Resolve membership
        const member = await import("./db").then((m) => m.getOrgMemberByUserAndOrg(ctx.user.id, input.orgId));
        if (!member || member.status !== "active") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Not a member of this organization." });
        }

        return createCorporateDiagnostic({
          orgId: input.orgId,
          memberId: member.id,
          questionnaireId: input.questionnaireId,
          answersP: input.answersP,
          answersA: input.answersA,
          answersG: input.answersG,
          answersO: input.answersO,
          mediaP: input.mediaP,
          mediaA: input.mediaA,
          mediaG: input.mediaG,
          mediaO: input.mediaO,
          mediaGeral: input.mediaGeral,
          pilarMaisFraco: input.pilarMaisFraco,
        });
      }),

    myResults: protectedProcedure
      .input(z.object({ orgId: z.number().int().positive() }))
      .query(async ({ input, ctx }) => {
        const member = await import("./db").then((m) => m.getOrgMemberByUserAndOrg(ctx.user.id, input.orgId));
        if (!member) return [];
        return listCorporateDiagnosticsByMember(input.orgId, member.id);
      }),

    companyAverage: protectedProcedure
      .input(z.object({ orgId: z.number().int().positive() }))
      .query(async ({ input }) => {
        const org = await getOrganizationById(input.orgId);
        if (!org) return null;

        const avg = await getCompanyAverages(input.orgId);
        if (!avg || avg.count < org.privacyMinResponses) return null;

        return {
          count: avg.count,
          avgP: Number(avg.avgP?.toFixed(1) ?? 0),
          avgA: Number(avg.avgA?.toFixed(1) ?? 0),
          avgG: Number(avg.avgG?.toFixed(1) ?? 0),
          avgO: Number(avg.avgO?.toFixed(1) ?? 0),
          avgGeral: Number(avg.avgGeral?.toFixed(1) ?? 0),
        };
      }),

    downloadPdf: protectedProcedure
      .input(z.object({
        orgId: z.number().int().positive(),
        diagnosticId: z.number().int().positive(),
      }))
      .mutation(async ({ input, ctx }) => {
        const member = await import("./db").then((m) => m.getOrgMemberByUserAndOrg(ctx.user.id, input.orgId));
        if (!member || member.status !== "active") {
          // Allow admin bypass
          if (ctx.user.role !== "admin") {
            throw new TRPCError({ code: "FORBIDDEN", message: "Not a member." });
          }
        }
        const results = await listCorporateDiagnosticsByMember(input.orgId, member?.id ?? 0);
        const diagnostic = results.find((r: any) => r.id === input.diagnosticId);
        if (!diagnostic) throw new TRPCError({ code: "NOT_FOUND", message: "Diagnostic not found." });

        const org = await getOrganizationById(input.orgId);
        if (!org) throw new TRPCError({ code: "NOT_FOUND" });

        const answersMap: Record<string, number> = {};
        const pillars = ["P", "A", "G", "O"] as const;
        const arrays = [diagnostic.answersP, diagnostic.answersA, diagnostic.answersG, diagnostic.answersO];
        pillars.forEach((p, pi) => {
          (arrays[pi] as number[]).forEach((v: number, qi: number) => { answersMap[`${p}${qi + 1}`] = v; });
        });

        const calcSub = (ids: string[]) => {
          const sum = ids.reduce((acc, id) => acc + (answersMap[id] ?? 0), 0);
          return parseFloat(((sum / (ids.length * 4)) * 10).toFixed(2));
        };
        const subgroups = {
          A: { vertical: calcSub(["A1","A2","A3","A4"]), horizontal: calcSub(["A5","A6","A7","A8"]), internal: calcSub(["A9","A10","A11","A12"]) },
          G: { disciplinar: calcSub(["G1","G2","G3"]), emocional: calcSub(["G4","G5","G6"]), financeiro: calcSub(["G7","G8","G9"]), temporal: calcSub(["G10","G11","G12"]) },
          O: { basica: calcSub(["O1","O2","O3","O4"]), radical: calcSub(["O5","O6","O7","O8"]), fruto: calcSub(["O9","O10","O11","O12"]) },
        };
        const cruz = {
          ser: diagnostic.mediaP,
          fazer: parseFloat((diagnostic.mediaG * 0.40 + subgroups.O.basica * 0.30 + subgroups.O.radical * 0.30).toFixed(2)),
          ter: parseFloat((10 - ((subgroups.A.internal + diagnostic.mediaP) / 2)).toFixed(2)),
          manifestar: parseFloat((subgroups.O.fruto * 0.60 + subgroups.A.horizontal * 0.40).toFixed(2)),
        };

        const { getDiagnosticText } = await import("../client/src/data/diagnostics-corporate");
        const findWeakest = (scores: Record<string, number>) => {
          let w = Object.keys(scores)[0];
          for (const [k, v] of Object.entries(scores)) { if (v < (scores[w] ?? Infinity)) w = k; }
          return w;
        };
        const diagnostics = {
          P: getDiagnosticText("P", diagnostic.mediaP, null),
          A: getDiagnosticText("A", diagnostic.mediaA, findWeakest(subgroups.A as unknown as Record<string, number>)),
          G: getDiagnosticText("G", diagnostic.mediaG, findWeakest(subgroups.G as unknown as Record<string, number>)),
          O: getDiagnosticText("O", diagnostic.mediaO, findWeakest(subgroups.O as unknown as Record<string, number>)),
        };

        const { generateCorporatePdfBase64 } = await import("./corporatePdf");
        const pdfBase64 = await generateCorporatePdfBase64({
          nome: member?.name || ctx.user.name || "Colaborador",
          departamento: member?.department || undefined,
          orgName: org.name,
          date: new Date(diagnostic.createdAt).toLocaleDateString("pt-BR"),
          mediaP: diagnostic.mediaP, mediaA: diagnostic.mediaA,
          mediaG: diagnostic.mediaG, mediaO: diagnostic.mediaO,
          mediaGeral: diagnostic.mediaGeral,
          pilarMaisFraco: diagnostic.pilarMaisFraco as any,
          subgroups, cruz, diagnostics,
        });

        return { pdfBase64, filename: `pago-corporativo-${(member?.name || "resultado").replace(/\s+/g, "-")}.pdf` };
      }),

    sendPdfEmail: protectedProcedure
      .input(z.object({
        orgId: z.number().int().positive(),
        diagnosticId: z.number().int().positive(),
      }))
      .mutation(async ({ input, ctx }) => {
        const member = await import("./db").then((m) => m.getOrgMemberByUserAndOrg(ctx.user.id, input.orgId));
        if (!member || member.status !== "active") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Not a member of this organization." });
        }

        // Get the diagnostic result
        const results = await listCorporateDiagnosticsByMember(input.orgId, member.id);
        const diagnostic = results.find((r: any) => r.id === input.diagnosticId);
        if (!diagnostic) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Diagnostic not found." });
        }

        const org = await getOrganizationById(input.orgId);
        if (!org) throw new TRPCError({ code: "NOT_FOUND", message: "Organization not found." });

        // Build answers map for subgroup calculations
        const answersMap: Record<string, number> = {};
        const pillars = ["P", "A", "G", "O"] as const;
        const arrays = [diagnostic.answersP, diagnostic.answersA, diagnostic.answersG, diagnostic.answersO];
        pillars.forEach((p, pi) => {
          (arrays[pi] as number[]).forEach((v: number, qi: number) => {
            answersMap[`${p}${qi + 1}`] = v;
          });
        });

        // Calculate subgroup scores
        const calcSub = (ids: string[]) => {
          const sum = ids.reduce((acc, id) => acc + (answersMap[id] ?? 0), 0);
          return parseFloat(((sum / (ids.length * 4)) * 10).toFixed(2));
        };

        const subgroups = {
          A: { vertical: calcSub(["A1","A2","A3","A4"]), horizontal: calcSub(["A5","A6","A7","A8"]), internal: calcSub(["A9","A10","A11","A12"]) },
          G: { disciplinar: calcSub(["G1","G2","G3"]), emocional: calcSub(["G4","G5","G6"]), financeiro: calcSub(["G7","G8","G9"]), temporal: calcSub(["G10","G11","G12"]) },
          O: { basica: calcSub(["O1","O2","O3","O4"]), radical: calcSub(["O5","O6","O7","O8"]), fruto: calcSub(["O9","O10","O11","O12"]) },
        };

        // Cruz scores
        const cruz = {
          ser: diagnostic.mediaP,
          fazer: parseFloat((diagnostic.mediaG * 0.40 + subgroups.O.basica * 0.30 + subgroups.O.radical * 0.30).toFixed(2)),
          ter: parseFloat((10 - ((subgroups.A.internal + diagnostic.mediaP) / 2)).toFixed(2)),
          manifestar: parseFloat((subgroups.O.fruto * 0.60 + subgroups.A.horizontal * 0.40).toFixed(2)),
        };

        // Get diagnostic texts
        const { getDiagnosticText } = await import("../client/src/data/diagnostics-corporate");
        const findWeakest = (scores: Record<string, number>) => {
          let w = Object.keys(scores)[0];
          for (const [k, v] of Object.entries(scores)) { if (v < (scores[w] ?? Infinity)) w = k; }
          return w;
        };

        const diagnostics = {
          P: getDiagnosticText("P", diagnostic.mediaP, null),
          A: getDiagnosticText("A", diagnostic.mediaA, findWeakest(subgroups.A as unknown as Record<string, number>)),
          G: getDiagnosticText("G", diagnostic.mediaG, findWeakest(subgroups.G as unknown as Record<string, number>)),
          O: getDiagnosticText("O", diagnostic.mediaO, findWeakest(subgroups.O as unknown as Record<string, number>)),
        };

        // Generate PDF
        const { generateCorporatePdfBase64 } = await import("./corporatePdf");
        const pdfBase64 = await generateCorporatePdfBase64({
          nome: member.name || ctx.user.name || "Colaborador",
          cargo: undefined,
          departamento: member.department || undefined,
          orgName: org.name,
          date: new Date(diagnostic.createdAt).toLocaleDateString("pt-BR"),
          mediaP: diagnostic.mediaP,
          mediaA: diagnostic.mediaA,
          mediaG: diagnostic.mediaG,
          mediaO: diagnostic.mediaO,
          mediaGeral: diagnostic.mediaGeral,
          pilarMaisFraco: diagnostic.pilarMaisFraco as any,
          subgroups,
          cruz,
          diagnostics,
        });

        // Send email
        const email = member.email || ctx.user.email;
        if (!email) throw new TRPCError({ code: "BAD_REQUEST", message: "No email found." });

        const { sendDiagnosticEmailWithPdf } = await import("./_core/notification");
        await sendDiagnosticEmailWithPdf({
          nome: member.name || ctx.user.name || "Colaborador",
          email,
          mediaP: diagnostic.mediaP,
          mediaA: diagnostic.mediaA,
          mediaG: diagnostic.mediaG,
          mediaO: diagnostic.mediaO,
          mediaGeral: diagnostic.mediaGeral,
          pilarMaisFraco: diagnostic.pilarMaisFraco,
          pdfBase64,
        });

        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;

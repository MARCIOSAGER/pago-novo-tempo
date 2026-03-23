import { z } from "zod";
import { nanoid } from "nanoid";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import {
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
} from "./db";
import { storagePut } from "./storage";
import { honeypotCheck, validateFileUpload } from "./security";
import { TRPCError } from "@trpc/server";
import { ENV } from "./_core/env";
import { notifyInscription, sendDiagnosticEmail, sendDiagnosticEmailWithPdf, sendInviteEmail } from "./_core/notification";
import { generateDiagnosticoPdfBase64 } from "./diagnosticoPdf";
import { computePillarSubgroups, computeWeakestSubgroupPerPillar } from "../shared/diagnostico";
import pt from "../client/src/i18n/pt";

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

Kit de Mentoria:
- Bíblia BKJ
- Caderno de Estudos
- Caneta
- Ebook P.A.G.O.

Regras:
- Responda SEMPRE em português brasileiro
- Seja acolhedor, respeitoso e profundo
- Use linguagem que equilibre espiritualidade com praticidade
- Não invente informações — se não souber, oriente o usuário a se inscrever na mentoria
- Mantenha respostas concisas (máximo 3 parágrafos)
- Não faça proselitismo agressivo — seja subliminar e elegante
- Se perguntado sobre preços ou valores, oriente a se inscrever pelo formulário
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
      .mutation(async ({ input }) => {
        await updateDiagnosticoStatus(input.id, input.status);
        return { success: true };
      }),

    // Admin: delete diagnostic
    delete: adminProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ input }) => {
        const result = await getDiagnosticoById(input.id);
        if (!result) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Diagnóstico não encontrado." });
        }
        await deleteDiagnostico(input.id);
        return { success: true };
      }),

    // Admin: send/resend diagnostic email (always generates PDF on-demand)
    sendEmail: adminProcedure
      .input(z.object({
        id: z.number().int().positive(),
        email: z.string().email().max(320).toLowerCase(),
      }))
      .mutation(async ({ input }) => {
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
        return { success: true };
      }),

    // Admin: bulk delete diagnostics
    bulkDelete: adminProcedure
      .input(z.object({ ids: z.array(z.number().int().positive()).min(1).max(100) }))
      .mutation(async ({ input }) => {
        for (const id of input.ids) {
          await deleteDiagnostico(id);
        }
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

  // ─── Corporate Module ───────────────────────────────────────────
  corporate: router({
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
        const memberCount = await countActiveOrgMembers(input.id);
        return { ...org, memberCount };
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
        maxMembers: z.number().int().min(1).max(10000).optional(),
        cnpj: z.string().max(18).optional(),
        privacyMinResponses: z.number().int().min(1).max(100).optional(),
        privacyShowIndividual: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
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

    listMembers: adminProcedure
      .input(z.object({
        orgId: z.number().int().positive(),
        status: z.string().optional(),
        role: z.string().optional(),
        search: z.string().optional(),
        page: z.number().int().min(1).default(1),
        pageSize: z.number().int().min(1).max(100).default(20),
      }))
      .query(async ({ input }) => {
        const { orgId, ...params } = input;
        return listOrgMembers(orgId, params);
      }),

    // ─── Invite Endpoints ──────────────────────────────────────
    sendInvites: adminProcedure
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
  }),
});

export type AppRouter = typeof appRouter;

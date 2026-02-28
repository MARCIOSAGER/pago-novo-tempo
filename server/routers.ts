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
  listDownloads,
  listAllDownloads,
  getDownloadBySlug,
  getDownloadById,
  createDownload,
  updateDownload,
  deleteDownload,
  getDownloadCount,
} from "./db";
import { storagePut } from "./storage";
import { honeypotCheck, validateFileUpload } from "./security";
import { TRPCError } from "@trpc/server";
import { ENV } from "./_core/env";
import { createPatchedFetch } from "./_core/patchedFetch";

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
// ─── Router ─────────────────────────────────────────────────────────────

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
          const baseURL = ENV.forgeApiUrl.endsWith("/v1")
            ? ENV.forgeApiUrl
            : `${ENV.forgeApiUrl}/v1`;

          const patchedFetch = createPatchedFetch(fetch);

          const response = await patchedFetch(`${baseURL}/chat/completions`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${ENV.forgeApiKey}`,
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
            throw new Error(`LLM API error: ${response.status}`);
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

  // ─── Downloads Management ───────────────────────────────────
  downloads: router({
    // Public: list active downloads by category
    listByCategory: publicProcedure
      .input(z.object({ category: z.string().max(64).optional() }))
      .query(async ({ input }) => {
        return listDownloads(input.category);
      }),

    // Public: get single download by slug
    getBySlug: publicProcedure
      .input(z.object({ slug: z.string().max(128) }))
      .query(async ({ input }) => {
        const dl = await getDownloadBySlug(input.slug);
        if (!dl) throw new TRPCError({ code: "NOT_FOUND", message: "Download não encontrado." });
        return dl;
      }),

    // Admin: list all downloads (including inactive)
    listAll: adminProcedure.query(async () => {
      return listAllDownloads();
    }),

    // Admin: get total count
    count: adminProcedure.query(async () => {
      return { total: await getDownloadCount() };
    }),

    // Admin: create a new download entry
    create: adminProcedure
      .input(
        z.object({
          slug: z.string().min(1).max(128).regex(/^[a-z0-9-]+$/, "Slug deve conter apenas letras minúsculas, números e hífens"),
          title: z.string().min(1).max(255),
          description: z.string().max(1000).optional().nullable(),
          format: z.string().min(1).max(32),
          fileSize: z.string().max(32).optional().nullable(),
          url: z.string().url().max(2048),
          filename: z.string().min(1).max(255),
          category: z.string().min(1).max(64),
          badge: z.string().max(64).optional().nullable(),
          badgeVariant: z.string().max(32).optional().nullable(),
          sortOrder: z.number().int().min(0).default(0),
          active: z.enum(["yes", "no"]).default("yes"),
        })
      )
      .mutation(async ({ input }) => {
        // Check slug uniqueness
        const existing = await getDownloadBySlug(input.slug);
        if (existing) {
          throw new TRPCError({ code: "CONFLICT", message: "Slug já existe. Escolha outro identificador." });
        }
        await createDownload(input);
        return { success: true };
      }),

    // Admin: update a download entry
    update: adminProcedure
      .input(
        z.object({
          id: z.number().int().positive(),
          slug: z.string().min(1).max(128).regex(/^[a-z0-9-]+$/).optional(),
          title: z.string().min(1).max(255).optional(),
          description: z.string().max(1000).optional().nullable(),
          format: z.string().min(1).max(32).optional(),
          fileSize: z.string().max(32).optional().nullable(),
          url: z.string().url().max(2048).optional(),
          filename: z.string().min(1).max(255).optional(),
          category: z.string().min(1).max(64).optional(),
          badge: z.string().max(64).optional().nullable(),
          badgeVariant: z.string().max(32).optional().nullable(),
          sortOrder: z.number().int().min(0).optional(),
          active: z.enum(["yes", "no"]).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        const existing = await getDownloadById(id);
        if (!existing) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Download não encontrado." });
        }
        // Check slug uniqueness if changing slug
        if (data.slug && data.slug !== existing.slug) {
          const slugExists = await getDownloadBySlug(data.slug);
          if (slugExists) {
            throw new TRPCError({ code: "CONFLICT", message: "Slug já existe. Escolha outro identificador." });
          }
        }
        await updateDownload(id, data);
        return { success: true };
      }),

    // Admin: delete a download entry
    delete: adminProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ input }) => {
        const existing = await getDownloadById(input.id);
        if (!existing) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Download não encontrado." });
        }
        await deleteDownload(input.id);
        return { success: true };
      }),

    // Admin: upload file to S3 and create download entry
    uploadAndCreate: adminProcedure
      .input(
        z.object({
          slug: z.string().min(1).max(128).regex(/^[a-z0-9-]+$/, "Slug deve conter apenas letras minúsculas, números e hífens"),
          title: z.string().min(1).max(255),
          description: z.string().max(1000).optional().nullable(),
          format: z.string().min(1).max(32),
          category: z.string().min(1).max(64),
          badge: z.string().max(64).optional().nullable(),
          badgeVariant: z.string().max(32).optional().nullable(),
          sortOrder: z.number().int().min(0).default(0),
          // File data
          filename: z.string().min(1).max(255),
          mimeType: z.string().min(1).max(128),
          size: z.number().int().positive().max(100 * 1024 * 1024), // 100MB max
          data: z.string(), // base64 encoded
        })
      )
      .mutation(async ({ input, ctx }) => {
        // Check slug uniqueness
        const existing = await getDownloadBySlug(input.slug);
        if (existing) {
          throw new TRPCError({ code: "CONFLICT", message: "Slug já existe. Escolha outro identificador." });
        }

        // Validate file
        const validation = validateFileUpload(input.filename, input.mimeType, input.size);
        if (!validation.valid) {
          throw new TRPCError({ code: "BAD_REQUEST", message: validation.error || "Arquivo inválido." });
        }

        // Upload to S3
        const suffix = nanoid(12);
        const safeFilename = input.filename.replace(/[^a-zA-Z0-9._-]/g, "_");
        const fileKey = `pago-downloads/${input.category}/${suffix}-${safeFilename}`;
        const buffer = Buffer.from(input.data, "base64");
        const { url } = await storagePut(fileKey, buffer, input.mimeType);

        // Format file size
        const fileSizeStr = input.size >= 1024 * 1024
          ? `${(input.size / (1024 * 1024)).toFixed(1)} MB`
          : `${(input.size / 1024).toFixed(0)} KB`;

        // Create download record
        await createDownload({
          slug: input.slug,
          title: input.title,
          description: input.description ?? null,
          format: input.format,
          fileSize: fileSizeStr,
          url,
          filename: input.filename,
          category: input.category,
          badge: input.badge ?? null,
          badgeVariant: input.badgeVariant ?? null,
          sortOrder: input.sortOrder,
        });

        return { success: true, url, fileKey };
      }),

    // Admin: replace file for existing download (upload new file to S3)
    replaceFile: adminProcedure
      .input(
        z.object({
          id: z.number().int().positive(),
          filename: z.string().min(1).max(255),
          mimeType: z.string().min(1).max(128),
          size: z.number().int().positive().max(100 * 1024 * 1024),
          data: z.string(), // base64 encoded
        })
      )
      .mutation(async ({ input, ctx }) => {
        const existing = await getDownloadById(input.id);
        if (!existing) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Download não encontrado." });
        }

        const validation = validateFileUpload(input.filename, input.mimeType, input.size);
        if (!validation.valid) {
          throw new TRPCError({ code: "BAD_REQUEST", message: validation.error || "Arquivo inválido." });
        }

        // Upload new file to S3
        const suffix = nanoid(12);
        const safeFilename = input.filename.replace(/[^a-zA-Z0-9._-]/g, "_");
        const fileKey = `pago-downloads/${existing.category}/${suffix}-${safeFilename}`;
        const buffer = Buffer.from(input.data, "base64");
        const { url } = await storagePut(fileKey, buffer, input.mimeType);

        const fileSizeStr = input.size >= 1024 * 1024
          ? `${(input.size / (1024 * 1024)).toFixed(1)} MB`
          : `${(input.size / 1024).toFixed(0)} KB`;

        // Update download record with new file
        await updateDownload(input.id, {
          url,
          filename: input.filename,
          fileSize: fileSizeStr,
        });

        return { success: true, url };
      }),
  }),

});

export type AppRouter = typeof appRouter;

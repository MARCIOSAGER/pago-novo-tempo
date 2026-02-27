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
  createFileRecord,
  listFiles,
  getFileById,
  deleteFileRecord,
} from "./db";
import { storagePut } from "./storage";
import { honeypotCheck, validateFileUpload } from "./security";
import { TRPCError } from "@trpc/server";

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

// ─── Router ─────────────────────────────────────────────────────

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

    // Admin: list all inscriptions
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
});

export type AppRouter = typeof appRouter;

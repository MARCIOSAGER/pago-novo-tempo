import { z } from "zod";
import { notifyOwner, sendTestEmail } from "./notification";
import { ENV } from "./env";
import { adminProcedure, publicProcedure, router } from "./trpc";

export const systemRouter = router({
  health: publicProcedure
    .input(
      z.object({
        timestamp: z.number().min(0, "timestamp cannot be negative"),
      })
    )
    .query(() => ({
      ok: true,
    })),

  emailStatus: adminProcedure.query(() => {
    const smtpConfigured = !!(ENV.smtpHost && ENV.smtpUser && ENV.smtpPass);
    return {
      smtpConfigured,
      smtpHost: ENV.smtpHost || null,
      smtpPort: ENV.smtpPort,
      smtpUser: ENV.smtpUser || null,
      ownerEmail: ENV.ownerEmail || null,
    };
  }),

  notifyOwner: adminProcedure
    .input(
      z.object({
        title: z.string().min(1, "title is required"),
        content: z.string().min(1, "content is required"),
      })
    )
    .mutation(async ({ input }) => {
      const delivered = await notifyOwner(input);
      return {
        success: delivered,
      } as const;
    }),

  sendTestEmail: adminProcedure
    .input(
      z.object({
        to: z.string().email("Email inválido"),
      })
    )
    .mutation(async ({ input }) => {
      const delivered = await sendTestEmail(input.to);
      return { success: delivered } as const;
    }),
});

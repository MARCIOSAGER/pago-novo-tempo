# Backend Patterns

## Database Schema

Enrollment/inscription table with status workflow:

```ts
import { mysqlTable, int, varchar, text, timestamp, mysqlEnum } from "drizzle-orm/mysql-core";

export const mentoriaInscriptions = mysqlTable("mentoria_inscriptions", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  message: text("message"),
  status: mysqlEnum("status", ["pending", "contacted", "enrolled", "rejected"]).default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});
```

After editing schema, run `pnpm db:push` to sync.

## tRPC Route Patterns

### Public submission (with honeypot)

```ts
submit: publicProcedure
  .input(z.object({
    name: z.string().min(2).max(255),
    email: z.string().email().max(255),
    phone: z.string().max(50).optional(),
    message: z.string().max(2000).optional(),
    website: z.string().optional(), // honeypot — reject if filled
  }))
  .mutation(async ({ input }) => {
    if (input.website) return { success: true, message: "OK" }; // silent honeypot reject
    await createInscription(input);
    return { success: true, message: "Inscrição recebida com sucesso!" };
  }),
```

### Admin procedure (RBAC)

```ts
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Acesso restrito a administradores." });
  }
  return next({ ctx });
});
```

### Filtered listing with pagination

```ts
listFiltered: adminProcedure
  .input(z.object({
    status: z.enum(["all", "pending", "contacted", "enrolled", "rejected"]).optional(),
    search: z.string().optional(),
    page: z.number().min(1).default(1),
    pageSize: z.number().min(1).max(100).default(20),
  }))
  .query(async ({ input }) => {
    return listInscriptionsFiltered(input);
  }),
```

### DB helper for filtered listing

```ts
export async function listInscriptionsFiltered(params: {
  status?: string; search?: string; page: number; pageSize: number;
}) {
  const conditions: SQL[] = [];
  if (params.status && params.status !== "all") {
    conditions.push(eq(mentoriaInscriptions.status, params.status));
  }
  if (params.search) {
    const term = `%${params.search}%`;
    conditions.push(or(
      like(mentoriaInscriptions.name, term),
      like(mentoriaInscriptions.email, term),
      like(mentoriaInscriptions.phone, term),
    )!);
  }
  const where = conditions.length ? and(...conditions) : undefined;
  const [items, countResult] = await Promise.all([
    db.select().from(mentoriaInscriptions).where(where)
      .orderBy(desc(mentoriaInscriptions.createdAt))
      .limit(params.pageSize).offset((params.page - 1) * params.pageSize),
    db.select({ count: sql<number>`count(*)` }).from(mentoriaInscriptions).where(where),
  ]);
  return { items, total: countResult[0]?.count ?? 0 };
}
```

### Metrics aggregation

```ts
export async function getInscriptionMetrics() {
  const now = new Date();
  const d7 = new Date(now.getTime() - 7 * 86400000);
  const d30 = new Date(now.getTime() - 30 * 86400000);
  const rows = await db.select().from(mentoriaInscriptions);
  return {
    total: rows.length,
    pending: rows.filter(r => r.status === "pending").length,
    contacted: rows.filter(r => r.status === "contacted").length,
    enrolled: rows.filter(r => r.status === "enrolled").length,
    rejected: rows.filter(r => r.status === "rejected").length,
    last7Days: rows.filter(r => r.createdAt >= d7).length,
    last30Days: rows.filter(r => r.createdAt >= d30).length,
  };
}
```

## S3 File Upload

```ts
import { storagePut } from "./storage";

// In tRPC route:
const buffer = Buffer.from(base64Data, "base64");
const key = `uploads/${userId}/${Date.now()}-${randomSuffix()}.${ext}`;
const { url } = await storagePut(key, buffer, mimeType);
// Save url + key + metadata in DB
```

Always validate file uploads: check MIME type, extension whitelist, and max size (e.g., 5MB) before uploading.

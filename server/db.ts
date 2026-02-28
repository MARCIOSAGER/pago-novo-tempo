import { eq, desc, sql, and, like, or, count } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  mentoriaInscriptions,
  InsertMentoriaInscription,
  MentoriaInscription,
  files,
  InsertFileRecord,
  FileRecord,
  downloads,
  DownloadRecord,
  InsertDownloadRecord,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── User Helpers ────────────────────────────────────────────────

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ─── Mentoria Inscription Helpers ────────────────────────────────

export async function createInscription(data: InsertMentoriaInscription): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(mentoriaInscriptions).values(data);
}

export async function listInscriptions(): Promise<MentoriaInscription[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(mentoriaInscriptions).orderBy(desc(mentoriaInscriptions.createdAt));
}

export async function updateInscriptionStatus(
  id: number,
  status: "pending" | "contacted" | "enrolled" | "rejected"
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(mentoriaInscriptions).set({ status }).where(eq(mentoriaInscriptions.id, id));
}

// ─── Admin: Inscription Metrics ──────────────────────────────────

export async function getInscriptionMetrics() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [totalResult] = await db
    .select({ total: count() })
    .from(mentoriaInscriptions);

  const statusCounts = await db
    .select({
      status: mentoriaInscriptions.status,
      count: count(),
    })
    .from(mentoriaInscriptions)
    .groupBy(mentoriaInscriptions.status);

  const statusMap: Record<string, number> = {
    pending: 0,
    contacted: 0,
    enrolled: 0,
    rejected: 0,
  };
  for (const row of statusCounts) {
    statusMap[row.status] = row.count;
  }

  // Last 7 days count
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const [recentResult] = await db
    .select({ count: count() })
    .from(mentoriaInscriptions)
    .where(sql`${mentoriaInscriptions.createdAt} >= ${sevenDaysAgo}`);

  // Last 30 days count
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const [monthResult] = await db
    .select({ count: count() })
    .from(mentoriaInscriptions)
    .where(sql`${mentoriaInscriptions.createdAt} >= ${thirtyDaysAgo}`);

  return {
    total: totalResult.total,
    pending: statusMap.pending,
    contacted: statusMap.contacted,
    enrolled: statusMap.enrolled,
    rejected: statusMap.rejected,
    last7Days: recentResult.count,
    last30Days: monthResult.count,
  };
}

// ─── Admin: Filtered & Paginated Inscriptions ────────────────────

export async function listInscriptionsFiltered(params: {
  status?: string;
  search?: string;
  page: number;
  pageSize: number;
}): Promise<{ items: MentoriaInscription[]; total: number }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const conditions = [];

  if (params.status && params.status !== "all") {
    conditions.push(eq(mentoriaInscriptions.status, params.status as any));
  }

  if (params.search && params.search.trim().length > 0) {
    const term = `%${params.search.trim()}%`;
    conditions.push(
      or(
        like(mentoriaInscriptions.name, term),
        like(mentoriaInscriptions.email, term),
        like(mentoriaInscriptions.phone, term)
      )!
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [totalResult] = await db
    .select({ total: count() })
    .from(mentoriaInscriptions)
    .where(whereClause);

  const offset = (params.page - 1) * params.pageSize;
  const items = await db
    .select()
    .from(mentoriaInscriptions)
    .where(whereClause)
    .orderBy(desc(mentoriaInscriptions.createdAt))
    .limit(params.pageSize)
    .offset(offset);

  return { items, total: totalResult.total };
}

// ─── Admin: Get Single Inscription ───────────────────────────────

export async function getInscriptionById(id: number): Promise<MentoriaInscription | undefined> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db
    .select()
    .from(mentoriaInscriptions)
    .where(eq(mentoriaInscriptions.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ─── Admin: Delete Inscription ───────────────────────────────────

export async function deleteInscription(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(mentoriaInscriptions).where(eq(mentoriaInscriptions.id, id));
}

// ─── Admin: Export All Inscriptions (for CSV) ────────────────────

export async function exportAllInscriptions(): Promise<MentoriaInscription[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(mentoriaInscriptions).orderBy(desc(mentoriaInscriptions.createdAt));
}

// ─── File Storage Helpers ────────────────────────────────────────

export async function createFileRecord(data: InsertFileRecord): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(files).values(data);
}

export async function listFiles(category?: string): Promise<FileRecord[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  if (category) {
    return db.select().from(files).where(eq(files.category, category)).orderBy(desc(files.createdAt));
  }
  return db.select().from(files).orderBy(desc(files.createdAt));
}

export async function getFileById(id: number): Promise<FileRecord | undefined> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(files).where(eq(files.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function deleteFileRecord(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(files).where(eq(files.id, id));
}

// ─── Download Management Helpers ──────────────────────────────────────

export async function listDownloads(category?: string): Promise<DownloadRecord[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  if (category) {
    return db
      .select()
      .from(downloads)
      .where(and(eq(downloads.category, category), eq(downloads.active, "yes")))
      .orderBy(downloads.sortOrder);
  }
  return db.select().from(downloads).orderBy(downloads.category, downloads.sortOrder);
}

export async function listAllDownloads(): Promise<DownloadRecord[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(downloads).orderBy(downloads.category, downloads.sortOrder);
}

export async function getDownloadBySlug(slug: string): Promise<DownloadRecord | undefined> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(downloads).where(eq(downloads.slug, slug)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getDownloadById(id: number): Promise<DownloadRecord | undefined> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(downloads).where(eq(downloads.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createDownload(data: InsertDownloadRecord): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(downloads).values(data);
}

export async function updateDownload(
  id: number,
  data: Partial<Omit<InsertDownloadRecord, "id">>
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(downloads).set(data).where(eq(downloads.id, id));
}

export async function deleteDownload(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(downloads).where(eq(downloads.id, id));
}

export async function getDownloadCount(): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.select({ total: count() }).from(downloads);
  return result.total;
}

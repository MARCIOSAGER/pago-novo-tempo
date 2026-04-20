import { eq, desc, sql, and, like, or, count } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  InsertUser,
  users,
  mentoriaInscriptions,
  InsertMentoriaInscription,
  MentoriaInscription,
  files,
  InsertFileRecord,
  FileRecord,
  siteSettings,
  SiteSetting,
  diagnosticoResults,
  InsertDiagnosticoResult,
  DiagnosticoResult,
  organizations,
  InsertOrganization,
  Organization,
  orgMembers,
  InsertOrgMember,
  OrgMember,
  questionnaires,
  corporateDiagnostics,
  InsertOrgMember as _IOM,
  demoRequests,
  InsertDemoRequest,
  DemoRequest,
  purchases,
  InsertPurchase,
  Purchase,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const client = postgres(process.env.DATABASE_URL);
      _db = drizzle(client);
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
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    // PostgreSQL upsert: ON CONFLICT (openId) DO UPDATE
    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.openId,
      set: updateSet,
    });
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

// ─── Site Settings Helpers ──────────────────────────────────────

export async function getSiteSetting(key: string): Promise<string | null> {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(siteSettings).where(eq(siteSettings.key, key)).limit(1);
  return result.length > 0 ? result[0].value : null;
}

export async function getAllSiteSettings(): Promise<SiteSetting[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(siteSettings);
}

export async function upsertSiteSetting(key: string, value: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(siteSettings).values({ key, value }).onConflictDoUpdate({
    target: siteSettings.key,
    set: { value, updatedAt: new Date() },
  });
}

// ─── Diagnostico P.A.G.O. Helpers ───────────────────────────────

export async function createDiagnostico(data: InsertDiagnosticoResult): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(diagnosticoResults).values(data);
}

export async function listDiagnosticosFiltered(params: {
  status?: string;
  search?: string;
  page: number;
  pageSize: number;
}): Promise<{ items: DiagnosticoResult[]; total: number }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const conditions = [];

  if (params.status && params.status !== "all") {
    conditions.push(eq(diagnosticoResults.status, params.status as any));
  }

  if (params.search && params.search.trim().length > 0) {
    const term = `%${params.search.trim()}%`;
    conditions.push(
      or(
        like(diagnosticoResults.nome, term),
        like(diagnosticoResults.email, term)
      )!
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [totalResult] = await db
    .select({ total: count() })
    .from(diagnosticoResults)
    .where(whereClause);

  const offset = (params.page - 1) * params.pageSize;
  const items = await db
    .select({
      id: diagnosticoResults.id,
      nome: diagnosticoResults.nome,
      email: diagnosticoResults.email,
      answersP: diagnosticoResults.answersP,
      answersA: diagnosticoResults.answersA,
      answersG: diagnosticoResults.answersG,
      answersO: diagnosticoResults.answersO,
      mediaP: diagnosticoResults.mediaP,
      mediaA: diagnosticoResults.mediaA,
      mediaG: diagnosticoResults.mediaG,
      mediaO: diagnosticoResults.mediaO,
      mediaGeral: diagnosticoResults.mediaGeral,
      pilarMaisFraco: diagnosticoResults.pilarMaisFraco,
      pdfBase64: diagnosticoResults.pdfBase64,
      status: diagnosticoResults.status,
      createdAt: diagnosticoResults.createdAt,
    })
    .from(diagnosticoResults)
    .where(whereClause)
    .orderBy(desc(diagnosticoResults.createdAt))
    .limit(params.pageSize)
    .offset(offset);

  return { items, total: totalResult.total };
}

export async function getDiagnosticoById(id: number): Promise<DiagnosticoResult | undefined> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db
    .select()
    .from(diagnosticoResults)
    .where(eq(diagnosticoResults.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getDiagnosticoByIdLite(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db
    .select({
      id: diagnosticoResults.id,
      nome: diagnosticoResults.nome,
      email: diagnosticoResults.email,
      answersP: diagnosticoResults.answersP,
      answersA: diagnosticoResults.answersA,
      answersG: diagnosticoResults.answersG,
      answersO: diagnosticoResults.answersO,
      mediaP: diagnosticoResults.mediaP,
      mediaA: diagnosticoResults.mediaA,
      mediaG: diagnosticoResults.mediaG,
      mediaO: diagnosticoResults.mediaO,
      mediaGeral: diagnosticoResults.mediaGeral,
      pilarMaisFraco: diagnosticoResults.pilarMaisFraco,
      hasPdf: sql<boolean>`"pdfBase64" IS NOT NULL`.as("hasPdf"),
      status: diagnosticoResults.status,
      createdAt: diagnosticoResults.createdAt,
    })
    .from(diagnosticoResults)
    .where(eq(diagnosticoResults.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateDiagnosticoStatus(
  id: number,
  status: "new" | "reviewed" | "archived"
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(diagnosticoResults).set({ status }).where(eq(diagnosticoResults.id, id));
}

export async function saveDiagnosticoPdf(
  nome: string,
  mediaGeral: number,
  email: string,
  pdfBase64: string
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Find the most recent matching record and update it
  const [record] = await db
    .select({ id: diagnosticoResults.id })
    .from(diagnosticoResults)
    .where(
      and(
        eq(diagnosticoResults.nome, nome),
        eq(diagnosticoResults.mediaGeral, mediaGeral)
      )
    )
    .orderBy(desc(diagnosticoResults.createdAt))
    .limit(1);
  if (record) {
    await db
      .update(diagnosticoResults)
      .set({ pdfBase64, email })
      .where(eq(diagnosticoResults.id, record.id));
  }
}

export async function deleteDiagnostico(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(diagnosticoResults).where(eq(diagnosticoResults.id, id));
}

export async function listDiagnosticosByEmail(email: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db
    .select({
      id: diagnosticoResults.id,
      nome: diagnosticoResults.nome,
      mediaP: diagnosticoResults.mediaP,
      mediaA: diagnosticoResults.mediaA,
      mediaG: diagnosticoResults.mediaG,
      mediaO: diagnosticoResults.mediaO,
      mediaGeral: diagnosticoResults.mediaGeral,
      pilarMaisFraco: diagnosticoResults.pilarMaisFraco,
      createdAt: diagnosticoResults.createdAt,
    })
    .from(diagnosticoResults)
    .where(eq(diagnosticoResults.email, email.toLowerCase()))
    .orderBy(diagnosticoResults.createdAt);
}

export async function exportAllDiagnosticos() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select({
    id: diagnosticoResults.id,
    nome: diagnosticoResults.nome,
    email: diagnosticoResults.email,
    answersP: diagnosticoResults.answersP,
    answersA: diagnosticoResults.answersA,
    answersG: diagnosticoResults.answersG,
    answersO: diagnosticoResults.answersO,
    mediaP: diagnosticoResults.mediaP,
    mediaA: diagnosticoResults.mediaA,
    mediaG: diagnosticoResults.mediaG,
    mediaO: diagnosticoResults.mediaO,
    mediaGeral: diagnosticoResults.mediaGeral,
    pilarMaisFraco: diagnosticoResults.pilarMaisFraco,
    status: diagnosticoResults.status,
    createdAt: diagnosticoResults.createdAt,
  }).from(diagnosticoResults).orderBy(desc(diagnosticoResults.createdAt));
}

export async function getDiagnosticoMetrics() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [totalResult] = await db
    .select({ total: count() })
    .from(diagnosticoResults);

  const statusCounts = await db
    .select({
      status: diagnosticoResults.status,
      count: count(),
    })
    .from(diagnosticoResults)
    .groupBy(diagnosticoResults.status);

  const statusMap: Record<string, number> = { new: 0, reviewed: 0, archived: 0 };
  for (const row of statusCounts) {
    statusMap[row.status] = row.count;
  }

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const [recentResult] = await db
    .select({ count: count() })
    .from(diagnosticoResults)
    .where(sql`${diagnosticoResults.createdAt} >= ${sevenDaysAgo}`);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const [monthResult] = await db
    .select({ count: count() })
    .from(diagnosticoResults)
    .where(sql`${diagnosticoResults.createdAt} >= ${thirtyDaysAgo}`);

  return {
    total: totalResult.total,
    new: statusMap.new,
    reviewed: statusMap.reviewed,
    archived: statusMap.archived,
    last7Days: recentResult.count,
    last30Days: monthResult.count,
  };
}

// ─── Organization Helpers ────────────────────────────────────────

export async function createOrganization(data: InsertOrganization): Promise<Organization> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [org] = await db.insert(organizations).values(data).returning();
  return org;
}

export async function getOrganizationById(id: number): Promise<Organization | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const [org] = await db.select().from(organizations).where(eq(organizations.id, id)).limit(1);
  return org;
}

export async function getOrganizationBySlug(slug: string): Promise<Organization | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const [org] = await db.select().from(organizations).where(eq(organizations.slug, slug)).limit(1);
  return org;
}

export async function listOrganizations(params: { search?: string; page: number; pageSize: number }) {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };
  const { search, page, pageSize } = params;
  const offset = (page - 1) * pageSize;

  const where = search
    ? or(like(organizations.name, `%${search}%`), like(organizations.slug, `%${search}%`))
    : undefined;

  const [items, [{ total }]] = await Promise.all([
    db.select().from(organizations).where(where).orderBy(desc(organizations.createdAt)).limit(pageSize).offset(offset),
    db.select({ total: count() }).from(organizations).where(where),
  ]);
  return { items, total };
}

export async function updateOrganization(id: number, data: Partial<InsertOrganization>): Promise<Organization | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const [org] = await db.update(organizations).set({ ...data, updatedAt: new Date() }).where(eq(organizations.id, id)).returning();
  return org;
}

export async function deleteOrganization(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  // Delete members first (cascade)
  await db.delete(orgMembers).where(eq(orgMembers.orgId, id));
  await db.delete(organizations).where(eq(organizations.id, id));
}

// ─── Org Member Helpers ──────────────────────────────────────────

export async function createOrgMember(data: InsertOrgMember): Promise<OrgMember> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [member] = await db.insert(orgMembers).values(data).returning();
  return member;
}

export async function getOrgMemberByUserAndOrg(userId: number, orgId: number): Promise<OrgMember | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const [member] = await db.select().from(orgMembers)
    .where(and(eq(orgMembers.userId, userId), eq(orgMembers.orgId, orgId)))
    .limit(1);
  return member;
}

export async function getOrgsByUserId(userId: number): Promise<{ orgId: number; orgName: string; orgSlug: string; orgLogo: string | null; memberRole: string }[]> {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.select({
    orgId: organizations.id,
    orgName: organizations.name,
    orgSlug: organizations.slug,
    orgLogo: organizations.logo,
    memberRole: orgMembers.role,
  }).from(orgMembers)
    .innerJoin(organizations, eq(orgMembers.orgId, organizations.id))
    .where(and(eq(orgMembers.userId, userId), eq(orgMembers.status, "active")));
  return rows;
}

export async function getOrgMemberByInviteToken(token: string): Promise<OrgMember | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const [member] = await db.select().from(orgMembers).where(eq(orgMembers.inviteToken, token)).limit(1);
  return member;
}

export async function listOrgMembers(orgId: number, params: { status?: string; role?: string; search?: string; page: number; pageSize: number }) {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };
  const { status, role, search, page, pageSize } = params;
  const offset = (page - 1) * pageSize;

  const conditions = [eq(orgMembers.orgId, orgId)];
  if (status) conditions.push(eq(orgMembers.status, status as any));
  if (role) conditions.push(eq(orgMembers.role, role as any));
  if (search) conditions.push(or(like(orgMembers.name, `%${search}%`), like(orgMembers.email, `%${search}%`))!);

  const where = and(...conditions);

  const [items, [{ total }]] = await Promise.all([
    db.select().from(orgMembers).where(where).orderBy(desc(orgMembers.createdAt)).limit(pageSize).offset(offset),
    db.select({ total: count() }).from(orgMembers).where(where),
  ]);
  return { items, total };
}

export async function updateOrgMember(id: number, data: Partial<InsertOrgMember>): Promise<OrgMember | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const [member] = await db.update(orgMembers).set({ ...data, updatedAt: new Date() }).where(eq(orgMembers.id, id)).returning();
  return member;
}

export async function getCorporateMetrics() {
  const db = await getDb();
  if (!db) return { totalOrgs: 0, totalMembers: 0, activeMembers: 0, invitedMembers: 0, totalDiagnostics: 0, pendingRequests: 0, totalUsers: 0 };

  const [[orgsResult], [membersResult], [diagResult], [requestsResult], [usersResult]] = await Promise.all([
    db.select({ count: count() }).from(organizations),
    db.select({
      total: count(),
      active: sql<number>`SUM(CASE WHEN ${orgMembers.status} = 'active' THEN 1 ELSE 0 END)`,
      invited: sql<number>`SUM(CASE WHEN ${orgMembers.status} = 'invited' THEN 1 ELSE 0 END)`,
    }).from(orgMembers),
    db.select({ count: count() }).from(corporateDiagnostics),
    db.select({ count: count() }).from(demoRequests).where(eq(demoRequests.status, "pending")),
    db.select({ count: count() }).from(users),
  ]);

  return {
    totalOrgs: orgsResult?.count ?? 0,
    totalMembers: membersResult?.total ?? 0,
    activeMembers: Number(membersResult?.active ?? 0),
    invitedMembers: Number(membersResult?.invited ?? 0),
    totalDiagnostics: diagResult?.count ?? 0,
    pendingRequests: requestsResult?.count ?? 0,
    totalUsers: usersResult?.count ?? 0,
  };
}

export async function getOrgStats(orgId: number) {
  const db = await getDb();
  if (!db) return { totalMembers: 0, activeMembers: 0, invitedMembers: 0, diagnosticsCount: 0, owner: null as { name: string | null; email: string } | null };

  const [members] = await db.select({
    total: count(),
    active: sql<number>`SUM(CASE WHEN ${orgMembers.status} = 'active' THEN 1 ELSE 0 END)`,
    invited: sql<number>`SUM(CASE WHEN ${orgMembers.status} = 'invited' THEN 1 ELSE 0 END)`,
  }).from(orgMembers).where(eq(orgMembers.orgId, orgId));

  const [diag] = await db.select({ count: count() }).from(corporateDiagnostics).where(eq(corporateDiagnostics.orgId, orgId));

  const [ownerRow] = await db.select({ name: orgMembers.name, email: orgMembers.email })
    .from(orgMembers)
    .where(and(eq(orgMembers.orgId, orgId), eq(orgMembers.role, "owner")))
    .limit(1);

  return {
    totalMembers: members?.total ?? 0,
    activeMembers: Number(members?.active ?? 0),
    invitedMembers: Number(members?.invited ?? 0),
    diagnosticsCount: diag?.count ?? 0,
    owner: ownerRow ?? null,
  };
}

export async function countActiveOrgMembers(orgId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const [{ total }] = await db.select({ total: count() }).from(orgMembers)
    .where(and(eq(orgMembers.orgId, orgId), eq(orgMembers.status, "active")));
  return total;
}

// ─── Questionnaire Helpers ───────────────────────────────────────

export async function getActiveQuestionnaire(type: "individual" | "corporate") {
  const db = await getDb();
  if (!db) return undefined;
  const [q] = await db.select().from(questionnaires)
    .where(and(eq(questionnaires.type, type), eq(questionnaires.isActive, true)))
    .orderBy(desc(questionnaires.version))
    .limit(1);
  return q;
}

// ─── Corporate Diagnostic Helpers ────────────────────────────────

export async function createCorporateDiagnostic(data: {
  orgId: number; memberId: number; questionnaireId: number;
  answersP: number[]; answersA: number[]; answersG: number[]; answersO: number[];
  mediaP: number; mediaA: number; mediaG: number; mediaO: number;
  mediaGeral: number; pilarMaisFraco: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(corporateDiagnostics).values(data).returning();
  return result;
}

export async function listCorporateDiagnosticsByMember(orgId: number, memberId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(corporateDiagnostics)
    .where(and(eq(corporateDiagnostics.orgId, orgId), eq(corporateDiagnostics.memberId, memberId)))
    .orderBy(desc(corporateDiagnostics.createdAt));
}

export async function getCompanyAverages(orgId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select({
    count: count(),
    avgP: sql<number>`AVG("mediaP")`,
    avgA: sql<number>`AVG("mediaA")`,
    avgG: sql<number>`AVG("mediaG")`,
    avgO: sql<number>`AVG("mediaO")`,
    avgGeral: sql<number>`AVG("mediaGeral")`,
  }).from(corporateDiagnostics).where(eq(corporateDiagnostics.orgId, orgId));
  return result[0];
}

// ─── Local Auth (Email + Password) ──────────────────────────────

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const [row] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return row;
}

export async function createLocalUser(data: { email: string; name: string; passwordHash: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const openId = `local:${data.email}`;
  const [row] = await db.insert(users).values({
    openId,
    email: data.email,
    name: data.name,
    passwordHash: data.passwordHash,
    loginMethod: "email",
  }).returning();
  return row;
}

export async function setResetToken(userId: number, token: string, expiresAt: Date) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(users).set({ resetToken: token, resetTokenExpiresAt: expiresAt }).where(eq(users.id, userId));
}

export async function getUserByResetToken(token: string) {
  const db = await getDb();
  if (!db) return undefined;
  const [row] = await db.select().from(users).where(eq(users.resetToken, token)).limit(1);
  return row;
}

export async function updatePasswordHash(userId: number, passwordHash: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(users).set({ passwordHash, resetToken: null, resetTokenExpiresAt: null }).where(eq(users.id, userId));
}

// ─── Demo Requests ──────────────────────────────────────────────

export async function createDemoRequest(data: Omit<InsertDemoRequest, "id" | "createdAt" | "status">): Promise<DemoRequest> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [row] = await db.insert(demoRequests).values(data).returning();
  return row;
}

export async function listDemoRequests(opts: { status?: string; page?: number; pageSize?: number }) {
  const db = await getDb();
  if (!db) return { rows: [], total: 0 };
  const page = opts.page ?? 1;
  const pageSize = opts.pageSize ?? 20;
  const offset = (page - 1) * pageSize;

  const conditions = opts.status ? eq(demoRequests.status, opts.status as "pending" | "contacted" | "closed") : undefined;

  const [totalResult] = await db.select({ count: count() }).from(demoRequests).where(conditions);
  const rows = await db.select().from(demoRequests).where(conditions).orderBy(desc(demoRequests.id)).limit(pageSize).offset(offset);

  return { rows, total: totalResult?.count ?? 0 };
}

export async function updateDemoRequestStatus(id: number, status: "pending" | "contacted" | "closed") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [row] = await db.update(demoRequests).set({ status }).where(eq(demoRequests.id, id)).returning();
  return row;
}

export async function listAllUsersWithOrgs(params: { search?: string; page: number; pageSize: number }) {
  const db = await getDb();
  if (!db) return { rows: [], total: 0 };
  const { search, page, pageSize } = params;
  const offset = (page - 1) * pageSize;

  const where = search
    ? or(like(users.name, `%${search}%`), like(users.email, `%${search}%`))
    : undefined;

  const [totalResult] = await db.select({ count: count() }).from(users).where(where);
  const userRows = await db.select().from(users).where(where).orderBy(desc(users.createdAt)).limit(pageSize).offset(offset);

  // Get org memberships for these users
  const userIds = userRows.map(u => u.id);
  const memberships = userIds.length > 0
    ? await db.select({
        userId: orgMembers.userId,
        orgId: orgMembers.orgId,
        orgName: organizations.name,
        orgSlug: organizations.slug,
        role: orgMembers.role,
        status: orgMembers.status,
      })
      .from(orgMembers)
      .innerJoin(organizations, eq(orgMembers.orgId, organizations.id))
      .where(sql`${orgMembers.userId} IN (${sql.join(userIds.map(id => sql`${id}`), sql`, `)})`)
    : [];

  const rows = userRows.map(u => ({
    ...u,
    passwordHash: undefined, // strip sensitive field
    orgs: memberships.filter(m => m.userId === u.id),
  }));

  return { rows, total: totalResult?.count ?? 0 };
}

export async function getDemoRequestById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const [row] = await db.select().from(demoRequests).where(eq(demoRequests.id, id)).limit(1);
  return row;
}

// ─── Purchase Helpers ───────────────────────────────────────────

export async function createPurchase(data: InsertPurchase): Promise<Purchase> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [row] = await db.insert(purchases).values(data).returning();
  return row;
}

export async function getPurchaseBySessionId(stripeSessionId: string): Promise<Purchase | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const [row] = await db.select().from(purchases).where(eq(purchases.stripeSessionId, stripeSessionId)).limit(1);
  return row;
}

export async function getPurchaseByToken(token: string): Promise<Purchase | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const [row] = await db.select().from(purchases).where(eq(purchases.downloadToken, token)).limit(1);
  return row;
}

export async function getPurchaseById(id: number): Promise<Purchase | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const [row] = await db.select().from(purchases).where(eq(purchases.id, id)).limit(1);
  return row;
}

export async function listPurchases(opts: {
  page?: number;
  pageSize?: number;
  productSlug?: string;
  status?: "pending" | "delivered" | "failed" | "refunded";
}): Promise<{ rows: Purchase[]; total: number }> {
  const db = await getDb();
  if (!db) return { rows: [], total: 0 };
  const page = Math.max(1, opts.page ?? 1);
  const pageSize = Math.min(200, Math.max(1, opts.pageSize ?? 50));
  const conditions = [] as Array<ReturnType<typeof eq>>;
  if (opts.productSlug) conditions.push(eq(purchases.productSlug, opts.productSlug));
  if (opts.status) conditions.push(eq(purchases.status, opts.status));
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  const rows = await db.select().from(purchases)
    .where(whereClause)
    .orderBy(desc(purchases.createdAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize);
  const [totalRow] = await db.select({ count: count() }).from(purchases).where(whereClause);
  return { rows, total: totalRow?.count ?? 0 };
}

export async function markPurchaseDelivered(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(purchases).set({ status: "delivered", deliveredAt: new Date() }).where(eq(purchases.id, id));
}

export async function markPurchaseFailed(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(purchases).set({ status: "failed" }).where(eq(purchases.id, id));
}

export async function markPurchaseRefunded(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(purchases).set({ status: "refunded" }).where(eq(purchases.id, id));
}

export async function getPurchaseByPaymentIntent(paymentIntentId: string): Promise<Purchase | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const [row] = await db.select().from(purchases).where(eq(purchases.stripePaymentIntentId, paymentIntentId)).limit(1);
  return row;
}

export async function incrementPurchaseDownloadCount(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(purchases).set({ downloadCount: sql`${purchases.downloadCount} + 1` }).where(eq(purchases.id, id));
}

export async function regeneratePurchaseToken(id: number, newToken: string, newExpiresAt: Date): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(purchases).set({
    downloadToken: newToken,
    downloadCount: 0,
    tokenExpiresAt: newExpiresAt,
  }).where(eq(purchases.id, id));
}

export async function revokePurchaseToken(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(purchases).set({ downloadToken: null, tokenExpiresAt: null }).where(eq(purchases.id, id));
}

export async function getPurchaseMetrics(opts: {
  productSlug?: string;
  status?: "pending" | "delivered" | "failed" | "refunded";
} = {}): Promise<{
  totalCount: number;
  deliveredCount: number;
  refundedCount: number;
  failedCount: number;
  grossRevenueCents: number;
  netRevenueCents: number;
  refundedRevenueCents: number;
  avgTicketCents: number;
  last7dCount: number;
  last7dRevenueCents: number;
  last30dCount: number;
  last30dRevenueCents: number;
  todayCount: number;
  todayRevenueCents: number;
  byProduct: { productSlug: string; count: number; revenueCents: number }[];
  byLanguage: { language: string; count: number }[];
  byStatus: { status: string; count: number }[];
}> {
  const db = await getDb();
  const empty = {
    totalCount: 0, deliveredCount: 0, refundedCount: 0, failedCount: 0,
    grossRevenueCents: 0, netRevenueCents: 0, refundedRevenueCents: 0,
    avgTicketCents: 0, last7dCount: 0, last7dRevenueCents: 0, last30dCount: 0,
    last30dRevenueCents: 0, todayCount: 0, todayRevenueCents: 0,
    byProduct: [], byLanguage: [], byStatus: [],
  };
  if (!db) return empty;

  const conditions = [] as Array<ReturnType<typeof eq>>;
  if (opts.productSlug) conditions.push(eq(purchases.productSlug, opts.productSlug));
  if (opts.status) conditions.push(eq(purchases.status, opts.status));
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const d7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const d30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Count-only per status (independent of status filter)
  const baseConditions = [] as Array<ReturnType<typeof eq>>;
  if (opts.productSlug) baseConditions.push(eq(purchases.productSlug, opts.productSlug));
  const baseWhere = baseConditions.length > 0 ? and(...baseConditions) : undefined;

  const [totalRow] = await db.select({
    count: count(),
    revenue: sql<number>`COALESCE(SUM(${purchases.amountCents}), 0)`,
  }).from(purchases).where(baseWhere);

  const [deliveredRow] = await db.select({
    count: count(),
    revenue: sql<number>`COALESCE(SUM(${purchases.amountCents}), 0)`,
  }).from(purchases).where(and(baseWhere, eq(purchases.status, "delivered")) as never);

  const [refundedRow] = await db.select({
    count: count(),
    revenue: sql<number>`COALESCE(SUM(${purchases.amountCents}), 0)`,
  }).from(purchases).where(and(baseWhere, eq(purchases.status, "refunded")) as never);

  const [failedRow] = await db.select({
    count: count(),
  }).from(purchases).where(and(baseWhere, eq(purchases.status, "failed")) as never);

  const [todayRow] = await db.select({
    count: count(),
    revenue: sql<number>`COALESCE(SUM(${purchases.amountCents}), 0)`,
  }).from(purchases).where(and(whereClause, eq(purchases.status, "delivered"), sql`${purchases.createdAt} >= ${startOfToday}`) as never);

  const [d7Row] = await db.select({
    count: count(),
    revenue: sql<number>`COALESCE(SUM(${purchases.amountCents}), 0)`,
  }).from(purchases).where(and(whereClause, eq(purchases.status, "delivered"), sql`${purchases.createdAt} >= ${d7}`) as never);

  const [d30Row] = await db.select({
    count: count(),
    revenue: sql<number>`COALESCE(SUM(${purchases.amountCents}), 0)`,
  }).from(purchases).where(and(whereClause, eq(purchases.status, "delivered"), sql`${purchases.createdAt} >= ${d30}`) as never);

  const byProductRows = await db.select({
    productSlug: purchases.productSlug,
    count: count(),
    revenueCents: sql<number>`COALESCE(SUM(${purchases.amountCents}) FILTER (WHERE ${purchases.status} = 'delivered'), 0)`,
  }).from(purchases).where(whereClause).groupBy(purchases.productSlug);

  const byLanguageRows = await db.select({
    language: purchases.language,
    count: count(),
  }).from(purchases)
    .where(and(whereClause, eq(purchases.productSlug, "ebook")) as never)
    .groupBy(purchases.language);

  const byStatusRows = await db.select({
    status: purchases.status,
    count: count(),
  }).from(purchases).where(baseWhere).groupBy(purchases.status);

  const totalCount = totalRow?.count ?? 0;
  const grossRevenueCents = Number(totalRow?.revenue ?? 0);
  const deliveredRevenueCents = Number(deliveredRow?.revenue ?? 0);
  const refundedRevenueCents = Number(refundedRow?.revenue ?? 0);
  const deliveredCount = deliveredRow?.count ?? 0;

  return {
    totalCount,
    deliveredCount,
    refundedCount: refundedRow?.count ?? 0,
    failedCount: failedRow?.count ?? 0,
    grossRevenueCents,
    netRevenueCents: deliveredRevenueCents,
    refundedRevenueCents,
    avgTicketCents: deliveredCount > 0 ? Math.round(deliveredRevenueCents / deliveredCount) : 0,
    last7dCount: d7Row?.count ?? 0,
    last7dRevenueCents: Number(d7Row?.revenue ?? 0),
    last30dCount: d30Row?.count ?? 0,
    last30dRevenueCents: Number(d30Row?.revenue ?? 0),
    todayCount: todayRow?.count ?? 0,
    todayRevenueCents: Number(todayRow?.revenue ?? 0),
    byProduct: byProductRows.map(r => ({
      productSlug: r.productSlug,
      count: r.count,
      revenueCents: Number(r.revenueCents),
    })),
    byLanguage: byLanguageRows
      .filter(r => r.language !== null)
      .map(r => ({ language: r.language!, count: r.count })),
    byStatus: byStatusRows.map(r => ({ status: r.status, count: r.count })),
  };
}

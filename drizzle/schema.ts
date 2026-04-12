import { pgTable, pgEnum, serial, varchar, text, timestamp, integer, bigint, json, real, boolean } from "drizzle-orm/pg-core";

// ─── Enums ───────────────────────────────────────────────────────
export const roleEnum = pgEnum("role", ["user", "admin"]);
export const inscriptionStatusEnum = pgEnum("inscription_status", [
  "pending",
  "contacted",
  "enrolled",
  "rejected",
]);
export const diagnosticoStatusEnum = pgEnum("diagnostico_status", [
  "new",
  "reviewed",
  "archived",
]);
export const demoRequestStatusEnum = pgEnum("demo_request_status", [
  "pending",
  "contacted",
  "closed",
]);

/**
 * Core user table backing auth flow.
 */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  passwordHash: varchar("passwordHash", { length: 255 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  resetToken: varchar("resetToken", { length: 64 }),
  resetTokenExpiresAt: timestamp("resetTokenExpiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Mentoria inscriptions — captures leads from the CTA form.
 */
export const mentoriaInscriptions = pgTable("mentoria_inscriptions", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 30 }),
  message: text("message"),
  status: inscriptionStatusEnum("status").default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type MentoriaInscription = typeof mentoriaInscriptions.$inferSelect;
export type InsertMentoriaInscription = typeof mentoriaInscriptions.$inferInsert;

/**
 * File storage metadata — tracks files uploaded to S3.
 */
export const files = pgTable("files", {
  id: serial("id").primaryKey(),
  /** S3 object key */
  fileKey: varchar("fileKey", { length: 512 }).notNull(),
  /** Public URL returned by S3 */
  url: text("url").notNull(),
  /** Original filename */
  filename: varchar("filename", { length: 255 }).notNull(),
  /** MIME type */
  mimeType: varchar("mimeType", { length: 128 }),
  /** File size in bytes */
  size: bigint("size", { mode: "number" }),
  /** Category for organizing files (e.g., ebook, kit, material) */
  category: varchar("category", { length: 64 }),
  /** Optional description */
  description: text("description"),
  /** Who uploaded the file (references users.id) */
  uploadedBy: integer("uploadedBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type FileRecord = typeof files.$inferSelect;
export type InsertFileRecord = typeof files.$inferInsert;

/**
 * Site settings — key-value store for dynamic site configuration (e.g., image URLs).
 */
export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 128 }).notNull().unique(),
  value: text("value").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type SiteSetting = typeof siteSettings.$inferSelect;

/**
 * Diagnostico P.A.G.O. results — stores completed questionnaire submissions.
 */
export const diagnosticoResults = pgTable("diagnostico_results", {
  id: serial("id").primaryKey(),
  nome: varchar("nome", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  answersP: json("answersP").$type<number[]>().notNull(),
  answersA: json("answersA").$type<number[]>().notNull(),
  answersG: json("answersG").$type<number[]>().notNull(),
  answersO: json("answersO").$type<number[]>().notNull(),
  mediaP: real("mediaP").notNull(),
  mediaA: real("mediaA").notNull(),
  mediaG: real("mediaG").notNull(),
  mediaO: real("mediaO").notNull(),
  mediaGeral: real("mediaGeral").notNull(),
  pilarMaisFraco: varchar("pilarMaisFraco", { length: 1 }).notNull(),
  pdfBase64: text("pdfBase64"),
  status: diagnosticoStatusEnum("status").default("new").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DiagnosticoResult = typeof diagnosticoResults.$inferSelect;
export type InsertDiagnosticoResult = typeof diagnosticoResults.$inferInsert;

// ─── Corporate Module ─────────────────────────────────────────────

export const orgStatusEnum = pgEnum("org_status", ["active", "suspended", "trial"]);
export const orgMemberRoleEnum = pgEnum("org_member_role", ["owner", "hr_admin", "hr_viewer", "employee"]);
export const orgMemberStatusEnum = pgEnum("org_member_status", ["invited", "active", "deactivated"]);
export const questionnaireTypeEnum = pgEnum("questionnaire_type", ["individual", "corporate"]);

/**
 * Organizations — each company/tenant in the corporate module.
 */
export const organizations = pgTable("organizations", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  cnpj: varchar("cnpj", { length: 18 }),
  logo: text("logo"),
  status: orgStatusEnum("status").default("trial").notNull(),
  maxMembers: integer("maxMembers").default(50).notNull(),
  privacyMinResponses: integer("privacyMinResponses").default(5).notNull(),
  privacyShowIndividual: boolean("privacyShowIndividual").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Organization = typeof organizations.$inferSelect;
export type InsertOrganization = typeof organizations.$inferInsert;

/**
 * Organization members — join table between users and organizations.
 */
export const orgMembers = pgTable("org_members", {
  id: serial("id").primaryKey(),
  orgId: integer("orgId").notNull().references(() => organizations.id),
  userId: integer("userId").references(() => users.id),
  email: varchar("email", { length: 320 }).notNull(),
  name: varchar("name", { length: 255 }),
  role: orgMemberRoleEnum("role").default("employee").notNull(),
  status: orgMemberStatusEnum("status").default("invited").notNull(),
  inviteToken: varchar("inviteToken", { length: 64 }).unique(),
  inviteExpiresAt: timestamp("inviteExpiresAt"),
  consentGivenAt: timestamp("consentGivenAt"),
  department: varchar("department", { length: 128 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type OrgMember = typeof orgMembers.$inferSelect;
export type InsertOrgMember = typeof orgMembers.$inferInsert;

/**
 * Questionnaires — configurable question sets (individual + corporate).
 */
export const questionnaires = pgTable("questionnaires", {
  id: serial("id").primaryKey(),
  type: questionnaireTypeEnum("type").notNull(),
  version: integer("version").default(1).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  questions: json("questions").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Questionnaire = typeof questionnaires.$inferSelect;
export type InsertQuestionnaire = typeof questionnaires.$inferInsert;

/**
 * Corporate diagnostic results — stores completed corporate questionnaire submissions.
 */
export const corporateDiagnostics = pgTable("corporate_diagnostics", {
  id: serial("id").primaryKey(),
  orgId: integer("orgId").notNull().references(() => organizations.id),
  memberId: integer("memberId").references(() => orgMembers.id),
  questionnaireId: integer("questionnaireId").notNull().references(() => questionnaires.id),
  answersP: json("answersP").$type<number[]>().notNull(),
  answersA: json("answersA").$type<number[]>().notNull(),
  answersG: json("answersG").$type<number[]>().notNull(),
  answersO: json("answersO").$type<number[]>().notNull(),
  mediaP: real("mediaP").notNull(),
  mediaA: real("mediaA").notNull(),
  mediaG: real("mediaG").notNull(),
  mediaO: real("mediaO").notNull(),
  mediaGeral: real("mediaGeral").notNull(),
  pilarMaisFraco: varchar("pilarMaisFraco", { length: 1 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── Demo Requests (Corporate) ──────────────────────────────────
export const demoRequests = pgTable("demo_requests", {
  id: serial("id").primaryKey(),
  companyName: varchar("companyName", { length: 255 }).notNull(),
  contactName: varchar("contactName", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 40 }).notNull(),
  employeeRange: varchar("employeeRange", { length: 20 }).notNull(),
  message: text("message"),
  status: demoRequestStatusEnum("status").default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type DemoRequest = typeof demoRequests.$inferSelect;
export type InsertDemoRequest = typeof demoRequests.$inferInsert;

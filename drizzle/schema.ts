import { pgTable, pgEnum, serial, varchar, text, timestamp, integer, bigint, json, real } from "drizzle-orm/pg-core";

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

/**
 * Core user table backing auth flow.
 */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
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
  status: diagnosticoStatusEnum("status").default("new").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DiagnosticoResult = typeof diagnosticoResults.$inferSelect;
export type InsertDiagnosticoResult = typeof diagnosticoResults.$inferInsert;

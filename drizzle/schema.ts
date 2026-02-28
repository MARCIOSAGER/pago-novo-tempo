import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, bigint } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Mentoria inscriptions — captures leads from the CTA form.
 */
export const mentoriaInscriptions = mysqlTable("mentoria_inscriptions", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 30 }),
  message: text("message"),
  status: mysqlEnum("status", ["pending", "contacted", "enrolled", "rejected"])
    .default("pending")
    .notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MentoriaInscription = typeof mentoriaInscriptions.$inferSelect;
export type InsertMentoriaInscription = typeof mentoriaInscriptions.$inferInsert;

/**
 * File storage metadata — tracks files uploaded to S3.
 */
export const files = mysqlTable("files", {
  id: int("id").autoincrement().primaryKey(),
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
  uploadedBy: int("uploadedBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FileRecord = typeof files.$inferSelect;
export type InsertFileRecord = typeof files.$inferInsert;

/**
 * Downloads — managed download links for ebooks and materials.
 */
export const downloads = mysqlTable("downloads", {
  id: int("id").autoincrement().primaryKey(),
  /** URL-friendly identifier (e.g., "ebook-pdf", "ebook-kids-pdf") */
  slug: varchar("slug", { length: 128 }).notNull().unique(),
  /** Display title */
  title: varchar("title", { length: 255 }).notNull(),
  /** Short description */
  description: text("description"),
  /** File format label (e.g., PDF, EPUB, MOBI, HTML5) */
  format: varchar("format", { length: 32 }).notNull(),
  /** Human-readable file size (e.g., "14 MB") */
  fileSize: varchar("fileSize", { length: 32 }),
  /** The actual download URL (S3 or CDN) */
  url: text("url").notNull(),
  /** Download filename sent to the browser */
  filename: varchar("filename", { length: 255 }).notNull(),
  /** Category grouping (e.g., "ebook", "kids", "material") */
  category: varchar("category", { length: 64 }).notNull().default("ebook"),
  /** Optional badge text (e.g., "Recomendado", "Novo") */
  badge: varchar("badge", { length: 64 }),
  /** Badge variant for styling */
  badgeVariant: varchar("badgeVariant", { length: 32 }),
  /** Sort order within category */
  sortOrder: int("sortOrder").notNull().default(0),
  /** Whether this download is active/visible */
  active: mysqlEnum("active", ["yes", "no"]).default("yes").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DownloadRecord = typeof downloads.$inferSelect;
export type InsertDownloadRecord = typeof downloads.$inferInsert;

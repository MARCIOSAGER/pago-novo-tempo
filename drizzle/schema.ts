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

import { int, sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const usersTable = sqliteTable("users", {
  id: int().primaryKey({ autoIncrement: true }),
  username: text().notNull().unique(),
  apiKey: text().notNull().unique(),
});

export const appsTable = sqliteTable("apps", {
  id: int().primaryKey({ autoIncrement: true }),
  userId: int()
    .notNull()
    .references(() => usersTable.id),
  name: text().notNull(),
  publicMetadata: integer({ mode: "boolean" }).notNull().default(false),
  publicDownload: integer({ mode: "boolean" }).notNull().default(false),
});

export const versionsTable = sqliteTable("versions", {
  id: int().primaryKey({ autoIncrement: true }),
  appId: int()
    .notNull()
    .references(() => appsTable.id),
  version: text().notNull(),
  changelog: text().notNull().default(""),
  createdAt: integer({ mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const artifactsTable = sqliteTable("artifacts", {
  id: int().primaryKey({ autoIncrement: true }),
  versionId: int()
    .notNull()
    .references(() => versionsTable.id),
  name: text().notNull(),
  platform: text().notNull(),
  fileName: text(),
});

export const itchIOTable = sqliteTable("itchIO", {
  id: int().primaryKey({ autoIncrement: true }),
  appId: int()
    .notNull()
    .references(() => appsTable.id),
  buttlerKey: text().notNull(),
  itchIOUsername: text().notNull(),
  itchIOGameName: text().notNull(),
});

export const deploysTable = sqliteTable("deploys", {
  id: int().primaryKey({ autoIncrement: true }),
  appId: int()
    .notNull()
    .references(() => appsTable.id),
  versionId: int()
    .notNull()
    .references(() => versionsTable.id),
  status: text().notNull(),
  createdAt: integer({ mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  targetService: text().notNull(),
  platform: text().notNull(),
});

export const deployLogsTable = sqliteTable("deployLogs", {
  id: int().primaryKey({ autoIncrement: true }),
  deployId: int()
    .notNull()
    .references(() => deploysTable.id),
  log: text().notNull(),
  createdAt: integer({ mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const newsTable = sqliteTable("news", {
  id: int().primaryKey({ autoIncrement: true }),
  title: text().notNull(),
  appId: int()
    .notNull()
    .references(() => appsTable.id),
  content: text().notNull(),
  createdAt: integer({ mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});
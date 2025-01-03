import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

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
});

export const versionsTable = sqliteTable("versions", {
  id: int().primaryKey({ autoIncrement: true }),
  appId: int()
    .notNull()
    .references(() => appsTable.id),
  version: text().notNull(),
});

export const artifactsTable = sqliteTable("artifacts", {
  id: int().primaryKey({ autoIncrement: true }),
  versionId: int()
    .notNull()
    .references(() => versionsTable.id),
  name: text().notNull(),
  platform: text().notNull(),
});

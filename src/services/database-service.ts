import { getContext } from "hono/context-storage";
import { drizzle, DrizzleD1Database } from "drizzle-orm/d1";
import * as schema from "../db/schema";
import { HonoContext, AppContext } from "../types";

export function getDatabaseService(): DrizzleD1Database<typeof schema> {
  return getContext<HonoContext>().var.databaseService;
}

export function setDatabaseService(c: AppContext) {
  c.set("databaseService", createDatabaseService(c.env.DB));
}

export function createDatabaseService(db: D1Database) {
  return drizzle(db, {
    schema,
  });
}

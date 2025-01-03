import { eq } from "drizzle-orm";

import { getContext } from "hono/context-storage";
import { AppContext, HonoContext } from "../types";
import { getDatabaseService } from "./database-service";
import { usersTable } from "../db/schema";

export type Version = {
  id: number;
  appId: number;
  version: string;
};

export type VersionService = {};

export function getVersionService(): VersionService {
  return getContext<HonoContext>().var.versionService;
}

export function setUserService(c: AppContext) {
  c.set("userService", createUserService());
}

function mapUser(user: any): User {
  return {
    id: user.id,
    username: user.username,
  };
}

function createUserService(): UserService {
  return {
    findByApiKey: async (apiKey) => {
      const users = await getDatabaseService()
        .select()
        .from(usersTable)
        .where(eq(usersTable.apiKey, apiKey));

      if (users.length > 0) {
        return mapUser(users[0]);
      }

      return null;
    },
  };
}

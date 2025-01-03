import { eq } from "drizzle-orm";
import { getContext } from "hono/context-storage";
import { AppContext, HonoContext } from "../types";
import { getDatabaseService } from "./database-service";
import { appsTable, versionsTable } from "../db/schema";

export type App = {
  id: number;
  name: string;
  userId: number;
};

export type Version = {
  id: number;
  appId: number;
  version: string;
};

export type AppService = {
  createVersion: (opts: {
    appId: number;
    versionName: string;
  }) => Promise<void>;
  findById: (id: number) => Promise<App | null>;
  listVersions: (appId: number) => Promise<Version[]>;
};

export function getAppService(): AppService {
  return getContext<HonoContext>().var.appService;
}

export function setAppService(c: AppContext) {
  c.set("appService", createAppService());
}

function mapVersion(version: any): Version {
  return {
    id: version.id,
    appId: version.appId,
    version: version.version,
  };
}

function mapApp(app: any): App {
  return {
    id: app.id,
    name: app.name,
    userId: app.userId,
  };
}

function createAppService(): AppService {
  return {
    createVersion: async ({ appId, versionName }) => {
      await getDatabaseService().insert(versionsTable).values({
        appId: appId,
        version: versionName,
      });
    },
    findById: async (id) => {
      const apps = await getDatabaseService()
        .select()
        .from(appsTable)
        .where(eq(appsTable.id, id));

      if (apps.length > 0) {
        return mapApp(apps[0]);
      }

      return null;
    },
    listVersions: async (appId) => {
      const versions = await getDatabaseService()
        .select()
        .from(versionsTable)
        .where(eq(versionsTable.appId, appId));

      return versions.map(mapVersion);
    },
  };
}

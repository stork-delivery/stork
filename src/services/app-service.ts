import { eq, and } from "drizzle-orm";
import { getContext } from "hono/context-storage";
import { AppContext, HonoContext } from "../types";
import { getDatabaseService } from "./database-service";
import { appsTable, artifactsTable, versionsTable } from "../db/schema";
import { getStorageService } from "./storage-service";

export type App = {
  id: number;
  name: string;
  userId: number;
  publicMetadata: boolean;
};

export type Version = {
  id: number;
  appId: number;
  version: string;
  changelog: string;
};

export type Artifact = {
  id: number;
  versionId: number;
  name: string;
  platform: string;
};

export type AppService = {
  createVersion: (opts: {
    appId: number;
    versionName: string;
    changelog: string;
  }) => Promise<void>;
  updateVersionChangelog: (opts: {
    appId: number;
    versionName: string;
    changelog: string;
  }) => Promise<void>;
  createArtifact: (opts: {
    appId: number;
    versionName: string;
    versionId: number;
    platform: string;
    stream: ReadableStream;
  }) => Promise<void>;
  findArtifactByName: (name: string) => Promise<Artifact | null>;

  findById: (id: number) => Promise<App | null>;
  listVersions: (appId: number) => Promise<Version[]>;
  findVersionByNameAndAppId: (
    versionName: string,
    appId: number,
  ) => Promise<Version | null>;
  listVersionArtifacts: (
    appId: number,
    versionName: string,
  ) => Promise<Artifact[]>;
  findVersionArtifact: (
    appId: number,
    versionName: string,
    platform: string,
  ) => Promise<Artifact | null>;
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
    changelog: version.changelog,
  };
}

function mapApp(app: any): App {
  return {
    id: app.id,
    name: app.name,
    userId: app.userId,
    publicMetadata: app.publicMetadata,
  };
}

function mapArtifact(artifact: any): Artifact {
  return {
    id: artifact.id,
    versionId: artifact.versionId,
    name: artifact.name,
    platform: artifact.platform,
  };
}

function createAppService(): AppService {
  const service: AppService = {
    createVersion: async ({ appId, versionName, changelog }) => {
      const appService = getAppService();

      const existingVersion = await appService.findVersionByNameAndAppId(
        versionName,
        appId,
      );

      if (existingVersion != null) {
        throw new Error("Version already exists");
      }

      const dbService = getDatabaseService();
      await dbService.insert(versionsTable).values({
        appId: appId,
        version: versionName,
        changelog: changelog,
      });
    },
    updateVersionChangelog: async ({ appId, versionName, changelog }) => {
      await getDatabaseService()
        .update(versionsTable)
        .set({ changelog: changelog })
        .where(
          and(
            eq(versionsTable.appId, appId),
            eq(versionsTable.version, versionName),
          ),
        );
    },
    createArtifact: async ({
      appId,
      versionName,
      versionId,
      platform,
      stream,
    }) => {
      const artifactKey = `${appId}-${versionName}-${platform}`;

      const existingArtifact = await service.findArtifactByName(artifactKey);

      if (existingArtifact != null) {
        throw new Error("Artifact already exists");
      }

      await getStorageService().put(artifactKey, stream);

      await getDatabaseService().insert(artifactsTable).values({
        versionId: versionId,
        name: artifactKey,
        platform: platform,
      });
    },
    findArtifactByName: async (name) => {
      const artifacts = await getDatabaseService()
        .select()
        .from(artifactsTable)
        .where(eq(artifactsTable.name, name));

      if (artifacts.length > 0) {
        return mapArtifact(artifacts[0]);
      }

      return null;
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
    listVersionArtifacts: async (appId, versionName) => {
      const databaseService = getDatabaseService();
      const version = await service.findVersionByNameAndAppId(
        versionName,
        appId,
      );

      if (!version) {
        return [];
      }

      const artifacts = await databaseService
        .select()
        .from(artifactsTable)
        .where(eq(artifactsTable.versionId, version.id));

      return artifacts.map(mapArtifact);
    },
    findVersionByNameAndAppId: async (versionName, appId) => {
      const versions = await getDatabaseService()
        .select()
        .from(versionsTable)
        .where(
          and(
            eq(versionsTable.version, versionName),
            eq(versionsTable.appId, appId),
          ),
        );

      if (versions.length > 0) {
        return mapVersion(versions[0]);
      }

      return null;
    },
    findVersionArtifact: async (appId, versionName, platform) => {
      const version = await service.findVersionByNameAndAppId(
        versionName,
        appId,
      );

      if (!version) {
        return null;
      }

      const artifacts = await getDatabaseService()
        .select()
        .from(artifactsTable)
        .where(
          and(
            eq(artifactsTable.versionId, version.id),
            eq(artifactsTable.platform, platform),
          ),
        );

      if (artifacts.length > 0) {
        return mapArtifact(artifacts[0]);
      }

      return null;
    },
  };

  return service;
}

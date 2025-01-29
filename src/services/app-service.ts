import { eq, and, desc } from "drizzle-orm";
import { getContext } from "hono/context-storage";
import { AppContext, HonoContext } from "../types";
import { getDatabaseService } from "./database-service";
import {
  appsTable,
  artifactsTable,
  versionsTable,
  itchIOTable,
  deploysTable,
  deployLogsTable,
  newsTable,
} from "../db/schema";
import { getStorageService } from "./storage-service";

export type App = {
  id: number;
  name: string;
  userId: number;
  publicMetadata: boolean;
  publicDownload: boolean;
};

export type AppNews = {
  id: number;
  title: string;
  appId: number;
  content: string;
  createdAt: Date;
};

export type Version = {
  id: number;
  appId: number;
  version: string;
  changelog: string;
  createdAt: Date;
};

export type Artifact = {
  id: number;
  versionId: number;
  name: string;
  platform: string;
  fileName?: string;
};

export type ItchIOData = {
  id: number;
  appId: number;
  buttlerKey: string;
  itchIOUsername: string;
  itchIOGameName: string;
};

export type Deploy = {
  id: number;
  appId: number;
  versionId: number;
  status: string;
  createdAt: Date;
  targetService: string;
  platform: string;
};

export type DeployLog = {
  id: number;
  deployId: number;
  log: string;
  createdAt: Date;
};

export type AppService = {

  createAppNews: (opts: {
    title: string;
    appId: number;
    content: string;
  }) => Promise<AppNews>;
  updateAppNews: (opts: {
    id: number;
    title: string;
    content: string;
    appId: number
  }) => Promise<AppNews>;
  getAppNews: (opts: { id: number, appId: number }) => Promise<AppNews | null>;
  listAppNews: (opts: { appId: number, page: number, perPage: number }) => Promise<AppNews[]>;
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
  updateArtifactFileName: (
    artifactId: number,
    fileName: string,
  ) => Promise<void>;
  upsertItchIOData: (data: Omit<ItchIOData, "id">) => Promise<ItchIOData>;
  findItchIOData: (appId: number) => Promise<ItchIOData | null>;

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
  listAll: (userId: number) => Promise<App[]>;
  createApp: (
    userId: number,
    data: { name: string; publicMetadata: boolean },
  ) => Promise<App>;
  updateApp: (
    id: number,
    data: { name?: string; publicMetadata?: boolean },
  ) => Promise<App>;
  removeApp: (id: number) => Promise<void>;
  createDeploy: (opts: {
    appId: number;
    versionId: number;
    targetService: string;
    platform: string;
    status: string;
  }) => Promise<Deploy>;
  findDeployByAppIdAndVersionId: (
    appId: number,
    versionId: number,
  ) => Promise<Deploy | null>;
  listDeploys: (appId: number) => Promise<Deploy[]>;
  createDeployLog: (opts: {
    deployId: number;
    log: string;
  }) => Promise<void>;
  listDeployLogs: (deployId: number) => Promise<DeployLog[]>;
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
    createdAt: version.createdAt,
  };
}

function mapApp(app: any): App {
  return {
    id: app.id,
    name: app.name,
    userId: app.userId,
    publicMetadata: app.publicMetadata,
    publicDownload: app.publicDownload,
  };
}

function mapNews(news: any): AppNews {
  return {
    id: news.id,
    title: news.title,
    appId: news.appId,
    content: news.content,
    createdAt: news.createdAt,
  };
}

function mapArtifact(artifact: any): Artifact {
  return {
    id: artifact.id,
    versionId: artifact.versionId,
    name: artifact.name,
    platform: artifact.platform,
    fileName: artifact.fileName,
  };
}

function mapDeploy(deploy: any): Deploy {
  return {
    id: deploy.id,
    appId: deploy.appId,
    versionId: deploy.versionId,
    status: deploy.status,
    createdAt: deploy.createdAt,
    targetService: deploy.targetService,
    platform: deploy.platform,
  };
}

function mapDeployLog(log: any): DeployLog {
  return {
    id: log.id,
    deployId: log.deployId,
    log: log.log,
    createdAt: log.createdAt,
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
    createAppNews: async ({ title, appId, content }) => {
      const dbService = getDatabaseService();
      const [news] = await dbService.insert(newsTable).values({
        title,
        appId,
        content,
      }).returning();
      return mapNews(news);
    },
    listAppNews: async ({ appId, page, perPage }) => {
      const dbService = getDatabaseService();
      const news = await dbService
        .select()
        .from(newsTable)
        .where(eq(newsTable.appId, appId))
        .orderBy(desc(newsTable.createdAt))
        .limit(perPage)
        .offset((page - 1) * perPage);

      return news.map(mapNews);
    },
    getAppNews: async ({ id, appId }) => {
      const dbService = getDatabaseService();
      const news = await dbService.select().from(newsTable).where(
        and(
          eq(newsTable.id, id),
          eq(newsTable.appId, appId)
        ),
      );
      if (news.length === 0) {
        return null;
      }
      return mapNews(news[0]);
    },
    updateAppNews: async ({ id, title, content, appId }) => {
      const dbService = getDatabaseService();
      const [news] = await dbService
        .update(newsTable)
        .set({ title, content })
        .where(
          and(
            eq(newsTable.id, id),
            eq(newsTable.appId, appId),
          ),)
        .returning();

      return mapNews(news);
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
        .where(eq(versionsTable.appId, appId))
        .orderBy(desc(versionsTable.createdAt));

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
    listAll: async (userId: number) => {
      const apps = await getDatabaseService()
        .select()
        .from(appsTable)
        .where(eq(appsTable.userId, userId));

      return apps.map(mapApp);
    },
    async createApp(
      userId: number,
      data: { name: string; publicMetadata: boolean },
    ): Promise<App> {
      const db = getDatabaseService();
      const [app] = await db
        .insert(appsTable)
        .values({
          name: data.name,
          userId: userId,
          publicMetadata: data.publicMetadata,
        })
        .returning();
      return mapApp(app);
    },

    async updateApp(
      id: number,
      data: { name?: string; publicMetadata?: boolean },
    ): Promise<App> {
      const db = getDatabaseService();
      const [app] = await db
        .update(appsTable)
        .set(data)
        .where(eq(appsTable.id, id))
        .returning();
      return mapApp(app);
    },

    async removeApp(id: number): Promise<void> {
      const db = getDatabaseService();
      await db.delete(appsTable).where(eq(appsTable.id, id));
    },
    async updateArtifactFileName(artifactId: number, fileName: string) {
      const db = getDatabaseService();
      await db
        .update(artifactsTable)
        .set({ fileName })
        .where(eq(artifactsTable.id, artifactId));
    },
    async upsertItchIOData(data: Omit<ItchIOData, "id">) {
      const db = getDatabaseService();

      const existing = await db.query.itchIOTable.findFirst({
        where: eq(itchIOTable.appId, data.appId),
      });

      if (existing) {
        await db
          .update(itchIOTable)
          .set({
            buttlerKey: data.buttlerKey,
            itchIOUsername: data.itchIOUsername,
            itchIOGameName: data.itchIOGameName,
          })
          .where(eq(itchIOTable.id, existing.id));

        return {
          id: existing.id,
          ...data,
        };
      }

      const result = await db
        .insert(itchIOTable)
        .values(data)
        .returning({ id: itchIOTable.id });

      return {
        id: result[0].id,
        ...data,
      };
    },
    async findItchIOData(appId: number) {
      const db = getDatabaseService();
      const data = await db.query.itchIOTable.findFirst({
        where: eq(itchIOTable.appId, appId),
      });

      if (!data) {
        return null;
      }

      return {
        id: data.id,
        appId: data.appId,
        buttlerKey: data.buttlerKey,
        itchIOUsername: data.itchIOUsername,
        itchIOGameName: data.itchIOGameName,
      };
    },
    findDeployByAppIdAndVersionId: async (appId: number, versionId: number) => {
      const db = getDatabaseService();
      const data = await db.query.deploysTable.findFirst({
        where: and(
          eq(deploysTable.appId, appId),
          eq(deploysTable.versionId, versionId),
        ),
      });
      if (!data) {
        return null;
      }
      return mapDeploy(data);
    },
    async createDeploy({
      appId,
      versionId,
      targetService,
      platform,
      status,
    }: {
      appId: number;
      versionId: number;
      targetService: string;
      status: string;
      platform: string;
    }) {
      const db = getDatabaseService();
      const [deploy] = await db
        .insert(deploysTable)
        .values({ appId, versionId, targetService, platform, status })
        .returning();
      return mapDeploy(deploy);
    },
    async listDeploys(appId: number) {
      const db = getDatabaseService();
      const deploys = await db.query.deploysTable.findMany({
        where: eq(deploysTable.appId, appId),
      });
      return deploys.map(mapDeploy);
    },
    async createDeployLog({
      deployId,
      log,
    }: {
      deployId: number;
      log: string;
    }) {
      const db = getDatabaseService();
      await db.insert(deployLogsTable).values({
        deployId,
        log,
      });
    },
    async listDeployLogs(deployId: number) {
      const db = getDatabaseService();
      const logs = await db.query.deployLogsTable.findMany({
        where: eq(deployLogsTable.deployId, deployId),
      });
      return logs.map(mapDeployLog);
    },
  };

  return service;
}

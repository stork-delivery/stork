import { CodeSandbox } from "@codesandbox/sdk";
import { AppContext, HonoContext } from "../types";
import { getContext } from "hono/context-storage";
import { App, getAppService, Version } from "./app-service";
import { getCodeSandboxService } from "./code-sandbox";
import { getUserService, User } from "./user-service";

export type ItchService = {
  deployToItch: (opts: { app: App; version: Version; platform: string }) => Promise<void>;
};

export function getItchService(): ItchService {
  return getContext<HonoContext>().var.itchService;
}

export function setItchService(c: AppContext) {
  c.set("itchService", createItchService());
}

function createItchService(): ItchService {
  return {
    deployToItch: async ({ app, version, platform }) => {
      const appService = getAppService();

      const artifact = await appService.findVersionArtifact(
        app.id,
        version.version,
        platform,
      );

      if (!artifact) {
        throw new Error("Artifact not found");
      }

      const filename = artifact.fileName;

      if (!filename) {
        throw new Error("Artifact has no filename");
      }

      const itchIOData = await appService.findItchIOData(app.id);

      if (!itchIOData) {
        throw new Error("ItchIO data not found");
      }

      const userService = getUserService();
      const apiKey = await userService.getUserApiKey(app.userId);

      const codeSandboxService = getCodeSandboxService();

      console.log('Running deploy on CS');
      const pushCommand = `BUTLER_API_KEY=${itchIOData.buttlerKey} ./butler push ${filename} ${itchIOData.itchIOUsername}/${itchIOData.itchIOGameName}:${platform}`;
      const result = await codeSandboxService.run([
        "curl -L -o butler.zip https://broth.itch.ovh/butler/linux-amd64/LATEST/archive/default",
        "unzip butler.zip",
        "chmod +x butler",
        "./butler -V",
        `curl -L -o ${filename} -H "Authorization: Bearer ${apiKey}" https://stork.erickzanardoo.workers.dev/v1/admin/apps/${app.id}/versions/${version.version}/artifacts/platforms/${platform}/download`,
        'ls',
        pushCommand,
      ]);
      console.log('Execution complete');

      const deploy = await appService.createDeploy({
        appId: app.id,
        versionId: version.id,
        platform,
        targetService: 'itch',
        status: result.ok ? "success" : "failure",
      });

      for (const step of result.steps) {
        await appService.createDeployLog({
          deployId: deploy.id,
          log: step.output,
        });
      }
    },
  };
}
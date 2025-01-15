import { CodeSandbox } from "@codesandbox/sdk";
import { AppContext, HonoContext } from "../types";
import { getContext } from "hono/context-storage";
import { App, Version } from "./app-service";
import { getCodeSandboxService } from "./code-sandbox";

export type ItchService = {
  deployToItch: (app: App, version: Version) => Promise<void>;
};

export function getItchService(): ItchService {
  return getContext<HonoContext>().var.itchService;
}

export function setItchService(c: AppContext) {
  c.set("itchService", createItchService());
}

function createItchService(): ItchService {
  return {
    deployToItch: async (app, version) => {
      const codeSandboxService = getCodeSandboxService();

      const result = await codeSandboxService.run([
        "curl -L -o butler.zip https://broth.itch.ovh/butler/linux-amd64/LATEST/archive/default",
        "unzip butler.zip",
        "chmod +x butler",
        "./butler -V",
        // TODO
      ]);
    },
  };
}

export async function go() {
  const sdk = new CodeSandbox("");

  const sandbox = await sdk.sandbox.create();

  let result = await sandbox.shells.run(
    "curl -L -o butler.zip https://broth.itch.ovh/butler/linux-amd64/LATEST/archive/default",
  );

  result = await sandbox.shells.run("unzip butler.zip");

  result = await sandbox.shells.run("chmod +x butler");

  result = await sandbox.shells.run("./butler -V");
  console.log(result);
}

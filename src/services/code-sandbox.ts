import { getContext } from "hono/context-storage";
import { AppContext, HonoContext } from "../types";
import { CodeSandbox } from "@codesandbox/sdk";

export type ExecutionStep = {
  command: string;
  exitCode: number | undefined;
  output: string;
};

export type ExecutionResult = {
  ok: boolean;
  steps: Array<ExecutionStep>;
};

export type CodeSandboxService = {
  run: (commands: Array<string>) => Promise<ExecutionResult>;
};

export function getCodeSandboxService(): CodeSandboxService {
  return getContext<HonoContext>().var.codesandboxService;
}

export function setCodeSandboxService(c: AppContext) {
  c.set("codesandboxService", createCodeSandboxService(c.env.CS_KEY));
}

function createCodeSandboxService(apiKey: string): CodeSandboxService {
  const sdk = new CodeSandbox(apiKey);

  const service: CodeSandboxService = {
    run: async (commands) => {
      const steps: Array<ExecutionStep> = [];

      const sandbox = await sdk.sandbox.create();

      for (const command of commands) {
        const result = await sandbox.shells.run(command);

        const step: ExecutionStep = {
          command,
          exitCode: result.exitCode,
          output: result.output,
        };

        steps.push(step);

        if (step.exitCode !== 0) {
          break;
        }
      }

      const result: ExecutionResult = {
        ok: steps.length == commands.length,
        steps,
      };

      sandbox.shutdown();

      return result;
    },
  };

  return service;
}

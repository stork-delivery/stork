import { DrizzleD1Database } from "drizzle-orm/d1";
import { Context } from "hono";
import * as schema from "./db/schema";
import { AppService } from "./services/app-service";
import { UserService } from "./services/user-service";
import { CodeSandboxService } from "./services/code-sandbox";
import { ItchService } from "./services/itch-service";

export type HonoContext = {
  Bindings: Env;
  Variables: Variables;
};

export type AppContext = Context<HonoContext>;

export type Variables = {
  appService: AppService;
  userService: UserService;
  codesandboxService: CodeSandboxService;
  itchService: ItchService;
  databaseService: DrizzleD1Database<typeof schema>;
  storageService: R2Bucket;
};

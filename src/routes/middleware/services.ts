import { createMiddleware } from "hono/factory";
import type { HonoContext } from "../../types";
import { setDatabaseService } from "../../services/database-service";
import { setAppService } from "../../services/app-service";
import { setUserService } from "../../services/user-service";
import { setStorageService } from "../../services/storage-service";

export const injectServices = createMiddleware<HonoContext>(async (c, next) => {
  setDatabaseService(c);
  setStorageService(c);
  setUserService(c);
  setAppService(c);

  await next();
});

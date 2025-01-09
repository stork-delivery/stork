import { Hono } from "hono";
import { apiKeyAuth, appIdAuth } from "../../middleware/auth";
import { versionsController } from "./versions";
import { getAppService } from "../../../services/app-service";

export const appsController = new Hono()
  .get("/", apiKeyAuth, async (c) => {
    const appService = getAppService();
    const { user } = c.req.valid("header");
    const apps = await appService.listAll(user.id);
    return c.json(apps);
  })
  .get("/:id", apiKeyAuth, appIdAuth, async (c) => {
    const { app } = c.req.valid("param");

    return c.json(app);
  })
  .route("/:id/versions", versionsController);

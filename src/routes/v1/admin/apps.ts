import { Hono } from "hono";
import { apiKeyAuth, appIdAuth } from "../../middleware/auth";
import { versionsController } from "./versions";
import { getAppService } from "../../../services/app-service";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { cors } from "hono/cors";
import { newsController } from "./news";

const appSchema = z.object({
  name: z.string().min(1),
  publicMetadata: z.boolean(),
});

export const appsController = new Hono()
  .get("/", apiKeyAuth, async (c) => {
    const appService = getAppService();
    const { user } = c.req.valid("header");
    const apps = await appService.listAll(user.id);
    return c.json(apps);
  })
  .post("/", apiKeyAuth, zValidator("json", appSchema), async (c) => {
    const appService = getAppService();
    const { user } = c.req.valid("header");
    const data = c.req.valid("json");
    const app = await appService.createApp(user.id, data);
    return c.json(app, { status: 201 });
  })
  .get("/:id", apiKeyAuth, appIdAuth, async (c) => {
    const { app } = c.req.valid("param");
    return c.json(app);
  })
  .patch(
    "/:id",
    apiKeyAuth,
    appIdAuth,
    zValidator("json", appSchema.partial()),
    async (c) => {
      const appService = getAppService();
      const { app } = c.req.valid("param");
      const data = c.req.valid("json");
      const updatedApp = await appService.updateApp(app.id, data);
      return c.json(updatedApp, { status: 200 });
    },
  )
  .delete("/:id", apiKeyAuth, appIdAuth, async (c, next) => {
    const appService = getAppService();
    const { app } = c.req.valid("param");
    await appService.removeApp(app.id);
    return c.body(null, { status: 204 });
  })
  .put(
    "/:id/itchio",
    apiKeyAuth,
    appIdAuth,
    zValidator(
      "json",
      z.object({
        buttlerKey: z.string().min(1),
        itchIOUsername: z.string().min(1),
        itchIOGameName: z.string().min(1),
      }),
    ),
    async (c) => {
      const appService = getAppService();
      const { app } = c.req.valid("param");
      const data = c.req.valid("json");

      const itchIOData = await appService.upsertItchIOData({
        appId: app.id,
        ...data,
      });

      return c.json(itchIOData);
    },
  )
  .get("/:id/itchio", apiKeyAuth, appIdAuth, async (c) => {
    const appService = getAppService();
    const { app } = c.req.valid("param");
    
    const itchIOData = await appService.findItchIOData(app.id);
    
    if (!itchIOData) {
      return c.json({ error: "Not found" }, 404);
    }

    return c.json(itchIOData);
  })
  .route("/:id/versions", versionsController)
  .route("/:id/news", newsController);

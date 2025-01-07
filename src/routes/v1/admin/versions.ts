import { Hono } from "hono";
import { apiKeyAuth, appIdAuth } from "../../middleware/auth";
import { getAppService } from "../../../services/app-service";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { artifactsController } from "./artifacts";

export const versionsController = new Hono()
  .get("/", apiKeyAuth, appIdAuth, async (c) => {
    const { app } = c.req.valid("param");
    const versions = await getAppService().listVersions(app.id);
    return c.json(versions);
  })
  .post(
    "/",
    apiKeyAuth,
    appIdAuth,
    zValidator(
      "json",
      z.object({
        versionName: z.string().min(1),
      }),
    ),
    async (c) => {
      const { app } = c.req.valid("param");
      const { versionName } = c.req.valid("json");

      await getAppService().createVersion({
        appId: app.id,
        versionName,
      });

      return c.text("OK");
    },
  )
  .route("/:versionName/artifacts", artifactsController);

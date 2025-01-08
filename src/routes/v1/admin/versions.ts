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
        changelog: z.optional(z.string()),
      }),
    ),
    async (c) => {
      const { app } = c.req.valid("param");
      const { versionName, changelog } = c.req.valid("json");

      await getAppService().createVersion({
        appId: app.id,
        versionName,
        changelog: changelog || "",
      });

      return c.text("OK");
    },
  )
  .put(
    "/:versionName/changelog",
    apiKeyAuth,
    appIdAuth,
    zValidator(
      "json",
      z.object({
        changelog: z.string(),
      }),
    ),
    async (c) => {
      const versionName = c.req.param("versionName") as string;
      const { app } = c.req.valid("param");
      const { changelog } = c.req.valid("json");

      await getAppService().updateVersionChangelog({
        appId: app.id,
        versionName: versionName,
        changelog,
      });

      return c.text("OK");
    },
  )
  .route("/:versionName/artifacts", artifactsController);

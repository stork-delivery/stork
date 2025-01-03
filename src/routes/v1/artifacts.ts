import { Hono } from "hono";
import { apiKeyAuth, appIdAuth } from "../middleware/auth";
import { getAppService } from "../../services/app-service";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

export const artifactsController = new Hono()
  .get("/", apiKeyAuth, appIdAuth, async (c) => {
    const versionName = c.req.param("versionName") as string;
    const { app } = c.req.valid("param");

    const appService = getAppService();
    const artifacts = await appService.listVersionArtifacts(
      app.id,
      versionName,
    );
    return c.json(artifacts);
  })
  .post("/platforms/:platform", apiKeyAuth, appIdAuth, async (c) => {
    const { app } = c.req.valid("param");
    const { platform } = c.req.param();
    const versionName = c.req.param("versionName") as string;

    const appService = getAppService();
    const version = await appService.findVersionByNameAndAppId(
      versionName,
      app.id,
    );

    if (!version) {
      return c.json({ error: "Not found" }, 404);
    }

    await appService.createArtifact({
      versionId: version.id,
      platform,
      stream: c.req.raw.body!,
    });

    return c.text("OK");
  });

import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { getAppService } from "../../services/app-service";

export const appsController = new Hono().get(
  "/:id",
  zValidator(
    "param",
    z.object({
      id: z.string().min(1),
    }),
  ),
  async (c) => {
    const appService = getAppService();

    const app = await appService.findById(parseInt(c.req.param("id")));

    if (!app || !app.publicMetadata) {
      return c.notFound();
    }

    const versions = await appService.listVersions(app.id);
    const lastVersion = versions.length > 0 ? versions[0].version : null;

    return c.json({
      id: app.id,
      name: app.name,
      lastVersion,
      versions: versions.map((v) => v.version),
    });
  },
);

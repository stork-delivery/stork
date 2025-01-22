import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { getAppService } from "../../services/app-service";
import { getStorageService } from "../../services/storage-service";

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
).get('/:id/download/:versionName/:platform', zValidator(
  'param',
  z.object({
    id: z.string().min(1),
    versionName: z.string().min(1),
    platform: z.string().min(1),
  }),
),
  async (c) => {
    const appService = getAppService();

    const { id, versionName, platform } = c.req.valid('param');
    const app = await appService.findById(parseInt(id));

    if (!app) {
      return c.notFound();
    }

    if (!app.publicDownload) {
      return c.notFound();
    }
    const version = await appService.findVersionByNameAndAppId(versionName, app.id);
    if (!version) {
      return c.notFound();
    }
    const artifact = await appService.findVersionArtifact(
      app.id,
      version.version,
      platform,
    );

    if (!artifact) {
      return c.notFound();
    }


    const downloadKey = artifact.name;

    const object = await getStorageService().get(downloadKey);

    if (!object) {
      return c.json({ error: "Not found" }, 404);
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("etag", object.httpEtag);

    return c.body(object.body, { headers });
  }
);  

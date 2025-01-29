import { Hono } from "hono";
import { apiKeyAuth, appIdAuth } from "../../middleware/auth";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { getAppService } from "../../../services/app-service";

export const newsController = new Hono()
    .post("/",
        apiKeyAuth,
        appIdAuth,
        zValidator(
            "json",
            z.object({
                title: z.string().min(1),
                content: z.string().min(1),
            }),
        ),
        async (c) => {
            const { app } = c.req.valid("param");

            const { title, content } = c.req.valid("json");

            const appService = getAppService();
            const news = await appService.createAppNews({
                title,
                appId: app.id,
                content,
            });

            return c.json(news);
        })
    .patch(
        "/:id",
        apiKeyAuth,
        appIdAuth,
        zValidator(
            "json",
            z.object({
                title: z.string().min(1),
                content: z.string().min(1),
            }),
        ),
        async (c) => {
            const { app } = c.req.valid("param");
            const { id } = c.req.param();
            const { title, content } = c.req.valid("json");

            const appService = getAppService();
            const news = await appService.updateAppNews({
                id: parseInt(id),
                title,
                content,
                appId: app.id,
            });
            return c.json(news);
        },
    )
    .get("/:id", apiKeyAuth, appIdAuth, async (c) => {
        const { app } = c.req.valid("param");
        const { id } = c.req.param();

        const appService = getAppService();
        const news = await appService.getAppNews({ id: parseInt(id), appId: app.id });
        return c.json(news);
    })
    .get("/", apiKeyAuth, appIdAuth, zValidator("query", z.object({ page: z.string(), perPage: z.string() })), async (c) => {
        const { app } = c.req.valid("param");
        const { page, perPage } = c.req.valid("query");

        const appService = getAppService();
        const news = await appService.listAppNews({
            appId: app.id,
            page: parseInt(page),
            perPage: parseInt(perPage),
        });
        return c.json(news);
    });
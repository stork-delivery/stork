import { Hono } from "hono";
import { appsController } from "./apps";
import { cors } from "hono/cors";

export const adminController = new Hono()
    .use('*', async (c, next) => {
        const corsMiddlewareHandler = cors({
            // @ts-ignore
            origin: c.env.CORS_ORIGIN,
        });
        return corsMiddlewareHandler(c, next)
    })
    .route("/apps", appsController);

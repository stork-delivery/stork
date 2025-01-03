import { Hono } from "hono";
import { HonoContext } from "./types";
import { contextStorage } from "hono/context-storage";
import { logger } from "hono/logger";
import { v1Controller } from "./routes/v1";

const app = new Hono<HonoContext>()
  .onError((err, c) => {
    console.error(err);
    return c.json({ error: err.message || "Internal Server Error" }, 500);
  })
  .use(contextStorage())
  .use(logger())
  .route("/v1", v1Controller);

export type AppContext = typeof app;

export default app;

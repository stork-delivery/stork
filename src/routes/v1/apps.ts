import {Hono} from "hono";
import {apiKeyAuth, appIdAuth} from "../middleware/auth";

export const appsController = new Hono()
  .get('/:id', apiKeyAuth, appIdAuth, async (c) => {
    const { app } = c.req.valid('param');

    return c.json(app);
  },
);

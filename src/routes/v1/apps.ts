import {Hono} from "hono";
import {apiKeyAuth} from "../middleware/auth";
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import {getAppService} from "../../services/app-service";

export const appsController = new Hono()
  .get('/:id', apiKeyAuth, zValidator(
    'param',
    z.object({
      id: z.string(),
    }),
  ), async (c) => {
    const { user } = c.req.valid('header');
    const appId = c.req.valid('param').id;

    const app = await getAppService().findById(parseInt(appId));

    if (!app || app.userId !== user.id) {
      return c.json({ error: 'Not found' }, 404);
    }

    return c.json(app);
  },
);

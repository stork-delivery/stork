import { createMiddleware } from 'hono/factory';
import type { HonoContext } from '../../types';
import { setDatabaseService } from '../../services/database-service';
import {setAppService} from '../../services/app-service';

export const injectServices = createMiddleware<HonoContext>(async (c, next) => {
  setDatabaseService(c);
  setAppService(c);

  await next();
});

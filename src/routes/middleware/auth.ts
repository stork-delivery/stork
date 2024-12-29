import { validator } from 'hono/validator';
import {getUserService} from '../../services/user-service';

export const apiKeyAuth = validator('header', async (headers, c) => {
  const authorization = headers['authorization'] || headers['Authorization'];

  if (authorization) {
    const apiKey = authorization.split(' ').at(-1);

    if (!apiKey) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const user = await getUserService().findByApiKey(apiKey);

    if (user) {
      return { user };
    }
  }

  return c.json({ error: 'Unauthorized' }, 401);
});

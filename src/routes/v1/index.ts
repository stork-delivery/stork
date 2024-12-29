import { Hono } from 'hono';
import { injectServices } from '../middleware/services';

export const v1Controller = new Hono()
  .use(injectServices) // Must be first.
  //.route('/bla', bla);

import { Hono } from "hono";
import { injectServices } from "../middleware/services";
import { adminController } from "./admin";
import {appsController} from "./apps";

export const v1Controller = new Hono()
  .use(injectServices) // Must be first.
  .route('/admin', adminController)
  .route('/apps', appsController);

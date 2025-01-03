import { Hono } from "hono";
import { injectServices } from "../middleware/services";
import { appsController } from "./apps";

export const v1Controller = new Hono()
  .use(injectServices) // Must be first.
  .route("/apps", appsController);

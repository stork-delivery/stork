import { Hono } from "hono";
import { appsController } from "./apps";

export const adminController = new Hono().route("/apps", appsController);

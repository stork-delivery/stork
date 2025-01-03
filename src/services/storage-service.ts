import { getContext } from "hono/context-storage";
import { HonoContext, AppContext } from "../types";

export function getStorageService(): R2Bucket {
  return getContext<HonoContext>().var.storageService;
}

export function setStorageService(c: AppContext) {
  c.set("storageService", c.env.stork_artifacts);
}

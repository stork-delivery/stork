import { validator } from "hono/validator";
import { getUserService } from "../../services/user-service";
import { getAppService } from "../../services/app-service";

export const apiKeyAuth = validator("header", async (headers, c) => {
  const authorization = headers["authorization"] || headers["Authorization"];

  if (authorization) {
    const apiKey = authorization.split(" ").at(-1);

    if (!apiKey) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    console.log('a');
    const user = await getUserService().findByApiKey(apiKey);
    console.log('b', user);

    if (user) {
      return { user };
    }
  }

  return c.json({ error: "Unauthorized" }, 401);
});

export const appIdAuth = validator("param", async (param, c) => {
  const appId = param.id;
  // TODO This is working but idk how to make TS happy
  // so keeping it like this for now, will come back to it eventually
  // @ts-ignore
  const { user } = c.req.valid("header");

  const app = await getAppService().findById(parseInt(appId));

  // @ts-ignore
  if (!app || app.userId !== user.id) {
    return c.json({ error: "Not found" }, 404);
  }

  return { app };
});

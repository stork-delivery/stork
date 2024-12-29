import { getContext } from 'hono/context-storage';
import { AppContext, HonoContext } from '../types';
import {getDatabaseService} from './database-service';
import {versionsTable} from '../db/schema';


export type AppService = {
  createVersion: (opts: {appId: number, versionName: string}) => Promise<void>;
}

export function getAppService(): AppService {
  return getContext<HonoContext>().var.appService;
}

export function setAppService(c: AppContext) {
  c.set('appService', createAppService());
}

function createAppService(): AppService {
  return {
    createVersion: async ({appId, versionName}) => {
      await getDatabaseService()
        .insert(versionsTable)
        .values({
          appId: appId,
          version: versionName,
        });
    }
  };
}

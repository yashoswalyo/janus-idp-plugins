import { Router } from 'express';

import { createRouter } from '@janus-idp/backstage-plugin-feedback-backend';

import { PluginEnvironment } from '../types';

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  return await createRouter({
    config: env.config,
    logger: env.logger,
    discovery: env.discovery,
  });
}

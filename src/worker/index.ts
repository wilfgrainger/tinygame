import type { Env } from './env';
import { createRouter } from './router';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (new URL(request.url).pathname.startsWith('/api/')) return createRouter(env).handle(request);
    return env.ASSETS.fetch(request);
  }
};

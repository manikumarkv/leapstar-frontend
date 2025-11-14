import { env } from '@/config/env';

export interface Auth0Config {
  domain: string;
  clientId: string;
  audience?: string;
  scope?: string;
}

const missing = (key: string) =>
  `Missing required Auth0 configuration: set ${key} in your Vite environment (e.g. .env.local).`;

export const auth0Config: Auth0Config = (() => {
  const domain = env.VITE_AUTH0_DOMAIN;
  const clientId = env.VITE_AUTH0_CLIENT_ID;

  if (!domain) {
    throw new Error(missing('VITE_AUTH0_DOMAIN'));
  }

  if (!clientId) {
    throw new Error(missing('VITE_AUTH0_CLIENT_ID'));
  }

  return {
    domain,
    clientId,
    audience: env.VITE_AUTH0_AUDIENCE,
    scope: env.VITE_AUTH0_SCOPE,
  } satisfies Auth0Config;
})();

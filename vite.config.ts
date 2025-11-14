import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import type { ServerOptions as HttpsServerOptions } from 'node:https';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const resolvePathIfExists = (input?: string) => {
  if (!input) {
    return undefined;
  }

  const candidates = path.isAbsolute(input)
    ? [input]
    : [path.resolve(__dirname, input), path.resolve(process.cwd(), input)];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return undefined;
};

const loadHttpsOptions = (keyPath?: string, certPath?: string) => {
  const resolvedKeyPath = resolvePathIfExists(keyPath);
  const resolvedCertPath = resolvePathIfExists(certPath);

  if (!resolvedKeyPath || !resolvedCertPath) {
    return undefined;
  }

  const httpsOptions: HttpsServerOptions = {
    key: fs.readFileSync(resolvedKeyPath),
    cert: fs.readFileSync(resolvedCertPath),
    minVersion: 'TLSv1.2',
  };

  return httpsOptions;
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, '');
  const platformDomain = env.VITE_PLATFORM_DOMAIN?.trim().toLowerCase() ?? 'manikumarkv.com';
  const managedSubdomain = env.VITE_DEV_MANAGED_SUBDOMAIN?.trim().toLowerCase() ?? 'app';
  const normalizedSubdomain = managedSubdomain.replace(/\.+$/, '') || 'app';
  const devHost = `${normalizedSubdomain}.${platformDomain}`;

  const httpsOptions = loadHttpsOptions(env.VITE_DEV_SERVER_KEY, env.VITE_DEV_SERVER_CERT);
  const protocol = httpsOptions ? 'https' : 'http';
  const devOrigin = `${protocol}://${devHost}:3000`;

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      host: true,
      port: 3000,
      open: devOrigin,
      origin: devOrigin,
      https: httpsOptions,
      hmr: {
        protocol: httpsOptions ? 'wss' : 'ws',
        host: devHost,
        port: 3000,
      },
      allowedHosts: true,
    },
  };
});

// Vite environment types
// This file provides Vite type definitions without depending on vite/client package

declare global {
  interface ImportMetaEnv {
    readonly VITE_API_BASE_URL?: string;
    readonly VITE_AUTH0_DOMAIN?: string;
    readonly VITE_AUTH0_CLIENT_ID?: string;
    readonly VITE_AUTH0_AUDIENCE?: string;
    readonly VITE_AUTH0_SCOPE?: string;
    readonly VITE_PLATFORM_DOMAIN?: string;
    readonly MODE: string;
    readonly BASE_URL: string;
    readonly PROD: boolean;
    readonly DEV: boolean;
    readonly SSR: boolean;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
    readonly hot?: {
      readonly data: any;
      accept(): void;
      accept(cb: (mod: any) => void): void;
      accept(dep: string, cb: (mod: any) => void): void;
      accept(deps: readonly string[], cb: (mods: any[]) => void): void;
      dispose(cb: (data: any) => void): void;
      decline(): void;
      invalidate(): void;
      on<T extends string>(event: T, cb: (payload: any) => void): void;
    };
  }
}

export {};

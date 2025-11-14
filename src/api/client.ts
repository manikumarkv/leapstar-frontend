import { getTenantDomainContext } from '@/lib/tenantDomain';

import { env } from '../config/env.js';

const API_BASE_URL = env.VITE_API_BASE_URL ?? 'http://localhost:8701/api/v1';

export class ApiError extends Error {
  public readonly status: number;
  public readonly details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export const apiClient = async <T>(endpoint: string, init?: RequestInit): Promise<T> => {
  const requestHeaders = new Headers(init?.headers ?? {});
  requestHeaders.set('Content-Type', 'application/json');

  const tenantContext = getTenantDomainContext();
  const tenantId = tenantContext?.tenant?.id;

  if (tenantId) {
    requestHeaders.set('x-tenant-id', tenantId);
  }

  if (typeof window !== 'undefined') {
    requestHeaders.set('x-forwarded-host', window.location.host);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...init,
    headers: requestHeaders,
  });

  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`;
    let details: unknown;

    try {
      details = await response.json();
      if (details && typeof details === 'object') {
        const message = (details as { message?: unknown; error?: unknown }).message;
        if (typeof message === 'string' && message.trim().length > 0) {
          errorMessage = message;
        }
      }
    } catch {
      // Ignore JSON parsing errors; retain default message.
    }

    throw new ApiError(errorMessage, response.status, details);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
};

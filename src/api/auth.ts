import type { RegistrationRole } from '@/shared';

import { apiClient } from './client';

export interface RegisterUserRequest {
  role: RegistrationRole;
  profile?: {
    firstName?: string;
    lastName?: string;
    displayName?: string;
  };
  email?: string;
  picture?: string;
  auth0Id?: string;
  metadata?: Record<string, unknown>;
}

export interface RegisterUserResponse {
  id: string;
  email?: string;
  name?: string;
  profile?: {
    firstName?: string;
    lastName?: string;
    displayName?: string;
  };
  registration: {
    role: RegistrationRole;
    status: 'pending' | 'completed';
    submittedAt: string;
    completedAt?: string;
    metadata?: Record<string, unknown>;
  };
}

export const registerUser = async (
  accessToken: string,
  payload: RegisterUserRequest,
): Promise<RegisterUserResponse> => {
  return apiClient<RegisterUserResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

export interface CurrentUserResponse {
  user: {
    id?: string;
    auth0Id: string;
    email?: string;
    name?: string;
    picture?: string;
    roles: Array<{
      id: string;
      name: string;
      description?: string;
      metadata?: Record<string, unknown>;
      permissions: Array<{
        key: string;
        description?: string;
      }>;
    }>;
    permissions: string[];
  };
  tenant: {
    id: string;
    name: string;
    slug: string;
    branding: {
      logoUrl: string | null;
      primaryColor: string | null;
      secondaryColor: string | null;
    } | null;
  } | null;
}

export const getCurrentUser = async (accessToken: string): Promise<CurrentUserResponse> => {
  return apiClient<CurrentUserResponse>('/auth/me', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

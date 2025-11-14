import { apiClient } from './client';

export interface ApiRolePermission {
  name: string;
  description?: string;
}

export interface ApiRole {
  _id: string;
  name: string;
  displayName: string;
  description?: string;
  scope: 'global' | 'tenant';
  tenant?: string | null;
  metadata?: Record<string, unknown>;
  permissions: ApiRolePermission[];
  system?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const buildRoleHeaders = (accessToken: string, tenantId?: string | null) => {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
  };
  if (tenantId) {
    headers['x-tenant-id'] = tenantId;
  }

  return headers;
};

export const getRoles = async (
  accessToken: string,
  tenantId?: string | null,
): Promise<ApiRole[]> => {
  return apiClient<ApiRole[]>('/roles', {
    method: 'GET',
    headers: buildRoleHeaders(accessToken, tenantId),
  });
};

export const getRoleById = async (
  accessToken: string,
  roleId: string,
  tenantId?: string | null,
): Promise<ApiRole> => {
  return apiClient<ApiRole>(`/roles/${roleId}`, {
    method: 'GET',
    headers: buildRoleHeaders(accessToken, tenantId),
  });
};

import { apiClient } from './client';

export type SystemSettingScope = 'global' | 'tenant-default';

export interface ApiSystemSetting {
  _id: string;
  key: string;
  value: unknown;
  description?: string;
  scope: SystemSettingScope;
  createdAt?: string;
  updatedAt?: string;
}

export type SystemSettingListResponse = ApiSystemSetting[];

export interface UpsertSystemSettingPayload {
  key: string;
  value: unknown;
  description?: string;
  scope?: SystemSettingScope;
}

export const getSystemSettings = async (
  accessToken: string,
): Promise<SystemSettingListResponse> => {
  return apiClient<SystemSettingListResponse>('/settings', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

export const upsertSystemSetting = async (
  accessToken: string,
  payload: UpsertSystemSettingPayload,
): Promise<ApiSystemSetting> => {
  return apiClient<ApiSystemSetting>('/settings', {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });
};

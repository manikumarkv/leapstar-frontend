import { apiClient } from './client.js';

export interface EmailPreferences {
  productUpdates: boolean;
  marketing: boolean;
  transactions: boolean;
  reminders: boolean;
}

export type UpdateEmailPreferencesPayload = Partial<EmailPreferences>;

export const getEmailPreferences = (accessToken: string) =>
  apiClient<EmailPreferences>('/settings/email-preferences', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

export const updateEmailPreferences = (
  accessToken: string,
  payload: UpdateEmailPreferencesPayload,
) =>
  apiClient<EmailPreferences>('/settings/email-preferences', {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

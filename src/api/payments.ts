import { apiClient } from './client';

export type TenantBillingStatus = 'not_connected' | 'pending' | 'active' | 'restricted';

export interface TenantPaymentStatusResponse {
  stripeAccountId: string | null;
  status: TenantBillingStatus;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  requirementsDue: string[];
  requirementsDueBy: string | null;
  disabledReason: string | null;
  defaultCurrency: string | null;
  lastSyncedAt: string | null;
  capabilities: Record<string, string>;
  onboarding: {
    createdAt: string | null;
    expiresAt: string | null;
  } | null;
  hasAccount: boolean;
}

export interface CreateStripeOnboardingLinkPayload {
  refreshUrl: string;
  returnUrl: string;
  collect?: 'eventually_due' | 'currently_due';
}

export interface StripeOnboardingLinkResponse {
  url: string;
  expiresAt: string;
  createdAt: string;
}

export const getTenantPaymentStatus = async (
  accessToken: string,
  tenantId: string,
): Promise<TenantPaymentStatusResponse> => {
  return apiClient<TenantPaymentStatusResponse>('/payments/connect', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'x-tenant-id': tenantId,
    },
  });
};

export const createStripeOnboardingLink = async (
  accessToken: string,
  tenantId: string,
  payload: CreateStripeOnboardingLinkPayload,
): Promise<StripeOnboardingLinkResponse> => {
  return apiClient<StripeOnboardingLinkResponse>('/payments/connect/onboarding', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'x-tenant-id': tenantId,
    },
    body: JSON.stringify(payload),
  });
};

import { apiClient } from './client';

export interface TenantBrandingResponse {
  logoUrl?: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
}

export interface TenantSettingsResponse {
  appName?: string;
  supportEmail?: string;
  fromEmail?: string;
  rewardCreditsPerDollar?: number;
  defaultStudentCredits?: number;
  enrollmentApprovalRequired?: boolean;
  branding?: TenantBrandingResponse | null;
  featureFlags?: Record<string, boolean> | null;
}

export type TenantCustomDomainStatus = 'pending' | 'verifying' | 'verified' | 'failed';

export interface TenantCustomDomainVerificationResponse {
  method: 'dns_txt';
  token: string;
  recordName: string;
  recordValue: string;
  verifiedAt?: string | null;
  lastCheckedAt?: string | null;
  failureReason?: string | null;
}

export interface TenantCustomDomainResponse {
  _id: string;
  hostname: string;
  status: TenantCustomDomainStatus;
  isPrimary: boolean;
  verification: TenantCustomDomainVerificationResponse;
  createdAt?: string;
  updatedAt?: string;
}

export interface TenantResponse {
  _id: string;
  name: string;
  slug: string;
  status: 'active' | 'inactive';
  domains?: string[];
  customDomains?: TenantCustomDomainResponse[];
  settings?: TenantSettingsResponse;
  metadata?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

export interface TenantOverviewMetricsResponse {
  activeStudents: number;
  publishedPrograms: number;
  activeTeachers: number;
}

export interface TenantOverviewResponse {
  tenant: TenantResponse;
  metrics: TenantOverviewMetricsResponse;
}

export interface UpdateTenantBrandingPayload {
  logoUrl?: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
}

export interface UpdateTenantPayload {
  name?: string;
  domains?: string[];
  status?: 'active' | 'inactive';
  settings?: {
    appName?: string;
    supportEmail?: string;
    fromEmail?: string;
    rewardCreditsPerDollar?: number;
    defaultStudentCredits?: number;
    enrollmentApprovalRequired?: boolean;
    branding?: UpdateTenantBrandingPayload | null;
    featureFlags?: Record<string, boolean>;
  };
  metadata?: Record<string, unknown>;
}

export interface CreateTenantPayload {
  name: string;
  slug: string;
  domains?: string[];
  settings?: {
    appName?: string;
    supportEmail?: string;
    fromEmail?: string;
    rewardCreditsPerDollar?: number;
    defaultStudentCredits?: number;
    enrollmentApprovalRequired?: boolean;
    branding?: UpdateTenantBrandingPayload | null;
    featureFlags?: Record<string, boolean>;
  };
  metadata?: Record<string, unknown>;
}

export interface CreateTenantCustomDomainPayload {
  hostname: string;
  isPrimary?: boolean;
}

export const getTenantById = async (
  accessToken: string,
  tenantId: string,
): Promise<TenantResponse> => {
  return apiClient<TenantResponse>(`/tenants/${tenantId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

export const updateTenantById = async (
  accessToken: string,
  tenantId: string,
  payload: UpdateTenantPayload,
): Promise<TenantResponse> => {
  return apiClient<TenantResponse>(`/tenants/${tenantId}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });
};

export const listTenants = async (accessToken: string): Promise<TenantResponse[]> => {
  return apiClient<TenantResponse[]>('/tenants', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

export const createTenant = async (
  accessToken: string,
  payload: CreateTenantPayload,
): Promise<TenantResponse> => {
  return apiClient<TenantResponse>('/tenants', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });
};

export const getTenantOverview = async (
  accessToken: string,
  tenantId: string,
): Promise<TenantOverviewResponse> => {
  return apiClient<TenantOverviewResponse>(`/tenants/${tenantId}/overview`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

export const createTenantCustomDomain = async (
  accessToken: string,
  tenantId: string,
  payload: CreateTenantCustomDomainPayload,
): Promise<TenantCustomDomainResponse> => {
  return apiClient<TenantCustomDomainResponse>(`/tenants/${tenantId}/custom-domains`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });
};

export const verifyTenantCustomDomain = async (
  accessToken: string,
  tenantId: string,
  domainId: string,
): Promise<TenantCustomDomainResponse> => {
  return apiClient<TenantCustomDomainResponse>(
    `/tenants/${tenantId}/custom-domains/${domainId}/verify`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
};

export const setTenantPrimaryCustomDomain = async (
  accessToken: string,
  tenantId: string,
  domainId: string,
): Promise<TenantCustomDomainResponse> => {
  return apiClient<TenantCustomDomainResponse>(
    `/tenants/${tenantId}/custom-domains/${domainId}/primary`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
};

export const deleteTenantCustomDomain = async (
  accessToken: string,
  tenantId: string,
  domainId: string,
): Promise<void> => {
  return apiClient<void>(`/tenants/${tenantId}/custom-domains/${domainId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

import { apiClient, ApiError } from './client';

export type TenantDomainSource = 'managed' | 'custom';

export type TenantCustomDomainStatus = 'pending' | 'verifying' | 'verified' | 'failed';

export interface TenantDomainContextResponse {
  resolved: boolean;
  matchedDomain: string | null;
  source: TenantDomainSource | null;
  customDomainStatus: TenantCustomDomainStatus | null;
  tenant: {
    id: string;
    name: string;
    slug: string;
    status: 'active' | 'inactive';
    appName: string | null;
    supportEmail: string | null;
    branding: {
      logoUrl: string | null;
      primaryColor: string | null;
      secondaryColor: string | null;
    } | null;
  } | null;
}

const EMPTY_CONTEXT: TenantDomainContextResponse = {
  resolved: false,
  matchedDomain: null,
  source: null,
  customDomainStatus: null,
  tenant: null,
};

export const getTenantDomainContext = async (): Promise<TenantDomainContextResponse> => {
  try {
    return await apiClient<TenantDomainContextResponse>('/tenant-domain/context', {
      method: 'GET',
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return EMPTY_CONTEXT;
    }

    throw error;
  }
};

export const getEmptyTenantDomainContext = (): TenantDomainContextResponse => EMPTY_CONTEXT;

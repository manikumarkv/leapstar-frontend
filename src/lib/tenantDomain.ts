import type { TenantDomainContextResponse } from '@/api/tenantDomain';

let tenantDomainContext: TenantDomainContextResponse | null = null;

export const setTenantDomainContext = (context: TenantDomainContextResponse | null): void => {
  tenantDomainContext = context;
};

export const getTenantDomainContext = (): TenantDomainContextResponse | null => tenantDomainContext;

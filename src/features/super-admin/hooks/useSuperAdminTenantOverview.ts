import { useAuth0 } from '@auth0/auth0-react';
import { useQuery } from '@tanstack/react-query';

import { getTenantOverview, type TenantOverviewResponse } from '@/api/tenants';

export const SUPER_ADMIN_TENANT_OVERVIEW_QUERY_KEY = ['super-admin', 'tenant-overview'] as const;

export const useSuperAdminTenantOverview = (tenantId: string | undefined) => {
  const { getAccessTokenSilently, isLoading: isAuthLoading } = useAuth0();

  return useQuery<TenantOverviewResponse>({
    queryKey: [...SUPER_ADMIN_TENANT_OVERVIEW_QUERY_KEY, tenantId ?? 'unknown'],
    enabled: Boolean(tenantId) && !isAuthLoading,
    staleTime: 60_000,
    queryFn: async () => {
      if (!tenantId) {
        throw new Error('Tenant id is required');
      }
      const token = await getAccessTokenSilently();
      return getTenantOverview(token, tenantId);
    },
  });
};

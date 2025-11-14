import { useAuth0 } from '@auth0/auth0-react';
import { useQuery } from '@tanstack/react-query';

import { getTenantById, type TenantResponse } from '@/api/tenants';

export const superAdminTenantQueryKey = (tenantId: string | undefined) =>
  ['super-admin', 'tenant', tenantId] as const;

export const useSuperAdminTenant = (tenantId: string | undefined) => {
  const { getAccessTokenSilently, isLoading: isAuthLoading } = useAuth0();

  return useQuery<TenantResponse | null>({
    queryKey: superAdminTenantQueryKey(tenantId),
    enabled: Boolean(tenantId) && !isAuthLoading,
    staleTime: 30_000,
    queryFn: async () => {
      if (!tenantId) {
        return null;
      }
      const token = await getAccessTokenSilently();
      return getTenantById(token, tenantId);
    },
  });
};

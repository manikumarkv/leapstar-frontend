import { useAuth0 } from '@auth0/auth0-react';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { getTenantById, type TenantResponse } from '@/api/tenants';

export const TENANT_DETAILS_QUERY_KEY = (tenantId: string | undefined) =>
  ['tenant', tenantId] as const;

export const useTenantDetails = (tenantId: string | undefined): UseQueryResult<TenantResponse> => {
  const { getAccessTokenSilently } = useAuth0();

  return useQuery<TenantResponse>({
    queryKey: TENANT_DETAILS_QUERY_KEY(tenantId),
    enabled: Boolean(tenantId),
    queryFn: async () => {
      if (!tenantId) {
        throw new Error('Tenant id is required');
      }
      const token = await getAccessTokenSilently();
      return getTenantById(token, tenantId);
    },
    staleTime: 60_000,
  });
};

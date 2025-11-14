import { useAuth0 } from '@auth0/auth0-react';
import { useQuery } from '@tanstack/react-query';

import { listTenants, type TenantResponse } from '@/api/tenants';

export const SUPER_ADMIN_TENANTS_QUERY_KEY = ['super-admin', 'tenants'] as const;

export const useSuperAdminTenants = () => {
  const { getAccessTokenSilently, isLoading: isAuthLoading } = useAuth0();

  return useQuery<TenantResponse[]>({
    queryKey: SUPER_ADMIN_TENANTS_QUERY_KEY,
    enabled: !isAuthLoading,
    staleTime: 60_000,
    queryFn: async () => {
      const token = await getAccessTokenSilently();
      return listTenants(token);
    },
  });
};

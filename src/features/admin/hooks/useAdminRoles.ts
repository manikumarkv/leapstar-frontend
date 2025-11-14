import { useAuth0 } from '@auth0/auth0-react';
import { useQuery } from '@tanstack/react-query';

import { getRoles, type ApiRole } from '@/api/roles';

export const ADMIN_ROLES_QUERY_KEY = ['admin', 'roles'] as const;

type UseAdminRolesOptions = {
  tenantId?: string | null;
};

export const useAdminRoles = ({ tenantId }: UseAdminRolesOptions = {}) => {
  const { getAccessTokenSilently, isLoading: isAuthLoading } = useAuth0();

  return useQuery<ApiRole[]>({
    queryKey: [...ADMIN_ROLES_QUERY_KEY, tenantId ?? 'all'],
    enabled: Boolean(tenantId) && !isAuthLoading,
    staleTime: 60_000,
    queryFn: async () => {
      const token = await getAccessTokenSilently();
      return getRoles(token, tenantId);
    },
  });
};

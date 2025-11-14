import { useAuth0 } from '@auth0/auth0-react';
import { useQuery } from '@tanstack/react-query';

import { getRoleById, type ApiRole } from '@/api/roles';

export const ADMIN_ROLE_QUERY_KEY = ['admin', 'role'] as const;

interface UseAdminRoleOptions {
  tenantId?: string | null;
  roleId?: string;
}

export const useAdminRole = ({ tenantId, roleId }: UseAdminRoleOptions) => {
  const { getAccessTokenSilently, isLoading: isAuthLoading } = useAuth0();

  const hasContext = Boolean(tenantId) && Boolean(roleId);

  return useQuery<ApiRole>({
    queryKey: [...ADMIN_ROLE_QUERY_KEY, tenantId ?? 'all', roleId ?? 'unknown'],
    enabled: hasContext && !isAuthLoading,
    staleTime: 60_000,
    queryFn: async () => {
      if (!roleId) {
        throw new Error('Role identifier is required to fetch role details');
      }
      const token = await getAccessTokenSilently();
      return getRoleById(token, roleId, tenantId);
    },
  });
};

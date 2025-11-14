import { useAuth0 } from '@auth0/auth0-react';
import { useQuery } from '@tanstack/react-query';

import { getUsers, type UserListResponse } from '@/api/users';

export const ADMIN_USERS_QUERY_KEY = ['admin', 'users'] as const;

type UseAdminUsersOptions = {
  tenantId?: string | null;
};

export const useAdminUsers = ({ tenantId }: UseAdminUsersOptions = {}) => {
  const { getAccessTokenSilently, isLoading: isAuthLoading } = useAuth0();

  const debugLog = (...values: unknown[]) => {
    if (import.meta.env.DEV) {
      console.log('[useAdminUsers]', ...values);
    }
  };

  debugLog('hook init', { tenantId, isAuthLoading });

  return useQuery<UserListResponse>({
    queryKey: [...ADMIN_USERS_QUERY_KEY, tenantId ?? 'unknown'],
    enabled: Boolean(tenantId) && !isAuthLoading,
    staleTime: 60_000,
    queryFn: async () => {
      debugLog('queryFn start', { tenantId });
      const token = await getAccessTokenSilently();
      debugLog('token resolved', { hasToken: Boolean(token) });
      return getUsers(token, tenantId as string);
    },
    onSuccess: (data) => {
      debugLog('query success', { count: data.length });
    },
    onError: (error) => {
      debugLog('query error', error);
    },
  });
};

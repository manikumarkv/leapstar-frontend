import { useAuth0 } from '@auth0/auth0-react';
import { useQuery } from '@tanstack/react-query';

import { getUserById, type ApiUser } from '@/api/users';

export const ADMIN_USER_QUERY_KEY = ['admin', 'user'] as const;

type UseAdminUserOptions = {
  tenantId?: string | null;
  userId?: string;
};

export const useAdminUser = ({ tenantId, userId }: UseAdminUserOptions = {}) => {
  const { getAccessTokenSilently, isLoading: isAuthLoading } = useAuth0();

  const debugLog = (...values: unknown[]) => {
    if (import.meta.env.DEV) {
      console.log('[useAdminUser]', ...values);
    }
  };

  debugLog('hook init', { tenantId, userId, isAuthLoading });

  return useQuery<ApiUser>({
    queryKey: [...ADMIN_USER_QUERY_KEY, tenantId ?? 'unknown', userId ?? 'unknown'],
    enabled: Boolean(tenantId) && Boolean(userId) && !isAuthLoading,
    staleTime: 60_000,
    queryFn: async () => {
      debugLog('queryFn start', { tenantId, userId });
      const token = await getAccessTokenSilently();
      debugLog('token resolved', { hasToken: Boolean(token) });
      return getUserById(token, tenantId as string, userId as string);
    },
    onSuccess: (data) => {
      debugLog('query success', { id: data._id });
    },
    onError: (error) => {
      debugLog('query error', error);
    },
  });
};

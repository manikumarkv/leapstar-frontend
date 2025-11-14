import { useAuth0 } from '@auth0/auth0-react';
import { useQuery } from '@tanstack/react-query';

import { getSystemSettings, type SystemSettingListResponse } from '@/api/systemSettings';

export const ADMIN_SYSTEM_SETTINGS_QUERY_KEY = ['admin', 'system-settings'] as const;

export const useAdminSystemSettings = () => {
  const { getAccessTokenSilently, isLoading: isAuthLoading } = useAuth0();

  const debugLog = (...values: unknown[]) => {
    if (import.meta.env.DEV) {
      console.log('[useAdminSystemSettings]', ...values);
    }
  };

  debugLog('hook init', { isAuthLoading });

  return useQuery<SystemSettingListResponse>({
    queryKey: ADMIN_SYSTEM_SETTINGS_QUERY_KEY,
    enabled: !isAuthLoading,
    staleTime: 60_000,
    queryFn: async () => {
      debugLog('queryFn start');
      const token = await getAccessTokenSilently();
      debugLog('token resolved', { hasToken: Boolean(token) });
      return getSystemSettings(token);
    },
    onSuccess: (data) => {
      debugLog('query success', { count: data.length });
    },
    onError: (error) => {
      debugLog('query error', error);
    },
  });
};

import { useAuth0 } from '@auth0/auth0-react';
import { useQuery } from '@tanstack/react-query';

import { getPrograms, type ProgramListResponse } from '@/api/programs';

export const ADMIN_PROGRAMS_QUERY_KEY = ['admin', 'programs'] as const;

type UseAdminProgramsOptions = {
  tenantId?: string | null;
};

export const useAdminPrograms = ({ tenantId }: UseAdminProgramsOptions = {}) => {
  const { getAccessTokenSilently, isLoading: isAuthLoading } = useAuth0();

  const debugLog = (...values: unknown[]) => {
    if (import.meta.env.DEV) {
      console.log('[useAdminPrograms]', ...values);
    }
  };

  debugLog('hook init', { tenantId, isAuthLoading });

  return useQuery<ProgramListResponse>({
    queryKey: [...ADMIN_PROGRAMS_QUERY_KEY, tenantId ?? 'unknown'],
    enabled: Boolean(tenantId) && !isAuthLoading,
    staleTime: 60_000,
    queryFn: async () => {
      debugLog('queryFn start', { tenantId });
      const token = await getAccessTokenSilently();
      debugLog('token resolved', { hasToken: Boolean(token) });
      return getPrograms(token, tenantId as string);
    },
    onSuccess: (data) => {
      debugLog('query success', { count: data.length });
    },
    onError: (error) => {
      debugLog('query error', error);
    },
  });
};

import { useAuth0 } from '@auth0/auth0-react';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

import { getPrograms, type ProgramListResponse, type ApiProgramStatus } from '@/api/programs';

export const STUDENT_PROGRAMS_QUERY_KEY = ['student', 'programs'] as const;

type UseStudentProgramsOptions = {
  tenantId?: string | null;
  status?: ApiProgramStatus;
};

export const useStudentPrograms = ({
  tenantId,
  status = 'published',
}: UseStudentProgramsOptions = {}) => {
  const { getAccessTokenSilently, isLoading: isAuthLoading } = useAuth0();

  const debugLog = (...values: unknown[]) => {
    if (import.meta.env.DEV) {
      console.log('[useStudentPrograms]', ...values);
    }
  };

  debugLog('hook init', { tenantId, status, isAuthLoading });

  const query = useQuery<ProgramListResponse>({
    queryKey: [...STUDENT_PROGRAMS_QUERY_KEY, status, tenantId ?? 'unknown'],
    enabled: Boolean(tenantId) && !isAuthLoading,
    staleTime: 60_000,
    queryFn: async () => {
      debugLog('queryFn start', { tenantId, status });
      const token = await getAccessTokenSilently();
      debugLog('token resolved', { hasToken: Boolean(token) });
      return getPrograms(token, tenantId as string, { status });
    },
  });

  useEffect(() => {
    if (query.isSuccess && query.data) {
      debugLog('query success', { count: query.data.length });
    }
  }, [query.isSuccess, query.data]);

  useEffect(() => {
    if (query.isError && query.error) {
      debugLog('query error', query.error);
    }
  }, [query.isError, query.error]);

  return query;
};

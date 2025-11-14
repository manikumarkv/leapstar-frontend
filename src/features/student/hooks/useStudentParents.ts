import { useAuth0 } from '@auth0/auth0-react';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

import { getUserParents, type ApiUserParentSummary } from '@/api/users';

export const STUDENT_PARENTS_QUERY_KEY = ['student', 'parents'] as const;

type UseStudentParentsOptions = {
  tenantId?: string | null;
};

export const useStudentParents = ({ tenantId }: UseStudentParentsOptions = {}) => {
  const { getAccessTokenSilently, isLoading: isAuthLoading } = useAuth0();

  const debugLog = (...messages: unknown[]) => {
    if (import.meta.env.DEV) {
      console.log('[useStudentParents]', ...messages);
    }
  };

  debugLog('hook init', { tenantId, isAuthLoading });

  const query = useQuery<ApiUserParentSummary[]>({
    queryKey: [...STUDENT_PARENTS_QUERY_KEY, tenantId ?? 'unknown'],
    enabled: Boolean(tenantId) && !isAuthLoading,
    staleTime: 30_000,
    queryFn: async () => {
      if (!tenantId) {
        throw new Error('Tenant context missing');
      }
      const token = await getAccessTokenSilently();
      return getUserParents(token, tenantId);
    },
  });

  useEffect(() => {
    if (query.isSuccess) {
      debugLog('query success', { count: query.data?.length });
    }
  }, [query.isSuccess, query.data]);

  useEffect(() => {
    if (query.isError) {
      debugLog('query error', query.error);
    }
  }, [query.isError, query.error]);

  return query;
};

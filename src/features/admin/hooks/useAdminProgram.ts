import { useAuth0 } from '@auth0/auth0-react';
import { useQuery } from '@tanstack/react-query';

import { getProgramById, type ApiProgram } from '@/api/programs';

export const ADMIN_PROGRAM_QUERY_KEY = ['admin', 'program'] as const;

interface UseAdminProgramOptions {
  tenantId?: string | null;
  programId?: string | null;
}

export const useAdminProgram = ({ tenantId, programId }: UseAdminProgramOptions) => {
  const { getAccessTokenSilently, isLoading: isAuthLoading } = useAuth0();

  const enabled = Boolean(tenantId) && Boolean(programId) && !isAuthLoading;

  return useQuery<ApiProgram>({
    queryKey: [...ADMIN_PROGRAM_QUERY_KEY, tenantId ?? 'unknown', programId ?? 'unknown'],
    enabled,
    staleTime: 30_000,
    queryFn: async () => {
      if (!tenantId || !programId) {
        throw new Error('Tenant or program context missing');
      }
      const token = await getAccessTokenSilently();
      return getProgramById(token, tenantId, programId);
    },
  });
};

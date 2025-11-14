import { useAuth0 } from '@auth0/auth0-react';
import {
  useQuery,
  type UseQueryOptions,
  type UseQueryResult,
  type QueryKey,
} from '@tanstack/react-query';

import { getCurrentUser, type CurrentUserResponse } from '@/api/auth';

export const CURRENT_USER_QUERY_KEY = ['auth', 'me'] as const;

export type UseCurrentUserOptions = {
  enabled?: boolean;
  queryOptions?: Omit<
    UseQueryOptions<CurrentUserResponse, unknown, CurrentUserResponse, QueryKey>,
    'queryKey' | 'queryFn' | 'enabled'
  >;
};

export const useCurrentUser = (
  options?: UseCurrentUserOptions,
): UseQueryResult<CurrentUserResponse> => {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();

  const enabled = options?.enabled ?? isAuthenticated;

  return useQuery<CurrentUserResponse>({
    queryKey: CURRENT_USER_QUERY_KEY,
    queryFn: async () => {
      const token = await getAccessTokenSilently();
      return getCurrentUser(token);
    },
    enabled,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    ...options?.queryOptions,
  });
};

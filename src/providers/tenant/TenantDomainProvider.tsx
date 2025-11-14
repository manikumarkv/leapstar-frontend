import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { createContext, useContext, useEffect, useMemo, type PropsWithChildren } from 'react';

import {
  getEmptyTenantDomainContext,
  getTenantDomainContext,
  type TenantDomainContextResponse,
} from '@/api/tenantDomain';
import { setTenantDomainContext } from '@/lib/tenantDomain';

const TENANT_DOMAIN_QUERY_KEY = ['tenant-domain', 'context'] as const;

interface TenantDomainContextValue {
  data: TenantDomainContextResponse;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: unknown;
  refetch: UseQueryResult<TenantDomainContextResponse>['refetch'];
}

const TenantDomainContext = createContext<TenantDomainContextValue | undefined>(undefined);

export const TenantDomainProvider = ({ children }: PropsWithChildren): JSX.Element => {
  const query = useQuery<TenantDomainContextResponse>({
    queryKey: TENANT_DOMAIN_QUERY_KEY,
    queryFn: getTenantDomainContext,
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      if (error instanceof Error) {
        // Avoid hammering the endpoint for persistent errors (e.g., bad configuration).
        return failureCount < 2;
      }
      return failureCount < 2;
    },
  });

  const value = useMemo<TenantDomainContextValue>(
    () => ({
      data: query.data ?? getEmptyTenantDomainContext(),
      isLoading: query.isLoading,
      isFetching: query.isFetching,
      isError: query.isError,
      error: query.error ?? null,
      refetch: query.refetch,
    }),
    [query.data, query.error, query.isError, query.isFetching, query.isLoading, query.refetch],
  );

  useEffect(() => {
    setTenantDomainContext(value.data ?? null);
    return () => {
      setTenantDomainContext(null);
    };
  }, [value.data]);

  return <TenantDomainContext.Provider value={value}>{children}</TenantDomainContext.Provider>;
};

export const useTenantDomain = (): TenantDomainContextValue => {
  const context = useContext(TenantDomainContext);

  if (!context) {
    throw new Error('useTenantDomain must be used within TenantDomainProvider');
  }

  return context;
};

import { useQuery } from '@tanstack/react-query';

import type { HealthStatusResponse } from '@/shared';

import { fetchHealthStatus } from '../api/health';

export const HEALTH_STATUS_QUERY_KEY = ['health-status'];

export const useHealthStatus = () => {
  return useQuery<HealthStatusResponse>({
    queryKey: HEALTH_STATUS_QUERY_KEY,
    queryFn: fetchHealthStatus,
    staleTime: 30_000,
  });
};

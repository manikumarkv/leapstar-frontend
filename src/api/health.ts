import type { HealthStatusResponse } from '@/shared';

import { apiClient } from './client';

export const fetchHealthStatus = () => {
  return apiClient<HealthStatusResponse>('/health');
};

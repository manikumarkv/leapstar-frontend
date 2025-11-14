export type HealthStatusResponse = {
  status: 'ok' | 'degraded' | 'down';
  uptime: number;
  timestamp: string;
  resources: {
    memory: NodeJS.MemoryUsage;
    loadAverage: number[];
  };
};

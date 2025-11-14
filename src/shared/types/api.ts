export interface MemoryUsage {
  rss: number;
  heapTotal: number;
  heapUsed: number;
  external: number;
  arrayBuffers: number;
}

export type HealthStatusResponse = {
  status: 'ok' | 'degraded' | 'down';
  uptime: number;
  timestamp: string;
  resources: {
    memory: MemoryUsage;
    loadAverage: number[];
  };
};

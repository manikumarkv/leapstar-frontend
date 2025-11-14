import { Button } from '@/components/ui/button';

import { useHealthStatus } from '../../hooks/useHealthStatus';

export const HealthStatus = (): JSX.Element => {
  const { data, isLoading, isError, refetch } = useHealthStatus();

  if (isLoading) {
    return <p>Checking health...</p>;
  }

  if (isError) {
    return <p>Backend is unreachable. Please try again later.</p>;
  }

  return (
    <section>
      <h2>System Health</h2>
      <dl>
        <div>
          <dt>Status</dt>
          <dd>{data?.status}</dd>
        </div>
        <div>
          <dt>Uptime</dt>
          <dd>{Math.round((data?.uptime ?? 0) / 60)} minutes</dd>
        </div>
      </dl>
      <Button type="button" variant="secondary" onClick={() => void refetch()}>
        Refresh
      </Button>
    </section>
  );
};

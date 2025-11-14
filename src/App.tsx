import { Suspense } from 'react';

import { AppHeader } from '@/components/layout/AppHeader';

import { HealthStatus } from './features/health/HealthStatus';

export const App = (): JSX.Element => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />
      <main className="container mx-auto px-4 py-12">
        <div className="modern-card animate-fade-in">
          <div className="px-6 py-8 md:px-10">
            <header className="mb-10 flex flex-col gap-3">
              <span className="trust-badge w-max">Operational Dashboard</span>
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                Your launchpad for full-stack productivity
              </h1>
              <p className="max-w-2xl text-muted-foreground">
                Monitor system health, environments, and integrations from a single place. Toggle
                the theme to preview how your product adapts across light and dark experiences.
              </p>
            </header>

            <Suspense fallback={<p className="text-sm text-muted-foreground">Loading status…</p>}>
              <HealthStatus />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
};

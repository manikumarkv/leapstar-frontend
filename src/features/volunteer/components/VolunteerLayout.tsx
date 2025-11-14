import type { ReactNode } from 'react';

import { AppHeader } from '@/components/layout/AppHeader';

interface VolunteerLayoutProps {
  title: string;
  description?: string;
  children?: ReactNode;
}

export const VolunteerLayout = ({
  title,
  description,
  children,
}: VolunteerLayoutProps): JSX.Element => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />
      <main className="container mx-auto px-4 py-12">
        <div className="modern-card bg-card/90 shadow-xl">
          <div className="px-6 py-8 md:px-10">
            <header className="mb-8 space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{title}</h1>
              {description ? (
                <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
                  {description}
                </p>
              ) : null}
            </header>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

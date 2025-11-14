import { useEffect, type ReactNode } from 'react';
import { NavLink } from 'react-router-dom';

import { AppHeader } from '@/components/layout/AppHeader';
import { PageBreadcrumbs, type BreadcrumbItem } from '@/components/navigation/PageBreadcrumbs';
import { cn } from '@/lib/utils';

interface CoachLayoutProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  children?: ReactNode;
  documentTitle?: string;
}

const coachNavItems = [
  { label: 'Dashboard', to: '/coach' },
  { label: 'Programs', to: '/coach/programs' },
  { label: 'Schedule', to: '/coach/schedule' },
  { label: 'Resources', to: '/coach/resources' },
  { label: 'Messages', to: '/coach/messages' },
  { label: 'Profile', to: '/coach/profile' },
  { label: 'Settings', to: '/coach/settings' },
];

export const CoachLayout = ({
  title,
  description,
  breadcrumbs,
  children,
  documentTitle,
}: CoachLayoutProps): JSX.Element => {
  useEffect(() => {
    if (documentTitle) {
      document.title = documentTitle;
    }
  }, [documentTitle]);

  const breadcrumbItems = breadcrumbs ?? [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />
      <main className="container mx-auto px-4 py-10">
        <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="h-fit rounded-2xl border border-border bg-card/70 p-4 shadow-sm">
            <nav className="flex flex-col gap-1">
              {coachNavItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/coach'}
                  className={({ isActive }) =>
                    cn(
                      'rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-primary/10 hover:text-primary',
                      isActive
                        ? 'bg-primary/10 text-primary shadow-inner'
                        : 'text-muted-foreground',
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </aside>
          <section className="modern-card bg-card/90 shadow-xl">
            <div className="px-6 py-8 md:px-10">
              {breadcrumbItems.length ? <PageBreadcrumbs items={breadcrumbItems} /> : null}
              <header className="mb-6 space-y-2">
                <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{title}</h1>
                {description ? (
                  <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
                    {description}
                  </p>
                ) : null}
              </header>
              {children}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

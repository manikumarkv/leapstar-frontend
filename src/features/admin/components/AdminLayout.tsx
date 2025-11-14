import { useEffect, type ReactNode } from 'react';
import { NavLink } from 'react-router-dom';

import { AppHeader } from '@/components/layout/AppHeader';
import { PageBreadcrumbs, type BreadcrumbItem } from '@/components/navigation/PageBreadcrumbs';
import { cn } from '@/lib/utils';

type AdminLayoutProps = {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  children?: ReactNode;
  documentTitle?: string;
};

const navItems = [
  { label: 'Overview', to: '/admin' },
  { label: 'Programs', to: '/admin/programs' },
  { label: 'Users', to: '/admin/users' },
  { label: 'Roles & permissions', to: '/admin/roles' },
  { label: 'Coaches', to: '/admin/coaches' },
  { label: 'Volunteers', to: '/admin/volunteers' },
  { label: 'Payments', to: '/admin/payments' },
  { label: 'Tenant appearance', to: '/admin/appearance' },
  { label: 'Application settings', to: '/admin/appsettings' },
  { label: 'Settings', to: '/admin/settings' },
];

export const AdminLayout = ({
  title,
  description,
  breadcrumbs,
  children,
  documentTitle,
}: AdminLayoutProps): JSX.Element => {
  useEffect(() => {
    if (documentTitle) {
      document.title = documentTitle;
    }
  }, [documentTitle]);

  const breadcrumbItems = breadcrumbs ?? [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />
      <div className="container mx-auto px-4 py-10">
        <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="h-fit rounded-2xl border border-border bg-card/70 p-4 shadow-sm">
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/admin'}
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
          </section>
        </div>
      </div>
    </div>
  );
};

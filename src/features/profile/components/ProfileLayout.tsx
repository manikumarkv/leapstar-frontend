import { useEffect, type ReactNode } from 'react';

import { AppHeader } from '@/components/layout/AppHeader';
import { PageBreadcrumbs, type BreadcrumbItem } from '@/components/navigation/PageBreadcrumbs';

interface ProfileLayoutProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  children?: ReactNode;
  documentTitle?: string;
}

export const ProfileLayout = ({
  title,
  description,
  breadcrumbs,
  children,
  documentTitle,
}: ProfileLayoutProps): JSX.Element => {
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
        <div className="space-y-6">
          {breadcrumbItems.length ? <PageBreadcrumbs items={breadcrumbItems} /> : null}
          <section className="modern-card bg-card/90 shadow-xl">
            <div className="px-6 py-8 md:px-10">
              <header className="mb-6 space-y-2">
                <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{title}</h1>
                {description ? (
                  <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
                    {description}
                  </p>
                ) : null}
              </header>
              <div className="space-y-8">{children}</div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

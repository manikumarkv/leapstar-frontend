import type { BreadcrumbItem } from '@/components/navigation/PageBreadcrumbs';
import { CoachLayout } from '@/features/coach/components/CoachLayout';

const breadcrumbs: BreadcrumbItem[] = [
  { label: 'Coach portal', href: '/coach' },
  { label: 'Dashboard' },
];

export const CoachDashboardPage = (): JSX.Element => {
  return (
    <CoachLayout
      title="Coach dashboard"
      description="Monitor program rosters, share materials, and keep students engaged."
      breadcrumbs={breadcrumbs}
      documentTitle="Coach Dashboard"
    >
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border border-border bg-background/80 p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Today&apos;s programs</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            We&apos;ll highlight the sessions you&apos;re leading today along with quick attendance
            tools.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-background/80 p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Resource library</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Upload lesson plans, share recordings, and distribute homework in a single place.
          </p>
        </div>
      </div>
    </CoachLayout>
  );
};

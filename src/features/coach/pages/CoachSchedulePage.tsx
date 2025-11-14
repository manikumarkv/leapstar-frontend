import type { BreadcrumbItem } from '@/components/navigation/PageBreadcrumbs';
import { CoachLayout } from '@/features/coach/components/CoachLayout';

const breadcrumbs: BreadcrumbItem[] = [
  { label: 'Coach portal', href: '/coach' },
  { label: 'Schedule' },
];

export const CoachSchedulePage = (): JSX.Element => {
  return (
    <CoachLayout
      title="Schedule"
      description="Stay ahead with a consolidated view of your programs, events, and preparation time."
      breadcrumbs={breadcrumbs}
      documentTitle="Coach Schedule"
    >
      <div className="rounded-lg border border-border bg-background/80 p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Calendar integration</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          We&apos;ll sync your upcoming sessions, reminders, and prep windows so you can manage your
          time without leaving the dashboard.
        </p>
      </div>
    </CoachLayout>
  );
};

import { VolunteerLayout } from '@/features/volunteer/components/VolunteerLayout';

export const VolunteerDashboardPage = (): JSX.Element => {
  return (
    <VolunteerLayout
      title="Volunteer dashboard"
      description="Stay informed about upcoming events and opportunities to contribute."
    >
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border border-border bg-background/80 p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Event schedule</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            We&apos;ll list volunteer shifts, event details, and sign-up links as they become
            available.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-background/80 p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Impact tracker</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Celebrate hours served and the positive outcomes you&apos;ve helped create.
          </p>
        </div>
      </div>
    </VolunteerLayout>
  );
};

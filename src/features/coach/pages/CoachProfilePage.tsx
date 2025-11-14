import type { BreadcrumbItem } from '@/components/navigation/PageBreadcrumbs';
import { CoachLayout } from '@/features/coach/components/CoachLayout';

const breadcrumbs: BreadcrumbItem[] = [
  { label: 'Coach portal', href: '/coach' },
  { label: 'Profile & settings' },
];

export const CoachProfilePage = (): JSX.Element => {
  return (
    <CoachLayout
      title="Profile & settings"
      description="Update your availability, bio, and communication preferences."
      breadcrumbs={breadcrumbs}
      documentTitle="Coach Profile"
    >
      <div className="rounded-lg border border-border bg-background/80 p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Account preferences</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Personal details, program eligibility, and notification settings will live here so
          learners know how to reach you.
        </p>
      </div>
    </CoachLayout>
  );
};

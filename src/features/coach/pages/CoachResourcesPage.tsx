import type { BreadcrumbItem } from '@/components/navigation/PageBreadcrumbs';
import { CoachLayout } from '@/features/coach/components/CoachLayout';

const breadcrumbs: BreadcrumbItem[] = [
  { label: 'Coach portal', href: '/coach' },
  { label: 'Resources' },
];

export const CoachResourcesPage = (): JSX.Element => {
  return (
    <CoachLayout
      title="Resources"
      description="Upload lesson plans, manage shared materials, and surface links for your learners."
      breadcrumbs={breadcrumbs}
      documentTitle="Coach Resources"
    >
      <div className="rounded-lg border border-border bg-background/80 p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Resource library</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This space will catalog documents, recordings, and reusable templates that keep your
          programs running smoothly.
        </p>
      </div>
    </CoachLayout>
  );
};

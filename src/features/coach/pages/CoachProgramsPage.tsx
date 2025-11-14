import type { BreadcrumbItem } from '@/components/navigation/PageBreadcrumbs';
import { CoachLayout } from '@/features/coach/components/CoachLayout';

const breadcrumbs: BreadcrumbItem[] = [
  { label: 'Coach portal', href: '/coach' },
  { label: 'Programs' },
];

export const CoachProgramsPage = (): JSX.Element => {
  return (
    <CoachLayout
      title="Programs overview"
      description="Track the programs you lead, review rosters, and prepare for upcoming sessions."
      breadcrumbs={breadcrumbs}
      documentTitle="Coach Programs"
    >
      <div className="rounded-lg border border-border bg-background/80 p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Program planning</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Lesson plans, rosters, and preparation checklists will appear here so you can step into
          each program with confidence.
        </p>
      </div>
    </CoachLayout>
  );
};

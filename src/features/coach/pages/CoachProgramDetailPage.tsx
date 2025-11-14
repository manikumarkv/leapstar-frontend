import { useParams } from 'react-router-dom';

import type { BreadcrumbItem } from '@/components/navigation/PageBreadcrumbs';
import { CoachLayout } from '@/features/coach/components/CoachLayout';

export const CoachProgramDetailPage = (): JSX.Element => {
  const { programId } = useParams<{ programId: string }>();

  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Coach portal', href: '/coach' },
    { label: 'Programs', href: '/coach/programs' },
    { label: programId ? `Program ${programId}` : 'Program workspace' },
  ];

  return (
    <CoachLayout
      title="Program workspace"
      description="Manage lessons, attendance, and materials for this specific program."
      breadcrumbs={breadcrumbs}
      documentTitle={programId ? `Coach Program ${programId}` : 'Coach Program Workspace'}
    >
      <div className="space-y-6">
        <div className="rounded-lg border border-border bg-background/80 p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Program identifier</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            You&apos;re viewing information for program{' '}
            <span className="font-semibold">{programId ?? 'unknown'}</span>. Roster management,
            attendance tools, and communication threads will surface here.
          </p>
        </div>
      </div>
    </CoachLayout>
  );
};

import { useParams } from 'react-router-dom';

import type { BreadcrumbItem } from '@/components/navigation/PageBreadcrumbs';
import { StudentLayout } from '@/features/student/components/StudentLayout';

export const StudentEnrollmentDetailPage = (): JSX.Element => {
  const { enrollmentId } = useParams<{ enrollmentId: string }>();

  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Student portal', href: '/student' },
    { label: 'Enrollments', href: '/student/enrollments' },
    { label: enrollmentId ? `Enrollment ${enrollmentId}` : 'Enrollment details' },
  ];

  return (
    <StudentLayout
      title="Enrollment details"
      description="Track requirements, milestones, and communication for this enrollment."
      breadcrumbs={breadcrumbs}
      documentTitle="Student Enrollment Details"
    >
      <div className="rounded-lg border border-border bg-background/80 p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Enrollment identifier</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          You&apos;re viewing enrollment{' '}
          <span className="font-semibold">{enrollmentId ?? 'unknown'}</span>. Progress updates,
          required actions, and support contacts will appear here.
        </p>
      </div>
    </StudentLayout>
  );
};

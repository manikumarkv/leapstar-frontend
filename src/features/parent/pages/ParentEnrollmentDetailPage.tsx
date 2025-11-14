import { useParams } from 'react-router-dom';

import { ParentLayout } from '@/features/parent/components/ParentLayout';
import { ParentSectionPlaceholder } from '@/features/parent/components/ParentSectionPlaceholder';

export const ParentEnrollmentDetailPage = (): JSX.Element => {
  const { enrollmentId } = useParams<{ enrollmentId: string }>();

  const breadcrumbs = [
    { label: 'Parent dashboard', href: '/parent' },
    { label: 'Enrollments', href: '/parent/enrollments' },
    { label: `Enrollment ${enrollmentId ?? ''}` },
  ];

  return (
    <ParentLayout
      title="Enrollment overview"
      description="Review documents, approvals, and communications related to this enrollment."
      breadcrumbs={breadcrumbs}
      documentTitle="Parent Enrollment Details"
    >
      <ParentSectionPlaceholder
        title={`Enrollment identifier: ${enrollmentId ?? 'unknown'}`}
        description="Important details, submitted forms, and pending tasks will appear here so you can keep your learner on track."
      />
    </ParentLayout>
  );
};

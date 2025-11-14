import { ParentLayout } from '@/features/parent/components/ParentLayout';
import { ParentSectionPlaceholder } from '@/features/parent/components/ParentSectionPlaceholder';

const breadcrumbs = [{ label: 'Parent dashboard' }];

export const ParentDashboardPage = (): JSX.Element => {
  return (
    <ParentLayout
      title="Parent dashboard"
      description="Manage enrollments, approvals, and communication for your learners."
      breadcrumbs={breadcrumbs}
      documentTitle="Parent Dashboard"
    >
      <ParentSectionPlaceholder
        title="Parent overview"
        description="Soon you'll see a snapshot of enrollment activity, outstanding tasks, and upcoming events."
      />
    </ParentLayout>
  );
};

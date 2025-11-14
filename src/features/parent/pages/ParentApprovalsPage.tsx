import { ParentLayout } from '@/features/parent/components/ParentLayout';
import { ParentSectionPlaceholder } from '@/features/parent/components/ParentSectionPlaceholder';

const breadcrumbs = [{ label: 'Parent dashboard', href: '/parent' }, { label: 'Approvals' }];

export const ParentApprovalsPage = (): JSX.Element => {
  return (
    <ParentLayout
      title="Approvals & forms"
      description="Sign waivers, upload documents, and manage outstanding approvals for your learners."
      breadcrumbs={breadcrumbs}
      documentTitle="Parent Approvals"
    >
      <ParentSectionPlaceholder
        title="Nothing pending yet"
        description="When your attention is needed for an approval or signature, it will show up here with clear next steps."
      />
    </ParentLayout>
  );
};

import { ParentLayout } from '@/features/parent/components/ParentLayout';
import { ParentSectionPlaceholder } from '@/features/parent/components/ParentSectionPlaceholder';

const breadcrumbs = [{ label: 'Parent dashboard', href: '/parent' }, { label: 'Resources' }];

export const ParentResourcesPage = (): JSX.Element => {
  return (
    <ParentLayout
      title="Resources"
      description="Access guides, event info, and helpful links to support your family’s journey."
      breadcrumbs={breadcrumbs}
      documentTitle="Parent Resources"
    >
      <ParentSectionPlaceholder
        title="Resource hub"
        description="We'll gather newsletters, calendars, and quick links here so you always know what's next."
      />
    </ParentLayout>
  );
};

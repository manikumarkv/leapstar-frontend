import { ParentLayout } from '@/features/parent/components/ParentLayout';
import { ParentSectionPlaceholder } from '@/features/parent/components/ParentSectionPlaceholder';

const breadcrumbs = [{ label: 'Parent dashboard', href: '/parent' }, { label: 'Messages' }];

export const ParentMessagesPage = (): JSX.Element => {
  return (
    <ParentLayout
      title="Messages"
      description="Stay connected with coaches, administrators, and other families."
      breadcrumbs={breadcrumbs}
      documentTitle="Parent Messages"
    >
      <ParentSectionPlaceholder
        title="Inbox coming soon"
        description="Announcements, conversation history, and action items will live here once messaging is enabled."
      />
    </ParentLayout>
  );
};

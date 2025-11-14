import { ParentLayout } from '@/features/parent/components/ParentLayout';
import { EmailPreferencesPage } from '@/features/settings/pages/EmailPreferencesPage';

export const ParentSettingsPage = (): JSX.Element => {
  return (
    <ParentLayout
      title="Settings"
      description="Manage communication preferences."
      documentTitle="Parent Settings"
    >
      <EmailPreferencesPage />
    </ParentLayout>
  );
};

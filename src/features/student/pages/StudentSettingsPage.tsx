import { EmailPreferencesPage } from '@/features/settings/pages/EmailPreferencesPage';
import { StudentLayout } from '@/features/student/components/StudentLayout';

export const StudentSettingsPage = (): JSX.Element => {
  return (
    <StudentLayout
      title="Settings"
      description="Manage communication preferences."
      documentTitle="Student Settings"
    >
      <EmailPreferencesPage />
    </StudentLayout>
  );
};

import { AdminLayout } from '@/features/admin/components/AdminLayout';
import { EmailPreferencesPage } from '@/features/settings/pages/EmailPreferencesPage';

export const AdminSettingsPage = (): JSX.Element => {
  return (
    <AdminLayout
      title="Settings"
      description="Manage communication preferences."
      documentTitle="Admin Settings"
    >
      <EmailPreferencesPage />
    </AdminLayout>
  );
};

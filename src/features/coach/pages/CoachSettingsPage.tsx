import { CoachLayout } from '@/features/coach/components/CoachLayout';
import { EmailPreferencesPage } from '@/features/settings/pages/EmailPreferencesPage';

export const CoachSettingsPage = (): JSX.Element => {
  return (
    <CoachLayout
      title="Settings"
      description="Manage communication preferences."
      documentTitle="Coach Settings"
    >
      <EmailPreferencesPage />
    </CoachLayout>
  );
};

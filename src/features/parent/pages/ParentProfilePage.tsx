import type { BreadcrumbItem } from '@/components/navigation/PageBreadcrumbs';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';
import { ProfileContactCard } from '@/features/profile/components/ProfileContactCard';
import { ProfileEditableForm } from '@/features/profile/components/ProfileEditableForm';
import { ProfileEmergencyCard } from '@/features/profile/components/ProfileEmergencyCard';

import { ParentLayout } from '../components/ParentLayout';

const breadcrumbs: BreadcrumbItem[] = [
  { label: 'Parent dashboard', href: '/parent' },
  { label: 'Profile' },
];

export const ParentProfilePage = (): JSX.Element => {
  const { data: currentUser, isLoading } = useCurrentUser();
  const user = currentUser?.user;
  const tenantId = currentUser?.tenant?.id;
  const emergencyContact = undefined; // TODO: integrate when API exposes

  return (
    <ParentLayout
      title="Family profile"
      description="Update household details, emergency contacts, and communication preferences."
      breadcrumbs={breadcrumbs}
      documentTitle="Parent Profile"
    >
      <section className="grid gap-4 md:grid-cols-2">
        <ProfileContactCard user={user} isLoading={isLoading} />
        <ProfileEmergencyCard emergencyContact={emergencyContact} isLoading={isLoading} />
      </section>
      <ProfileEditableForm tenantId={tenantId} />
    </ParentLayout>
  );
};

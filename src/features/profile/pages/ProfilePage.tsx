import { useMemo } from 'react';

import type { BreadcrumbItem } from '@/components/navigation/PageBreadcrumbs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';

import { ProfileContactCard } from '../components/ProfileContactCard';
import { ProfileEditableForm } from '../components/ProfileEditableForm';
import { ProfileEmergencyCard } from '../components/ProfileEmergencyCard';
import { ProfileLayout } from '../components/ProfileLayout';

const breadcrumbs: BreadcrumbItem[] = [{ label: 'Profile' }];

export const ProfilePage = (): JSX.Element => {
  const { data: currentUser, isLoading } = useCurrentUser();
  const user = currentUser?.user;
  const tenantId = currentUser?.tenant?.id;

  const emergencyContact = useMemo(() => {
    // Placeholder until backend exposes emergency contact on /auth/me
    return undefined;
  }, []);

  return (
    <ProfileLayout
      title="Your profile"
      description="Manage your personal information and emergency contact details."
      breadcrumbs={breadcrumbs}
      documentTitle="Profile"
    >
      <section className="grid gap-4 md:grid-cols-2">
        <ProfileContactCard user={user} isLoading={isLoading} />
        <ProfileEmergencyCard emergencyContact={emergencyContact} isLoading={isLoading} />
      </section>

      <Card className="border-border/80">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-foreground">Update profile</CardTitle>
          <CardDescription>Changes apply to all dashboards you can access.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileEditableForm tenantId={tenantId} />
        </CardContent>
      </Card>
    </ProfileLayout>
  );
};

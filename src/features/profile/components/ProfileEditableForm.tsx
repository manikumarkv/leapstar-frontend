import { useAuth0 } from '@auth0/auth0-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import {
  updateUserProfile,
  getUserById,
  type UpdateUserProfilePayload,
  type ApiUser,
} from '@/api/users';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';

interface ProfileEditableFormProps {
  tenantId?: string | null;
}

export const ProfileEditableForm = ({ tenantId }: ProfileEditableFormProps): JSX.Element => {
  const { data: currentUser, refetch } = useCurrentUser();
  const authUser = currentUser?.user;
  const { getAccessTokenSilently } = useAuth0();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Local form state (initialized after fetching full user document)
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyRelation, setEmergencyRelation] = useState('');
  const [emergencyEmail, setEmergencyEmail] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [initialized, setInitialized] = useState(false);

  const [isSaving, setIsSaving] = useState(false);

  const { data: fullUser, isFetching: isUserLoading } = useQuery<ApiUser | undefined>(
    ['user', authUser?.id],
    async () => {
      if (!tenantId || !authUser?.id) return undefined;
      const token = await getAccessTokenSilently();
      return getUserById(token, tenantId, authUser.id);
    },
    {
      enabled: Boolean(tenantId && authUser?.id),
      staleTime: 60_000,
    },
  );

  useEffect(() => {
    if (fullUser && !initialized) {
      setFirstName(fullUser.profile?.firstName ?? '');
      setLastName(fullUser.profile?.lastName ?? '');
      setDisplayName(fullUser.profile?.displayName ?? '');
      setContactEmail(fullUser.profile?.contact?.email ?? '');
      setContactPhone(fullUser.profile?.contact?.phone ?? '');
      setEmergencyName(fullUser.profile?.emergencyContact?.name ?? '');
      setEmergencyRelation(fullUser.profile?.emergencyContact?.relation ?? '');
      setEmergencyEmail(fullUser.profile?.emergencyContact?.email ?? '');
      setEmergencyPhone(fullUser.profile?.emergencyContact?.phone ?? '');
      setInitialized(true);
    }
  }, [fullUser, initialized]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!tenantId || !authUser?.id) {
      toast.error('Cannot update profile', { description: 'Missing tenant or user context.' });
      return;
    }
    setIsSaving(true);
    try {
      const token = await getAccessTokenSilently();
      const payload: UpdateUserProfilePayload = {
        firstName: firstName || null,
        lastName: lastName || null,
        displayName: displayName || null,
        contactEmail: contactEmail || null,
        contactPhone: contactPhone || null,
        emergencyContact: {
          name: emergencyName || null,
          relation: emergencyRelation || null,
          email: emergencyEmail || null,
          phone: emergencyPhone || null,
        },
      };
      // Clean empty emergencyContact fields: if all null -> send null
      if (
        [
          payload.emergencyContact?.name,
          payload.emergencyContact?.relation,
          payload.emergencyContact?.email,
          payload.emergencyContact?.phone,
        ].every((v) => v === null || v === undefined || v === '' || v === null)
      ) {
        payload.emergencyContact = null;
      }
      await updateUserProfile(token, tenantId, authUser.id, payload);
      toast.success('Profile saved');
      void refetch();
      await queryClient.invalidateQueries(['user', authUser.id]);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to save profile';
      toast.error('Save failed', { description: message });
    } finally {
      setIsSaving(false);
    }
  };

  if (isUserLoading && !initialized) {
    return <div className="text-sm text-muted-foreground">Loading profile...</div>;
  }

  return (
    <form
      onSubmit={(e) => {
        void handleSubmit(e);
      }}
      className="space-y-4"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm">
          <span className="font-medium text-foreground">First name</span>
          <Input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Jordan"
            disabled={isSaving}
          />
        </label>
        <label className="grid gap-2 text-sm">
          <span className="font-medium text-foreground">Last name</span>
          <Input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Lee"
            disabled={isSaving}
          />
        </label>
      </div>
      <label className="grid gap-2 text-sm">
        <span className="font-medium text-foreground">Display name</span>
        <Input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Jordan L."
          disabled={isSaving}
        />
      </label>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm">
          <span className="font-medium text-foreground">Contact email</span>
          <Input
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            placeholder="contact@example.org"
            disabled={isSaving}
          />
        </label>
        <label className="grid gap-2 text-sm">
          <span className="font-medium text-foreground">Contact phone</span>
          <Input
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            placeholder="(555) 123-4567"
            disabled={isSaving}
          />
        </label>
      </div>
      <fieldset className="border rounded-md p-4 space-y-4">
        <legend className="px-1 text-sm font-medium">Emergency contact</legend>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm">
            <span className="font-medium text-foreground">Name</span>
            <Input
              value={emergencyName}
              onChange={(e) => setEmergencyName(e.target.value)}
              placeholder="Alex Rivera"
              disabled={isSaving}
            />
          </label>
          <label className="grid gap-2 text-sm">
            <span className="font-medium text-foreground">Relation</span>
            <Input
              value={emergencyRelation}
              onChange={(e) => setEmergencyRelation(e.target.value)}
              placeholder="Parent / Guardian"
              disabled={isSaving}
            />
          </label>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm">
            <span className="font-medium text-foreground">Emergency email</span>
            <Input
              type="email"
              value={emergencyEmail}
              onChange={(e) => setEmergencyEmail(e.target.value)}
              placeholder="alex@example.org"
              disabled={isSaving}
            />
          </label>
          <label className="grid gap-2 text-sm">
            <span className="font-medium text-foreground">Emergency phone</span>
            <Input
              value={emergencyPhone}
              onChange={(e) => setEmergencyPhone(e.target.value)}
              placeholder="(555) 987-6543"
              disabled={isSaving}
            />
          </label>
        </div>
        <p className="text-xs text-muted-foreground">
          These details are used if we need to reach someone urgently about your account or a
          dependent.
        </p>
      </fieldset>
      <div className="text-xs text-muted-foreground -mt-2">
        Primary email ({authUser?.email}) is managed via authentication provider and cannot be
        changed here.
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={isSaving || !tenantId}>
          {isSaving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Check className="mr-2 h-4 w-4" />
          )}
          Save profile
        </Button>
      </div>
    </form>
  );
};

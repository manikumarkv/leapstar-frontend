import { useAuth0 } from '@auth0/auth0-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ChangeEvent, FormEvent } from 'react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ApiError } from '@/api/client';
import { inviteUser, type InviteUserPayload } from '@/api/users';
import type { BreadcrumbItem } from '@/components/navigation/PageBreadcrumbs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ADMIN_USERS_QUERY_KEY } from '@/features/admin/hooks/useAdminUsers';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';

import { AdminLayout } from '../components/AdminLayout';

const breadcrumbs: BreadcrumbItem[] = [
  { label: 'Admin portal', href: '/admin' },
  { label: 'Users', href: '/admin/users' },
  { label: 'Create user' },
];

const defaultRoleOptions = [
  { label: 'Admin', value: 'admin' },
  { label: 'Coach', value: 'coach' },
  { label: 'Student', value: 'student' },
  { label: 'Parent', value: 'parent' },
  { label: 'Volunteer', value: 'volunteer' },
];

export const AdminUserCreatePage = (): JSX.Element => {
  const { getAccessTokenSilently } = useAuth0();
  const queryClient = useQueryClient();
  const { data: currentUser } = useCurrentUser();
  const navigate = useNavigate();

  const roleOptions = useMemo(() => defaultRoleOptions, []);

  const [formValues, setFormValues] = useState({
    role: '',
    email: '',
    firstName: '',
    lastName: '',
  });

  const isFormIncomplete =
    !formValues.role || !formValues.email || !formValues.firstName || !formValues.lastName;

  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const tenantId = currentUser?.tenant?.id ?? null;

  const createUserMutation = useMutation({
    mutationFn: async (payload: InviteUserPayload) => {
      if (!tenantId) {
        throw new Error('Tenant context missing');
      }

      const token = await getAccessTokenSilently();
      return inviteUser(token, tenantId, payload);
    },
    onSuccess: async (user) => {
      setSubmissionError(null);
      if (tenantId) {
        await queryClient.invalidateQueries({
          queryKey: [...ADMIN_USERS_QUERY_KEY, tenantId],
        });
      }
      navigate(`/admin/users/${user._id}`);
    },
    onError: (error: unknown) => {
      if (error instanceof ApiError) {
        setSubmissionError(error.message);
        return;
      }
      if (error instanceof Error) {
        setSubmissionError(error.message);
        return;
      }
      setSubmissionError('Failed to create the user. Please try again.');
    },
  });

  const isSubmitting = createUserMutation.isPending;

  const handleInputChange =
    (field: 'email' | 'firstName' | 'lastName') => (event: ChangeEvent<HTMLInputElement>) => {
      setFormValues((previous) => ({
        ...previous,
        [field]: event.target.value,
      }));
    };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!tenantId) {
      setSubmissionError('Tenant context is missing. Refresh and try again.');
      return;
    }

    const payload: InviteUserPayload = {
      role: formValues.role,
      email: formValues.email.trim().toLowerCase(),
      firstName: formValues.firstName.trim(),
      lastName: formValues.lastName.trim(),
    };

    setSubmissionError(null);
    createUserMutation.mutate(payload);
  };

  return (
    <AdminLayout
      title="Create user"
      description="Invite a teammate, learner, or guardian to your organization."
      breadcrumbs={breadcrumbs}
      documentTitle="Create Admin User"
    >
      <Card className="max-w-2xl border-border/80">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">User details</CardTitle>
          <CardDescription>
            Provide the role and contact details for the new account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {submissionError ? (
            <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
              {submissionError}
            </div>
          ) : null}
          {!tenantId ? (
            <div className="mb-6 rounded-lg border border-amber-300/40 bg-amber-100/40 p-4 text-sm text-amber-700">
              Tenant context unavailable. Ensure your profile is loaded before inviting users.
            </div>
          ) : null}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={formValues.role || undefined}
                  onValueChange={(value) => {
                    setFormValues((previous) => ({
                      ...previous,
                      role: value,
                    }));
                  }}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="user@example.com"
                  value={formValues.email}
                  onChange={handleInputChange('email')}
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="grid gap-2 md:grid-cols-2 md:gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="first-name">First name</Label>
                  <Input
                    id="first-name"
                    autoComplete="given-name"
                    placeholder="Alex"
                    value={formValues.firstName}
                    onChange={handleInputChange('firstName')}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="last-name">Last name</Label>
                  <Input
                    id="last-name"
                    autoComplete="family-name"
                    placeholder="Rivera"
                    value={formValues.lastName}
                    onChange={handleInputChange('lastName')}
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/admin/users')}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isFormIncomplete || isSubmitting || !tenantId}>
                {isSubmitting ? 'Sending…' : 'Send invite'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

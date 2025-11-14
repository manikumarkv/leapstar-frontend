import { useAuth0 } from '@auth0/auth0-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle,
  CalendarDays,
  Check,
  Gift,
  Mail,
  Phone,
  Plus,
  ShieldCheck,
  UserCheck,
  UserCircle,
  UserX,
  Users,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import {
  updateUserMembership,
  updateUserProfile,
  type ApiUser,
  type UpdateUserMembershipPayload,
  type UpdateUserProfilePayload,
} from '@/api/users';
import type { BreadcrumbItem } from '@/components/navigation/PageBreadcrumbs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/use-toast';
import { useAdminRoles } from '@/features/admin/hooks/useAdminRoles';
import { ADMIN_USER_QUERY_KEY, useAdminUser } from '@/features/admin/hooks/useAdminUser';
import { ADMIN_USERS_QUERY_KEY } from '@/features/admin/hooks/useAdminUsers';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';

import { AdminLayout } from '../components/AdminLayout';

const buildBreadcrumbs = (id?: string): BreadcrumbItem[] => {
  return [
    { label: 'Admin portal', href: '/admin' },
    { label: 'Users', href: '/admin/users' },
    { label: id ? `User ${id}` : 'User profile' },
  ];
};

function resolveMembership(user: ApiUser | undefined, tenantId: string | null) {
  if (!user) {
    return undefined;
  }

  const memberships = user.tenantMemberships ?? [];
  if (!memberships.length) {
    return undefined;
  }

  const match = memberships.find((membership) => membership.tenant === tenantId);
  return match ?? memberships[0];
}

const formatDate = (value: string | undefined): string => {
  if (!value) {
    return '--';
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '--' : date.toLocaleDateString();
};

const toNullableString = (value: string): string | null => {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const coerceNonNegativeInteger = (value: string, fallback = 0): number => {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 0) {
    return fallback;
  }
  return parsed;
};

export const AdminUserDetailPage = (): JSX.Element => {
  const { id: paramId } = useParams<{ id: string }>();
  const { data: currentUser } = useCurrentUser();
  const tenantId = currentUser?.tenant?.id ?? null;

  const queryClient = useQueryClient();
  const { getAccessTokenSilently } = useAuth0();

  const userQuery = useAdminUser({ tenantId, userId: paramId });
  const { data: user, isLoading, isError, refetch } = userQuery;
  const rolesQuery = useAdminRoles({ tenantId });

  const userId = user?._id ?? paramId ?? '';

  const breadcrumbs = useMemo(() => buildBreadcrumbs(userId || paramId), [paramId, userId]);

  const membership = useMemo(() => resolveMembership(user, tenantId), [tenantId, user]);
  const roles = membership?.roles ?? [];

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [primaryEmail, setPrimaryEmail] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  const [membershipStatus, setMembershipStatus] = useState<'invited' | 'active' | 'suspended'>(
    'invited',
  );
  const [rewardCredits, setRewardCredits] = useState('0');
  const [roleIds, setRoleIds] = useState<string[]>([]);
  const [rolePickerValue, setRolePickerValue] = useState('');

  useEffect(() => {
    if (!user) {
      return;
    }
    setFirstName(user.profile?.firstName ?? '');
    setLastName(user.profile?.lastName ?? '');
    setDisplayName(user.profile?.displayName ?? '');
    setPrimaryEmail(user.email ?? '');
    setContactEmail(user.profile?.contact?.email ?? '');
    setContactPhone(user.profile?.contact?.phone ?? '');
  }, [user]);

  useEffect(() => {
    if (!membership) {
      setRoleIds([]);
      return;
    }
    setMembershipStatus(membership.status ?? 'invited');
    setRewardCredits(String(membership.rewardCredits ?? 0));
    setRoleIds(
      Array.from(new Set((membership.roles ?? []).map((role) => role._id).filter(Boolean))),
    );
  }, [membership]);

  const derivedName = useMemo(() => {
    if (!user) {
      return 'User profile';
    }
    const candidates = [
      user.profile?.displayName,
      [user.profile?.firstName, user.profile?.lastName].filter(Boolean).join(' ').trim(),
      user.name,
      user.email,
    ];
    return (
      candidates.find((value) => typeof value === 'string' && value.trim().length > 0)?.trim() ??
      'User profile'
    );
  }, [user]);

  const tenantLabel =
    membership?.tenant === tenantId
      ? (currentUser?.tenant?.name ?? 'Current tenant')
      : 'Multi-tenant';

  const profileMutation = useMutation({
    mutationFn: async (payload: UpdateUserProfilePayload) => {
      if (!tenantId || !userId) {
        throw new Error('Tenant context missing');
      }
      const token = await getAccessTokenSilently();
      return updateUserProfile(token, tenantId, userId, payload);
    },
    onSuccess: async () => {
      if (tenantId && userId) {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: [...ADMIN_USER_QUERY_KEY, tenantId, userId] }),
          queryClient.invalidateQueries({ queryKey: [...ADMIN_USERS_QUERY_KEY, tenantId] }),
        ]);
      }
      toast.success('Profile updated');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Unable to update profile');
    },
  });

  const membershipMutation = useMutation({
    mutationFn: async (payload: UpdateUserMembershipPayload) => {
      if (!tenantId || !userId) {
        throw new Error('Tenant context missing');
      }
      const token = await getAccessTokenSilently();
      return updateUserMembership(token, tenantId, userId, payload);
    },
    onSuccess: async (_data, variables) => {
      if (tenantId && userId) {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: [...ADMIN_USER_QUERY_KEY, tenantId, userId] }),
          queryClient.invalidateQueries({ queryKey: [...ADMIN_USERS_QUERY_KEY, tenantId] }),
        ]);
      }
      if (variables.status) {
        toast.success(`Membership status updated to ${variables.status}`);
      } else if (variables.roleIds || variables.roleIdsToAdd || variables.roleIdsToRemove) {
        toast.success('Roles updated');
      } else {
        toast.success('Membership updated');
      }
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Unable to update membership');
    },
  });

  const isProfileSaving = profileMutation.isPending;
  const isMembershipSaving = membershipMutation.isPending;

  const handleProfileSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!tenantId || !userId) {
      toast.error('Unable to update profile without tenant context');
      return;
    }

    const payload: UpdateUserProfilePayload = {
      firstName: toNullableString(firstName),
      lastName: toNullableString(lastName),
      displayName: toNullableString(displayName),
      contactEmail: toNullableString(contactEmail),
      contactPhone: toNullableString(contactPhone),
    };

    profileMutation.mutate(payload);
  };

  const handleMembershipSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!tenantId || !userId || !membership) {
      toast.error('Membership cannot be updated right now');
      return;
    }

    const payload: UpdateUserMembershipPayload = {
      status: membershipStatus,
      rewardCredits: coerceNonNegativeInteger(rewardCredits, membership.rewardCredits ?? 0),
      roleIds,
    };

    membershipMutation.mutate(payload);
  };

  const handleActivate = () => {
    if (!tenantId || !userId) {
      toast.error('Tenant context missing');
      return;
    }
    setMembershipStatus('active');
    membershipMutation.mutate({ status: 'active' });
  };

  const handleSuspend = () => {
    if (!tenantId || !userId) {
      toast.error('Tenant context missing');
      return;
    }
    setMembershipStatus('suspended');
    membershipMutation.mutate({ status: 'suspended' });
  };

  const toggleRole = (roleId: string) => {
    setRoleIds((current) =>
      current.includes(roleId) ? current.filter((value) => value !== roleId) : [...current, roleId],
    );
  };

  const handleAddRole = () => {
    if (!rolePickerValue) {
      return;
    }
    setRoleIds((current) =>
      current.includes(rolePickerValue) ? current : [...current, rolePickerValue],
    );
    setRolePickerValue('');
  };

  const rolesAvailable = rolesQuery.data ?? [];

  return (
    <AdminLayout
      title={derivedName}
      description="Adjust membership, roles, and account status settings."
      breadcrumbs={breadcrumbs}
      documentTitle={userId ? `Admin User ${userId}` : 'Admin User Profile'}
    >
      <div className="flex flex-col gap-8">
        {isError ? (
          <Card className="border-destructive/40 bg-destructive/5">
            <CardHeader className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-4 w-4" />
                Unable to load user details
              </div>
              <CardDescription className="text-destructive">
                Try reloading the page or contact support if the issue persists.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" onClick={() => refetch()}>
                Retry fetch
              </Button>
            </CardContent>
          </Card>
        ) : null}

        <section className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                <UserCircle className="h-4 w-4" />
                Account overview
              </div>
              <CardTitle className="text-2xl font-semibold text-foreground">
                {isLoading ? <Skeleton className="h-8 w-48" /> : derivedName}
              </CardTitle>
              <CardDescription>
                {isLoading ? (
                  <Skeleton className="h-4 w-64" />
                ) : (
                  (user?.email ?? 'Email unavailable')
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-lg border border-border/60 bg-card/40 p-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    Tenant
                  </div>
                  {isLoading ? (
                    <Skeleton className="mt-2 h-5 w-32" />
                  ) : (
                    <p className="mt-2 text-foreground">{tenantLabel}</p>
                  )}
                </div>
                <div className="rounded-lg border border-border/60 bg-card/40 p-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <ShieldCheck className="h-4 w-4" />
                    Membership status
                  </div>
                  {isLoading ? (
                    <Skeleton className="mt-2 h-5 w-24" />
                  ) : (
                    <p className="mt-2 capitalize text-foreground">
                      {membership?.status ?? 'Unknown'}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-lg border border-border/60 bg-card/40 p-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Gift className="h-4 w-4" />
                    Reward credits
                  </div>
                  {isLoading ? (
                    <Skeleton className="mt-2 h-5 w-20" />
                  ) : (
                    <p className="mt-2 text-foreground">{membership?.rewardCredits ?? 0}</p>
                  )}
                </div>
                <div className="rounded-lg border border-border/60 bg-card/40 p-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CalendarDays className="h-4 w-4" />
                    Created
                  </div>
                  {isLoading ? (
                    <Skeleton className="mt-2 h-5 w-24" />
                  ) : (
                    <p className="mt-2 text-foreground">{formatDate(user?.createdAt)}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                <Mail className="h-4 w-4" />
                Contact
              </div>
              <CardDescription>Reach out directly or update contact preferences.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              {isLoading ? (
                <>
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-32" />
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 break-all">
                    <Mail className="h-4 w-4 text-foreground" />
                    <span>{user?.email ?? 'Email unavailable'}</span>
                  </div>
                  <div className="flex items-center gap-2 break-all">
                    <Mail className="h-4 w-4 text-foreground" />
                    <span>{user?.profile?.contact?.email ?? 'Contact email not provided'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4 text-foreground" />
                    <span>{user?.profile?.contact?.phone ?? 'Phone not provided'}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <Card className="border-border/80">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-foreground">
                Roles & permissions
              </CardTitle>
              <CardDescription>Role assignments scoped to this tenant membership.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-5 w-28" />
                </div>
              ) : roles.length ? (
                <ul className="space-y-2 text-sm">
                  {roles.map((role) => (
                    <li
                      key={role._id}
                      className="rounded-lg border border-border/60 bg-card/40 p-3"
                    >
                      <div className="font-medium text-foreground">
                        {role.displayName ?? role.name}
                      </div>
                      {role.description ? (
                        <p className="text-xs text-muted-foreground">{role.description}</p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No roles assigned for this membership.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/80">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-foreground">
                Relationships
              </CardTitle>
              <CardDescription>Linked parents, students, or other associations.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-5 w-32" />
                </div>
              ) : (
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div>
                    <div className="font-medium text-foreground">Parents</div>
                    <p>{membership?.relationships?.parents?.length ?? 0} linked</p>
                  </div>
                  <div>
                    <div className="font-medium text-foreground">Students</div>
                    <p>{membership?.relationships?.students?.length ?? 0} linked</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <Card className="border-border/80">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-foreground">
                Profile settings
              </CardTitle>
              <CardDescription>
                Update primary information shared across the platform.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleProfileSubmit}>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="grid gap-2 text-sm">
                    <span className="font-medium text-foreground">First name</span>
                    <Input
                      value={firstName}
                      onChange={(event) => setFirstName(event.target.value)}
                      disabled={isLoading || isProfileSaving}
                      placeholder="Jordan"
                    />
                  </label>
                  <label className="grid gap-2 text-sm">
                    <span className="font-medium text-foreground">Last name</span>
                    <Input
                      value={lastName}
                      onChange={(event) => setLastName(event.target.value)}
                      disabled={isLoading || isProfileSaving}
                      placeholder="Williams"
                    />
                  </label>
                </div>
                <label className="grid gap-2 text-sm">
                  <span className="font-medium text-foreground">Display name</span>
                  <Input
                    value={displayName}
                    onChange={(event) => setDisplayName(event.target.value)}
                    disabled={isLoading || isProfileSaving}
                    placeholder="Coach Jordan"
                  />
                </label>
                <label className="grid gap-2 text-sm">
                  <span className="font-medium text-foreground">Primary email</span>
                  <Input
                    type="email"
                    value={primaryEmail}
                    onChange={(event) => setPrimaryEmail(event.target.value)}
                    disabled={isLoading || isProfileSaving}
                    placeholder="coach@example.org"
                  />
                </label>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="grid gap-2 text-sm">
                    <span className="font-medium text-foreground">Contact email</span>
                    <Input
                      type="email"
                      value={contactEmail}
                      onChange={(event) => setContactEmail(event.target.value)}
                      disabled={isLoading || isProfileSaving}
                      placeholder="coach@school.org"
                    />
                  </label>
                  <label className="grid gap-2 text-sm">
                    <span className="font-medium text-foreground">Contact phone</span>
                    <Input
                      value={contactPhone}
                      onChange={(event) => setContactPhone(event.target.value)}
                      disabled={isLoading || isProfileSaving}
                      placeholder="555-0000"
                    />
                  </label>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button type="submit" disabled={isLoading || isProfileSaving || !tenantId}>
                    <Check className="mr-2 h-4 w-4" /> Save profile
                  </Button>
                  <Button asChild variant="outline">
                    <Link to="/admin/users">Back to directory</Link>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="border-border/80">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-foreground">
                Membership controls
              </CardTitle>
              <CardDescription>
                Activate, suspend, or adjust tenant-specific access.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {membership ? (
                <form className="space-y-4" onSubmit={handleMembershipSubmit}>
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="grid gap-2 text-sm">
                      <span className="font-medium text-foreground">Status</span>
                      <Select
                        value={membershipStatus}
                        onValueChange={(value: 'invited' | 'active' | 'suspended') =>
                          setMembershipStatus(value)
                        }
                        disabled={isLoading || isMembershipSaving}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="invited">Invited</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="suspended">Suspended</SelectItem>
                        </SelectContent>
                      </Select>
                    </label>
                    <label className="grid gap-2 text-sm">
                      <span className="font-medium text-foreground">Reward credits</span>
                      <Input
                        inputMode="numeric"
                        value={rewardCredits}
                        onChange={(event) =>
                          setRewardCredits(event.target.value.replace(/[^0-9]/g, ''))
                        }
                        disabled={isLoading || isMembershipSaving}
                        placeholder="0"
                      />
                    </label>
                  </div>

                  <div className="rounded-lg border border-border/60 bg-card/40 p-4">
                    <div className="mb-3 text-sm font-medium text-foreground">Role toggles</div>
                    <div className="grid gap-2 text-sm">
                      {rolesQuery.isLoading ? (
                        <Skeleton className="h-5 w-32" />
                      ) : rolesAvailable.length ? (
                        rolesAvailable.map((role) => {
                          const isChecked = roleIds.includes(role._id);
                          return (
                            <label
                              key={role._id}
                              className="flex items-center justify-between rounded-md border border-border/50 bg-background px-3 py-2"
                            >
                              <div className="flex flex-col">
                                <span className="font-medium text-foreground">
                                  {role.displayName ?? role.name}
                                </span>
                                {role.description ? (
                                  <span className="text-xs text-muted-foreground">
                                    {role.description}
                                  </span>
                                ) : null}
                              </div>
                              <input
                                type="checkbox"
                                className="h-4 w-4 accent-primary"
                                checked={isChecked}
                                onChange={() => toggleRole(role._id)}
                                disabled={isMembershipSaving}
                              />
                            </label>
                          );
                        })
                      ) : (
                        <p className="text-xs text-muted-foreground">No roles available.</p>
                      )}
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <Select
                        value={rolePickerValue}
                        onValueChange={setRolePickerValue}
                        disabled={rolesQuery.isLoading || isMembershipSaving}
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          {rolesAvailable
                            .filter((role) => !roleIds.includes(role._id))
                            .map((role) => (
                              <SelectItem key={role._id} value={role._id}>
                                {role.displayName ?? role.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={!rolePickerValue || isMembershipSaving}
                        onClick={handleAddRole}
                      >
                        <Plus className="mr-2 h-4 w-4" /> Add role
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button type="submit" disabled={isMembershipSaving || isLoading || !tenantId}>
                      <Check className="mr-2 h-4 w-4" /> Save membership
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isMembershipSaving || !tenantId}
                      onClick={handleActivate}
                    >
                      <UserCheck className="mr-2 h-4 w-4" /> Activate
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      disabled={isMembershipSaving || !tenantId}
                      onClick={handleSuspend}
                    >
                      <UserX className="mr-2 h-4 w-4" /> Suspend
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>This user is not associated with the current tenant.</p>
                  <Button variant="outline" asChild>
                    <Link to="/admin/users">Back to directory</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </AdminLayout>
  );
};

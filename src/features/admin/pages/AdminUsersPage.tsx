import {
  AlertCircle,
  Award,
  ArrowUpRight,
  Search,
  ShieldCheck,
  UserCog,
  UserPlus,
  Users,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import type { ApiRoleSummary, ApiUser } from '@/api/users';
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
import { useAdminUsers } from '@/features/admin/hooks/useAdminUsers';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';
import { cn } from '@/lib/utils';

import { AdminLayout } from '../components/AdminLayout';

type DirectoryUser = {
  id: string;
  fullName: string;
  email: string;
  rewardCredits: number;
  tenantLabel: string;
  createdAt?: string;
  assignments?: number | null;
  primaryRole: {
    baseName: string;
    label: string;
    tone: string;
  };
  roles: Array<{
    id: string;
    name: string;
    displayName: string;
    baseName: string;
  }>;
};

type RoleOption = {
  label: string;
  value: string;
};

const breadcrumbs: BreadcrumbItem[] = [
  { label: 'Admin portal', href: '/admin' },
  { label: 'Users' },
];

const roleToneMap: Record<string, string> = {
  'super-admin': 'bg-amber-500/10 text-amber-600',
  admin: 'bg-primary/10 text-primary',
  'support-team': 'bg-orange-500/10 text-orange-600',
  teacher: 'bg-blue-500/10 text-blue-600',
  coach: 'bg-purple-500/10 text-purple-600',
  student: 'bg-emerald-500/10 text-emerald-600',
  parent: 'bg-slate-500/10 text-slate-600',
  volunteer: 'bg-pink-500/10 text-pink-600',
  support: 'bg-orange-500/10 text-orange-600',
};

function toTitleCase(value: string): string {
  const normalized = value.replace(/[-_]+/g, ' ').trim();
  if (!normalized) {
    return 'Member';
  }
  return normalized
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function extractBaseName(role: ApiRoleSummary | undefined): string {
  if (!role) {
    return 'member';
  }

  const metadata = role.metadata;
  if (metadata && typeof metadata === 'object') {
    const baseName = (metadata as { baseName?: unknown }).baseName;
    if (typeof baseName === 'string' && baseName.trim().length > 0) {
      return baseName.trim().toLowerCase();
    }
  }

  const name = role.name ?? '';
  if (!name) {
    return 'member';
  }

  const segments = name.split('-');
  return segments[segments.length - 1]?.toLowerCase() ?? 'member';
}

function resolveRoleTone(baseName: string): string {
  return roleToneMap[baseName] ?? 'bg-muted text-foreground';
}

function buildDirectoryUsers(
  users: ApiUser[] | undefined,
  tenantId: string | null,
  tenantLabel: string,
): DirectoryUser[] {
  if (!users?.length) {
    return [];
  }

  return users.map((user) => {
    const membership =
      user.tenantMemberships.find((entry) => entry.tenant === tenantId) ??
      user.tenantMemberships[0];

    const roles = membership?.roles ?? [];
    const primaryRole = roles[0];
    const baseName = extractBaseName(primaryRole);

    const fullNameCandidates = [
      user.profile?.displayName,
      [user.profile?.firstName, user.profile?.lastName].filter(Boolean).join(' ').trim(),
      user.name,
      user.email,
    ];

    const fullName =
      fullNameCandidates
        .find((value) => typeof value === 'string' && value.trim().length > 0)
        ?.trim() ?? 'Unknown user';

    const tenantMembershipLabel = membership?.tenant === tenantId ? tenantLabel : 'Multi-tenant';

    return {
      id: user._id,
      fullName,
      email: user.email ?? '--',
      rewardCredits: membership?.rewardCredits ?? 0,
      tenantLabel: tenantMembershipLabel,
      createdAt: user.createdAt,
      assignments: null,
      primaryRole: {
        baseName,
        label: primaryRole?.displayName ?? toTitleCase(baseName),
        tone: resolveRoleTone(baseName),
      },
      roles: roles.map((role) => ({
        id: role._id,
        name: role.name,
        displayName: role.displayName,
        baseName: extractBaseName(role),
      })),
    };
  });
}

function computeStats(users: DirectoryUser[]) {
  const accumulator = {
    total: users.length,
    admins: 0,
    educators: 0,
    families: 0,
    volunteers: 0,
  };

  for (const user of users) {
    const bases = user.roles.map((role) => role.baseName);
    if (bases.some((base) => base === 'admin' || base === 'super-admin')) {
      accumulator.admins += 1;
    }
    if (bases.some((base) => base === 'teacher' || base === 'coach')) {
      accumulator.educators += 1;
    }
    if (bases.some((base) => base === 'student' || base === 'parent')) {
      accumulator.families += 1;
    }
    if (bases.some((base) => base === 'volunteer')) {
      accumulator.volunteers += 1;
    }
  }

  return accumulator;
}

export const AdminUsersPage = (): JSX.Element => {
  const { data: currentUser, isLoading: isCurrentUserLoading } = useCurrentUser();
  const tenantId = currentUser?.tenant?.id ?? null;
  const tenantName = currentUser?.tenant?.name ?? 'Current tenant';

  const adminUsersQuery = useAdminUsers({ tenantId });
  const { data: apiUsers, isLoading, isFetching, isError, refetch } = adminUsersQuery;

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const directoryUsers = useMemo(() => {
    return buildDirectoryUsers(apiUsers, tenantId, tenantName);
  }, [apiUsers, tenantId, tenantName]);

  const stats = useMemo(() => computeStats(directoryUsers), [directoryUsers]);

  const roleOptions = useMemo<RoleOption[]>(() => {
    const entries = new Map<string, string>();
    for (const user of directoryUsers) {
      for (const role of user.roles) {
        if (!entries.has(role.baseName)) {
          entries.set(role.baseName, role.displayName);
        }
      }
    }
    const dynamic = Array.from(entries.entries()).sort((a, b) => a[1].localeCompare(b[1]));
    return [
      { label: 'All roles', value: 'all' },
      ...dynamic.map(([value, label]) => ({ value, label })),
    ];
  }, [directoryUsers]);

  useEffect(() => {
    if (roleFilter !== 'all' && !roleOptions.some((option) => option.value === roleFilter)) {
      setRoleFilter('all');
    }
  }, [roleFilter, roleOptions]);

  const filteredUsers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return directoryUsers.filter((user) => {
      const matchesRole =
        roleFilter === 'all' || user.roles.some((role) => role.baseName === roleFilter);

      if (!matchesRole) {
        return false;
      }

      if (!query) {
        return true;
      }

      return (
        user.fullName.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.tenantLabel.toLowerCase().includes(query)
      );
    });
  }, [directoryUsers, roleFilter, searchTerm]);

  const showSkeleton =
    isCurrentUserLoading || isLoading || (isFetching && (!apiUsers || apiUsers.length === 0));

  const showEmptyState = !showSkeleton && !isError && filteredUsers.length === 0;

  const skeletonRows = useMemo(() => Array.from({ length: 6 }, (_value, index) => index), []);

  return (
    <AdminLayout
      title="Users"
      description="Invite, manage, and audit user access across your tenant."
      breadcrumbs={breadcrumbs}
      documentTitle="Admin Users"
    >
      <div className="flex flex-col gap-8">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-foreground">Directory overview</h2>
            <p className="text-sm text-muted-foreground">
              Keep track of every teammate, learner, and supporter across your organization.
            </p>
          </div>
          <Button asChild>
            <Link to="/admin/users/create">
              <UserPlus className="mr-2 h-4 w-4" /> Create User
            </Link>
          </Button>
        </header>

        <section className="grid gap-4 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total users</CardTitle>
            </CardHeader>
            <CardContent>
              {showSkeleton ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <p className="text-3xl font-semibold tracking-tight">
                  {stats.total.toLocaleString()}
                </p>
              )}
              <p className="mt-1 text-xs text-muted-foreground">Across all roles and tenants.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Admin team</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {showSkeleton ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                <p className="text-3xl font-semibold tracking-tight">
                  {stats.admins.toLocaleString()}
                </p>
              )}
              <p className="text-xs text-muted-foreground">Super admins and tenant admins.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Educators & coaches</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {showSkeleton ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                <p className="text-3xl font-semibold tracking-tight">
                  {stats.educators.toLocaleString()}
                </p>
              )}
              <p className="text-xs text-muted-foreground">Teachers and instructional coaches.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Learners & families</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {showSkeleton ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                <p className="text-3xl font-semibold tracking-tight">
                  {stats.families.toLocaleString()}
                </p>
              )}
              <p className="text-xs text-muted-foreground">Active students and their guardians.</p>
            </CardContent>
          </Card>
        </section>

        <Card className="border-border/80">
          <CardHeader className="gap-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Users className="h-4 w-4" />
              Directory
            </div>
            <CardDescription>
              Search, filter, and review account context at a glance.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isError ? (
              <div className="flex flex-col gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  <span>We could not load the users directory. Please try again.</span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    refetch();
                  }}
                >
                  Retry
                </Button>
              </div>
            ) : null}

            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="relative w-full md:max-w-sm">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search by name, email, or tenant..."
                  className="pl-9"
                  disabled={showSkeleton || isError}
                />
              </div>
              <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
                <Select
                  value={roleFilter}
                  onValueChange={(value) => setRoleFilter(value)}
                  disabled={showSkeleton || isError}
                >
                  <SelectTrigger className="md:w-[200px]">
                    <SelectValue placeholder="Filter by role" />
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
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border text-sm">
                <thead>
                  <tr className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Email</th>
                    <th className="px-4 py-3 font-medium">Role</th>
                    <th className="px-4 py-3 font-medium">Assignments</th>
                    <th className="px-4 py-3 font-medium">Reward credits</th>
                    <th className="px-4 py-3 font-medium">Tenant</th>
                    <th className="px-4 py-3 font-medium">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {showSkeleton ? (
                    skeletonRows.map((row) => (
                      <tr key={`skeleton-${row}`} className="bg-background">
                        <td className="px-4 py-4">
                          <Skeleton className="h-5 w-40" />
                        </td>
                        <td className="px-4 py-4">
                          <Skeleton className="h-5 w-48" />
                        </td>
                        <td className="px-4 py-4">
                          <Skeleton className="h-5 w-24" />
                        </td>
                        <td className="px-4 py-4">
                          <Skeleton className="h-5 w-24" />
                        </td>
                        <td className="px-4 py-4">
                          <Skeleton className="h-5 w-16" />
                        </td>
                        <td className="px-4 py-4">
                          <Skeleton className="h-5 w-32" />
                        </td>
                        <td className="px-4 py-4">
                          <Skeleton className="h-5 w-24" />
                        </td>
                      </tr>
                    ))
                  ) : showEmptyState ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-10 text-center text-sm text-muted-foreground"
                      >
                        No users match the selected filters.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="bg-background">
                        <td className="px-4 py-3 font-medium text-foreground">
                          <Link
                            to={`/admin/users/${user.id}`}
                            className="group inline-flex items-center gap-2 text-primary transition-colors hover:text-primary/80"
                          >
                            <span className="text-foreground group-hover:text-primary">
                              {user.fullName}
                            </span>
                            <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize',
                              user.primaryRole.tone,
                            )}
                          >
                            {user.primaryRole.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {user.assignments != null ? `${user.assignments} assigned` : '--'}
                        </td>
                        <td className="px-4 py-3 text-foreground">{user.rewardCredits}</td>
                        <td className="px-4 py-3 text-muted-foreground">{user.tenantLabel}</td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '--'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Card className="border-border/80">
            <CardHeader>
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                Access reviews
              </div>
              <CardDescription>Audit high-impact permissions every quarter.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>- 4 admin accounts have not rotated credentials in the last 60 days.</p>
              <p>- MFA adoption is at 92% -- encourage remaining staff to enroll.</p>
            </CardContent>
          </Card>

          <Card className="border-border/80">
            <CardHeader>
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <UserCog className="h-4 w-4 text-blue-500" />
                Team enablement
              </div>
              <CardDescription>Highlight onboarding tasks for new collaborators.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>- Share the orientation kit with 3 recently added coaches.</p>
              <p>- Schedule a support desk walkthrough for volunteer leads.</p>
            </CardContent>
          </Card>

          <Card className="border-border/80">
            <CardHeader>
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Award className="h-4 w-4 text-amber-500" />
                Recognition
              </div>
              <CardDescription>
                Celebrate the people who keep learning journeys moving.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>- Miles Garcia and Sophie Patel lead student engagement this month.</p>
              <p>- Volunteer Harper Steele completed the most service hours in Q1.</p>
            </CardContent>
          </Card>
        </section>
      </div>
    </AdminLayout>
  );
};

import { AlertCircle, ArrowLeft, ListChecks, Shield } from 'lucide-react';
import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';

import type { BreadcrumbItem } from '@/components/navigation/PageBreadcrumbs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';

import { AdminEmptyState } from '../components/AdminEmptyState';
import { AdminLayout } from '../components/AdminLayout';
import { useAdminRole } from '../hooks/useAdminRole';

const formatDateTime = (value?: string): string => {
  if (!value) {
    return '—';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};

export const AdminRoleDetailPage = (): JSX.Element => {
  const { id: roleId } = useParams<{ id: string }>();
  const { data: currentUser, isLoading: isCurrentUserLoading } = useCurrentUser();
  const tenantId = currentUser?.tenant?.id ?? null;

  const roleQuery = useAdminRole({ tenantId, roleId });
  const { data: role, isLoading, isFetching, isError, refetch } = roleQuery;

  const breadcrumbLabel =
    role?.displayName ?? role?.name ?? (roleId ? `Role ${roleId}` : 'Role details');

  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Admin portal', href: '/admin' },
    { label: 'Roles', href: '/admin/roles' },
    { label: breadcrumbLabel },
  ];

  const metadataEntries = useMemo(() => {
    if (!role?.metadata || typeof role.metadata !== 'object') {
      return [] as Array<[string, unknown]>;
    }
    return Object.entries(role.metadata);
  }, [role?.metadata]);

  const showSkeleton =
    isCurrentUserLoading || isLoading || (isFetching && (!role || Object.keys(role).length === 0));

  const showEmptyState = !showSkeleton && !isError && !role;

  let content: JSX.Element;

  if (!roleId) {
    content = (
      <AdminEmptyState
        title="Role identifier missing"
        description="Select a role from the catalog to view its configuration."
      />
    );
  } else if (isError) {
    content = (
      <div className="flex flex-col gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          <span>We couldn&apos;t load details for this role. Please try again.</span>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => {
            void refetch();
          }}
        >
          Retry
        </Button>
      </div>
    );
  } else if (showSkeleton) {
    content = (
      <div className="grid gap-4">
        <Card className="border-border/70">
          <CardHeader className="space-y-3">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-72" />
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-40" />
          </CardContent>
        </Card>
        <Card className="border-border/70">
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 3 }, (_value, index) => (
              <Skeleton key={index} className="h-10 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  } else if (showEmptyState || !role) {
    content = (
      <AdminEmptyState
        title="Role not found"
        description="This role may have been deleted or is outside your tenant scope."
      />
    );
  } else {
    const resolvedRole = role;
    content = (
      <div className="flex flex-col gap-6">
        <Card className="border-border/70">
          <CardHeader className="space-y-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Shield className="h-5 w-5" />
              <CardTitle className="text-xl font-semibold text-foreground">
                {resolvedRole.displayName}
              </CardTitle>
            </div>
            <CardDescription className="text-sm text-muted-foreground">
              {resolvedRole.description?.trim() ?? 'No description provided for this role yet.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">API identifier</span>
              <p className="font-mono text-foreground">{resolvedRole.name}</p>
            </div>
            <div className="space-y-1 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Scope</span>
              <p>
                {resolvedRole.scope === 'global'
                  ? 'Global (available to all tenants)'
                  : 'Tenant (restricted to this tenant context)'}
              </p>
            </div>
            <div className="space-y-1 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">System role</span>
              <p>{resolvedRole.system ? 'Yes — protected from edits' : 'No — editable'}</p>
            </div>
            <div className="space-y-1 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Timestamps</span>
              <div className="space-y-1">
                <p>Updated {formatDateTime(resolvedRole.updatedAt)}</p>
                <p>Created {formatDateTime(resolvedRole.createdAt)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <ListChecks className="h-5 w-5" />
              <CardTitle className="text-lg font-semibold text-foreground">Permissions</CardTitle>
            </div>
            <CardDescription className="text-sm text-muted-foreground">
              Explicit capabilities granted when this role is assigned.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {resolvedRole.permissions.length > 0 ? (
              <ul className="space-y-3">
                {resolvedRole.permissions.map((permission) => (
                  <li
                    key={permission.name}
                    className="rounded-lg border border-border/70 bg-muted/20 p-3"
                  >
                    <p className="font-mono text-sm font-semibold text-foreground">
                      {permission.name}
                    </p>
                    {permission.description ? (
                      <p className="mt-1 text-sm text-muted-foreground">{permission.description}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                No permissions have been attached to this role yet.
              </p>
            )}
          </CardContent>
        </Card>

        {metadataEntries.length > 0 ? (
          <Card className="border-border/70">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground">Metadata</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Supplemental configuration captured for this role.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="overflow-x-auto rounded-md bg-muted/30 p-4 text-xs text-muted-foreground">
                {JSON.stringify(Object.fromEntries(metadataEntries), null, 2)}
              </pre>
            </CardContent>
          </Card>
        ) : null}
      </div>
    );
  }

  return (
    <AdminLayout
      title={role?.displayName ?? 'Role details'}
      description="Inspect role configuration, scope, and granted permissions."
      breadcrumbs={breadcrumbs}
      documentTitle={role?.displayName ? `Role • ${role.displayName}` : 'Admin Role Details'}
    >
      <div className="flex flex-col gap-8">
        <div>
          <Button asChild variant="ghost" size="sm" className="h-9 px-3">
            <Link to="/admin/roles" className="inline-flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" /> Back to roles
            </Link>
          </Button>
        </div>

        {content}
      </div>
    </AdminLayout>
  );
};

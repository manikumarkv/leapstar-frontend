import { AlertCircle, ArrowRight, Shield } from 'lucide-react';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';

import type { BreadcrumbItem } from '@/components/navigation/PageBreadcrumbs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAdminRoles } from '@/features/admin/hooks/useAdminRoles';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';

import { AdminEmptyState } from '../components/AdminEmptyState';
import { AdminLayout } from '../components/AdminLayout';

const breadcrumbs: BreadcrumbItem[] = [
  { label: 'Admin portal', href: '/admin' },
  { label: 'Roles' },
];

const scopeBadgeVariants: Record<'global' | 'tenant', string> = {
  global: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
  tenant: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
};

const skeletonItems = Array.from({ length: 4 }, (_value, index) => index);

export const AdminRolesPage = (): JSX.Element => {
  const { data: currentUser, isLoading: isCurrentUserLoading } = useCurrentUser();
  const tenantId = currentUser?.tenant?.id ?? null;
  const tenantName = currentUser?.tenant?.name ?? 'Current tenant';

  const { data: roles, isLoading, isFetching, isError, refetch } = useAdminRoles({ tenantId });

  const metrics = useMemo(() => {
    if (!roles) {
      return { total: 0, tenant: 0, global: 0 };
    }

    const tenantScoped = roles.filter((role) => role.scope === 'tenant').length;
    const total = roles.length;
    return {
      total,
      tenant: tenantScoped,
      global: total - tenantScoped,
    };
  }, [roles]);

  const showSkeleton =
    isCurrentUserLoading || isLoading || (isFetching && (!roles || roles.length === 0));

  const showEmptyState = !showSkeleton && !isError && (roles?.length ?? 0) === 0;

  return (
    <AdminLayout
      title="Roles"
      description="Review permission models, understand scope, and drill into specific role assignments."
      breadcrumbs={breadcrumbs}
      documentTitle="Admin Roles"
    >
      <div className="flex flex-col gap-8">
        <section className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total roles
              </CardTitle>
            </CardHeader>
            <CardContent>
              {showSkeleton ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <p className="text-3xl font-semibold tracking-tight">{metrics.total}</p>
              )}
              <CardDescription className="mt-1">
                Combined global and tenant-specific definitions.
              </CardDescription>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Tenant scope
              </CardTitle>
            </CardHeader>
            <CardContent>
              {showSkeleton ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <p className="text-3xl font-semibold tracking-tight">{metrics.tenant}</p>
              )}
              <CardDescription className="mt-1">
                Roles available only within {tenantName}.
              </CardDescription>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Global scope
              </CardTitle>
            </CardHeader>
            <CardContent>
              {showSkeleton ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <p className="text-3xl font-semibold tracking-tight">{metrics.global}</p>
              )}
              <CardDescription className="mt-1">
                Shared templates accessible across every tenant.
              </CardDescription>
            </CardContent>
          </Card>
        </section>

        {isError ? (
          <div className="flex flex-col gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span>We couldn&apos;t load the roles catalog. Please try again.</span>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                refetch();
              }}
            >
              Retry
            </Button>
          </div>
        ) : null}

        {showSkeleton ? (
          <div className="grid gap-4">
            {skeletonItems.map((item) => (
              <Card key={item} className="border-border/70">
                <CardHeader className="space-y-3">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-3/4" />
                </CardHeader>
                <CardContent className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-9 w-28" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : showEmptyState ? (
          <AdminEmptyState
            title="No roles configured yet"
            description="Create your first role to start managing permissions for team members."
          />
        ) : (
          <div className="grid gap-4">
            {roles?.map((role) => (
              <Card key={role._id} className="border-border/70 transition hover:border-border">
                <CardHeader className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Shield className="h-4 w-4" />
                      <CardTitle className="text-lg font-semibold text-foreground">
                        {role.displayName}
                      </CardTitle>
                    </div>
                    <CardDescription className="max-w-3xl text-sm text-muted-foreground">
                      {role.description?.trim() ?? 'No description provided for this role yet.'}
                    </CardDescription>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${scopeBadgeVariants[role.scope]}`}
                    >
                      {role.scope === 'global' ? 'Global scope' : 'Tenant scope'}
                    </span>
                    {role.system ? (
                      <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                        System role
                      </span>
                    ) : null}
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>
                      <span className="font-medium text-foreground">{role.permissions.length}</span>{' '}
                      permissions
                    </p>
                    <p>
                      {role.scope === 'tenant'
                        ? `Visible to members within ${tenantName}.`
                        : 'Available to all tenants.'}
                    </p>
                  </div>
                  <Button asChild size="sm" variant="ghost" className="self-start md:self-auto">
                    <Link
                      to={`/admin/roles/${role._id}`}
                      className="inline-flex items-center gap-1"
                    >
                      View role
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

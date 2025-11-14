import {
  AlertCircle,
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  CreditCard,
  Globe2,
  Receipt,
  Users,
} from 'lucide-react';
import { useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

import { SuperAdminLayout } from '../components/SuperAdminLayout';
import { useSuperAdminTenantOverview } from '../hooks/useSuperAdminTenantOverview';

const statusBadgeStyles: Record<'active' | 'inactive', string> = {
  active: 'border border-emerald-200 bg-emerald-50 text-emerald-700',
  inactive: 'border border-amber-200 bg-amber-50 text-amber-700',
};

const formatDate = (value?: string): string => {
  if (!value) {
    return '—';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
};

const domainPlaceholder = 'No domains configured yet.';

export const SuperAdminTenantDetailPage = (): JSX.Element => {
  const navigate = useNavigate();
  const { tenantId } = useParams<{ tenantId: string }>();

  const overviewQuery = useSuperAdminTenantOverview(tenantId);
  const { data, isLoading, isFetching, isError, refetch } = overviewQuery;

  const tenant = data?.tenant;
  const metrics = data?.metrics;

  const featureFlagEntries = useMemo(() => {
    const flags = tenant?.settings?.featureFlags;
    if (!flags) {
      return [] as Array<[string, boolean]>;
    }
    if (flags instanceof Map) {
      return Array.from(flags.entries());
    }
    return Object.entries(flags);
  }, [tenant?.settings?.featureFlags]);

  const quickLinks = useMemo(
    () =>
      tenantId
        ? [
            {
              label: 'Programs',
              description: 'Plan curriculum, schedules, and enrollment windows.',
              icon: BookOpen,
              href: `/super-admin/tenants/${tenantId}/programs`,
              accent: 'from-sky-500/10 via-transparent to-transparent',
            },
            {
              label: 'People directory',
              description: 'View students, families, and tenant staff roles.',
              icon: Users,
              href: `/super-admin/tenants/${tenantId}/users`,
              accent: 'from-purple-500/10 via-transparent to-transparent',
            },
            {
              label: 'Payment settings',
              description: 'Connect Stripe accounts, payouts, and billing.',
              icon: CreditCard,
              href: `/super-admin/tenants/${tenantId}/payments`,
              accent: 'from-emerald-500/10 via-transparent to-transparent',
            },
            {
              label: 'Domain setup',
              description: 'Manage custom domains, SSL, and routing.',
              icon: Globe2,
              href: `/super-admin/tenants/${tenantId}/domains`,
              accent: 'from-amber-500/10 via-transparent to-transparent',
            },
            {
              label: 'Transactions',
              description: 'Track credit flows, refunds, and adjustments.',
              icon: Receipt,
              href: `/super-admin/tenants/${tenantId}/transactions`,
              accent: 'from-rose-500/10 via-transparent to-transparent',
            },
          ]
        : [],
    [tenantId],
  );

  const showSkeleton = isLoading || (isFetching && !data);

  return (
    <SuperAdminLayout
      title={tenant?.name ?? 'Tenant overview'}
      description="Understand activity across tenants and access deep configuration."
      breadcrumbs={[
        { label: 'Super admin portal', href: '/super-admin' },
        { label: 'Tenants', href: '/super-admin/tenants' },
        tenant ? { label: tenant.name } : { label: tenantId ? 'Tenant overview' : 'Tenant' },
      ]}
      documentTitle={tenant ? `Super Admin • ${tenant.name}` : 'Super Admin • Tenant overview'}
    >
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => navigate('/super-admin/tenants')}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to tenants
          </Button>
          {tenant ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="rounded-full bg-muted/40 px-2 py-1 font-medium capitalize">
                {tenant.slug}
              </span>
              <span
                className={cn(
                  'rounded-full px-2 py-1 text-xs font-medium capitalize',
                  statusBadgeStyles[tenant.status],
                )}
              >
                {tenant.status}
              </span>
            </div>
          ) : null}
        </div>

        <section className="grid gap-4 lg:grid-cols-3">
          <Card className="border-border/70">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Active students</CardTitle>
            </CardHeader>
            <CardContent>
              {showSkeleton ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <p className="text-3xl font-semibold tracking-tight">
                  {metrics?.activeStudents.toLocaleString() ?? '—'}
                </p>
              )}
              <p className="mt-1 text-xs text-muted-foreground">
                Confirmed enrollments across programs.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/70">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Published programs</CardTitle>
            </CardHeader>
            <CardContent>
              {showSkeleton ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <p className="text-3xl font-semibold tracking-tight">
                  {metrics?.publishedPrograms.toLocaleString() ?? '—'}
                </p>
              )}
              <p className="mt-1 text-xs text-muted-foreground">
                Available learning experiences for students.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/70">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Active educators</CardTitle>
            </CardHeader>
            <CardContent>
              {showSkeleton ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <p className="text-3xl font-semibold tracking-tight">
                  {metrics?.activeTeachers.toLocaleString() ?? '—'}
                </p>
              )}
              <p className="mt-1 text-xs text-muted-foreground">
                Teachers with active access this term.
              </p>
            </CardContent>
          </Card>
        </section>

        <Card className="border-border/80">
          <CardHeader className="gap-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              Tenant profile
            </div>
            <CardDescription>
              Core directory details, platform settings, and lifecycle metadata.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isError ? (
              <div className="flex flex-col gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-destructive md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>We could not load the tenant overview. Please try again.</span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    void refetch();
                  }}
                >
                  Retry
                </Button>
              </div>
            ) : null}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Tenant name
                  </p>
                  {showSkeleton ? (
                    <Skeleton className="mt-2 h-5 w-48" />
                  ) : (
                    <p className="mt-1 text-sm text-foreground">{tenant?.name ?? '—'}</p>
                  )}
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Application name
                  </p>
                  {showSkeleton ? (
                    <Skeleton className="mt-2 h-5 w-64" />
                  ) : (
                    <p className="mt-1 text-sm text-foreground">
                      {tenant?.settings?.appName ?? 'Not configured'}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Support email
                  </p>
                  {showSkeleton ? (
                    <Skeleton className="mt-2 h-5 w-48" />
                  ) : (
                    <p className="mt-1 text-sm text-foreground">
                      {tenant?.settings?.supportEmail ?? '—'}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Domains</p>
                  {showSkeleton ? (
                    <Skeleton className="mt-2 h-5 w-56" />
                  ) : tenant?.domains?.length ? (
                    <div className="mt-1 flex flex-wrap gap-2">
                      {tenant.domains.map((domain) => (
                        <span
                          key={domain}
                          className="rounded-full border border-border/60 bg-muted/40 px-2 py-1 text-xs text-muted-foreground"
                        >
                          {domain}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-1 text-sm text-muted-foreground">{domainPlaceholder}</p>
                  )}
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Created</p>
                  {showSkeleton ? (
                    <Skeleton className="mt-2 h-5 w-28" />
                  ) : (
                    <p className="mt-1 text-sm text-foreground">{formatDate(tenant?.createdAt)}</p>
                  )}
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Last updated
                  </p>
                  {showSkeleton ? (
                    <Skeleton className="mt-2 h-5 w-28" />
                  ) : (
                    <p className="mt-1 text-sm text-foreground">{formatDate(tenant?.updatedAt)}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="grid gap-2">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Feature flags
                </p>
                {showSkeleton ? (
                  <Skeleton className="h-5 w-72" />
                ) : featureFlagEntries.length ? (
                  <div className="flex flex-wrap gap-2">
                    {featureFlagEntries.map(([flag, enabled]) => (
                      <span
                        key={flag}
                        className={cn(
                          'rounded-full border px-3 py-1 text-xs font-medium',
                          enabled
                            ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                            : 'border-border/60 bg-muted/40 text-muted-foreground',
                        )}
                      >
                        {flag}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No feature flags configured.</p>
                )}
              </div>

              <div className="grid gap-2">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Metadata</p>
                {showSkeleton ? (
                  <Skeleton className="h-20 w-full" />
                ) : tenant?.metadata && Object.keys(tenant.metadata ?? {}).length ? (
                  <pre className="rounded-lg bg-muted/40 p-4 text-xs text-muted-foreground">
                    {JSON.stringify(tenant.metadata, null, 2)}
                  </pre>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No metadata recorded for this tenant.
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80">
          <CardHeader className="gap-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              Guide rails
            </div>
            <CardDescription>
              Jump into team workflows for this tenant. Each space opens in a focused context for
              deeper management.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {quickLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/80 p-4 transition-transform hover:-translate-y-1 focus-visible:-translate-y-1"
                  >
                    <div
                      className={cn(
                        'pointer-events-none absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100',
                        link.accent,
                      )}
                    />
                    <div className="relative flex items-start gap-4">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-foreground">{link.label}</p>
                        <p className="text-xs text-muted-foreground">{link.description}</p>
                      </div>
                      <ArrowUpRight className="ml-auto h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:-translate-y-1 group-focus-visible:translate-x-1 group-focus-visible:-translate-y-1" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80">
          <CardHeader className="gap-2">
            <CardTitle className="text-sm font-semibold">Tenant API reference</CardTitle>
            <CardDescription>
              Useful identifiers to power automations or API requests.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <label
                  className="text-xs uppercase tracking-wide text-muted-foreground"
                  htmlFor="tenant-id-input"
                >
                  Tenant ID
                </label>
                <Input
                  id="tenant-id-input"
                  value={tenant?._id ?? tenantId ?? ''}
                  readOnly
                  className="font-mono text-xs"
                />
              </div>
              <div className="grid gap-2">
                <label
                  className="text-xs uppercase tracking-wide text-muted-foreground"
                  htmlFor="tenant-slug-input"
                >
                  Tenant slug
                </label>
                <Input
                  id="tenant-slug-input"
                  value={tenant?.slug ?? tenantId ?? ''}
                  readOnly
                  className="font-mono text-xs"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </SuperAdminLayout>
  );
};

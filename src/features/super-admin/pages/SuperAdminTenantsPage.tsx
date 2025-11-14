import { AlertCircle, Building2, PlusCircle, Search, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import type { TenantResponse } from '@/api/tenants';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { env } from '@/config/env';
import { cn } from '@/lib/utils';
import { isSubdomainOf, normalizeSubdomainLabel } from '@/shared';

import { SuperAdminLayout } from '../components/SuperAdminLayout';
import { useSuperAdminTenants } from '../hooks/useSuperAdminTenants';

const platformDomain = (env.VITE_PLATFORM_DOMAIN ?? 'manikumarkv.com').toLowerCase();

const getManagedTenantDomain = (tenant: TenantResponse): string | null => {
  const explicitManagedDomain = (tenant.domains ?? []).find((domain) =>
    isSubdomainOf(domain, platformDomain),
  );

  if (explicitManagedDomain) {
    return explicitManagedDomain;
  }

  const fallbackLabel = normalizeSubdomainLabel(tenant.slug);
  if (!fallbackLabel) {
    return null;
  }

  return `${fallbackLabel}.${platformDomain}`;
};

const getBaseDomains = (tenant: TenantResponse): string[] => {
  const result = new Set<string>();
  (tenant.domains ?? []).forEach((domain) => {
    if (domain) {
      result.add(domain);
    }
  });

  const managed = getManagedTenantDomain(tenant);
  if (managed) {
    result.add(managed);
  }

  return Array.from(result);
};

type RecommendedFilter = {
  id: 'active' | 'inactive' | 'needs-domain';
  label: string;
  description: string;
  predicate: (tenant: TenantResponse) => boolean;
};

const getVerifiedTenantDomains = (tenant: TenantResponse): string[] => {
  const baseDomains = getBaseDomains(tenant);
  const verifiedCustomDomains = (tenant.customDomains ?? [])
    .filter((domain) => domain.status === 'verified')
    .map((domain) => domain.hostname);

  return Array.from(new Set([...baseDomains, ...verifiedCustomDomains]));
};

const getAllTenantDomains = (tenant: TenantResponse): string[] => {
  const baseDomains = getBaseDomains(tenant);
  const customDomainHosts = (tenant.customDomains ?? []).map((domain) => domain.hostname);

  return Array.from(new Set([...baseDomains, ...customDomainHosts]));
};

const tenantHasVerifiedDomain = (tenant: TenantResponse): boolean => {
  return (tenant.customDomains ?? []).some((domain) => domain.status === 'verified');
};

const recommendedFilters: RecommendedFilter[] = [
  {
    id: 'active',
    label: 'Active tenants',
    description: 'Currently live for learners, staff, and administrators.',
    predicate: (tenant) => tenant.status === 'active',
  },
  {
    id: 'inactive',
    label: 'Suspended tenants',
    description: 'Paused tenants that may need outreach or reactivation support.',
    predicate: (tenant) => tenant.status === 'inactive',
  },
  {
    id: 'needs-domain',
    label: 'Needs domain setup',
    description: 'Tenants without custom domains configured yet.',
    predicate: (tenant) => !tenantHasVerifiedDomain(tenant),
  },
];

const statusBadgeVariants: Record<TenantResponse['status'], string> = {
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

const computeTenantStats = (tenants: TenantResponse[]) => {
  const summary = {
    total: tenants.length,
    active: 0,
    inactive: 0,
    needsDomain: 0,
  };

  for (const tenant of tenants) {
    if (tenant.status === 'active') {
      summary.active += 1;
    }
    if (tenant.status === 'inactive') {
      summary.inactive += 1;
    }
    if (!tenantHasVerifiedDomain(tenant)) {
      summary.needsDomain += 1;
    }
  }

  return summary;
};

export const SuperAdminTenantsPage = (): JSX.Element => {
  const { data: tenants, isLoading, isFetching, isError, refetch } = useSuperAdminTenants();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilterId, setActiveFilterId] = useState<RecommendedFilter['id'] | null>(null);

  const activeFilter = useMemo(() => {
    return recommendedFilters.find((filter) => filter.id === activeFilterId) ?? null;
  }, [activeFilterId]);

  const filteredTenants = useMemo(() => {
    const list = tenants ?? [];
    const query = searchTerm.trim().toLowerCase();

    return list.filter((tenant) => {
      if (activeFilter && !activeFilter.predicate(tenant)) {
        return false;
      }

      if (!query) {
        return true;
      }

      const domainMatches = getAllTenantDomains(tenant).some((domain) =>
        domain.toLowerCase().includes(query),
      );

      const appName = tenant.settings?.appName ? tenant.settings.appName.toLowerCase() : '';

      return (
        tenant.name.toLowerCase().includes(query) ||
        tenant.slug.toLowerCase().includes(query) ||
        domainMatches ||
        appName.includes(query)
      );
    });
  }, [activeFilter, searchTerm, tenants]);

  const stats = useMemo(() => computeTenantStats(tenants ?? []), [tenants]);
  const skeletonItems = useMemo(() => Array.from({ length: 4 }, (_, index) => index), []);

  const showSkeleton = isLoading || (isFetching && (!tenants || tenants.length === 0));
  const showEmpty = !showSkeleton && !isError && filteredTenants.length === 0;
  const hasFiltersApplied = Boolean(activeFilterId || searchTerm.trim().length);

  const handleClearFilters = () => {
    setActiveFilterId(null);
    setSearchTerm('');
  };

  return (
    <SuperAdminLayout
      title="Manage tenants"
      description="Search every tenant across the platform, apply quick filters, and spot accounts that need attention."
      breadcrumbs={[{ label: 'Super admin portal', href: '/super-admin' }, { label: 'Tenants' }]}
      documentTitle="Super Admin • Tenants"
    >
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Stay on top of every district, organization, and their launch readiness.
          </p>
          <Button asChild size="sm" className="inline-flex items-center gap-2">
            <Link to="/super-admin/tenants/new">
              <PlusCircle className="h-4 w-4" />
              Create tenant
            </Link>
          </Button>
        </div>

        <section className="grid gap-4 md:grid-cols-3">
          <Card className="border-border/70">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total tenants</CardTitle>
            </CardHeader>
            <CardContent>
              {showSkeleton ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <p className="text-3xl font-semibold tracking-tight">{stats.total}</p>
              )}
              <p className="mt-1 text-xs text-muted-foreground">Across the entire platform.</p>
            </CardContent>
          </Card>

          <Card className="border-border/70">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
            </CardHeader>
            <CardContent>
              {showSkeleton ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <p className="text-3xl font-semibold tracking-tight">{stats.active}</p>
              )}
              <p className="mt-1 text-xs text-muted-foreground">Live and accessible to members.</p>
            </CardContent>
          </Card>

          <Card className="border-border/70">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Needs setup</CardTitle>
            </CardHeader>
            <CardContent>
              {showSkeleton ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <p className="text-3xl font-semibold tracking-tight">{stats.needsDomain}</p>
              )}
              <p className="mt-1 text-xs text-muted-foreground">Missing domains or launch steps.</p>
            </CardContent>
          </Card>
        </section>

        <Card className="border-border/80">
          <CardHeader className="gap-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Building2 className="h-4 w-4" />
              Tenant directory
            </div>
            <CardDescription>
              Search, filter, and monitor every tenant from a single place.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isError ? (
              <div className="flex flex-col gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-destructive md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>We could not load the tenant directory. Please try again.</span>
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

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative w-full lg:max-w-sm">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search by name, slug, or domain..."
                  className="pl-9"
                  disabled={showSkeleton || isError}
                />
              </div>

              {hasFiltersApplied ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  disabled={showSkeleton || isError}
                >
                  Clear filters
                </Button>
              ) : null}
            </div>

            <div className="space-y-3 rounded-xl border border-border/60 bg-muted/10 p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <Sparkles className="h-3.5 w-3.5" />
                  Recommended filters
                </div>
                {activeFilter ? (
                  <p className="text-xs text-muted-foreground sm:text-right">
                    {activeFilter.description}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground sm:text-right">
                    Select a filter to focus the list.
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {recommendedFilters.map((filter) => {
                  const isSelected = activeFilterId === filter.id;

                  return (
                    <Button
                      key={filter.id}
                      type="button"
                      variant={isSelected ? 'secondary' : 'ghost'}
                      size="sm"
                      className={cn(
                        'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                        isSelected ? 'border-secondary' : 'border-border/50',
                      )}
                      onClick={() => {
                        setActiveFilterId((current) => (current === filter.id ? null : filter.id));
                      }}
                      disabled={showSkeleton || isError}
                    >
                      {filter.label}
                    </Button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              {showSkeleton
                ? skeletonItems.map((item) => (
                    <div
                      key={item}
                      className="rounded-xl border border-border/60 bg-background/60 p-4"
                    >
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="mt-3 h-4 w-64" />
                      <Skeleton className="mt-4 h-4 w-32" />
                    </div>
                  ))
                : null}

              {!showSkeleton && !showEmpty
                ? filteredTenants.map((tenant) => {
                    const verifiedDomains = getVerifiedTenantDomains(tenant);
                    const domainPreview = verifiedDomains.slice(0, 3);
                    const hasMoreDomains = verifiedDomains.length > domainPreview.length;
                    const pendingCustomDomains = (tenant.customDomains ?? []).filter(
                      (domain) => domain.status !== 'verified',
                    );

                    return (
                      <div
                        key={tenant._id}
                        className="group relative flex flex-col gap-4 rounded-xl border border-border/70 bg-background/80 p-4 transition-shadow hover:shadow-md focus-within:shadow-lg md:flex-row md:items-center md:justify-between"
                        tabIndex={-1}
                      >
                        <Link
                          to={`/super-admin/tenants/${tenant._id}`}
                          className="absolute inset-0 rounded-xl focus:outline-none"
                          aria-label={`View details for ${tenant.name}`}
                        />
                        <div className="space-y-2">
                          <div>
                            <h3 className="text-lg font-semibold text-foreground">{tenant.name}</h3>
                            <p className="text-sm text-muted-foreground">{tenant.slug}</p>
                          </div>

                          {domainPreview.length > 0 ? (
                            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                              {domainPreview.map((domain) => (
                                <span
                                  key={domain}
                                  className="rounded-full border border-border/60 bg-muted/40 px-2 py-1"
                                >
                                  {domain}
                                </span>
                              ))}
                              {hasMoreDomains ? (
                                <span className="rounded-full border border-border/60 bg-muted/40 px-2 py-1">
                                  +{verifiedDomains.length - domainPreview.length} more
                                </span>
                              ) : null}
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground">
                              No verified domains yet.
                            </p>
                          )}

                          {pendingCustomDomains.length > 0 ? (
                            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                              {pendingCustomDomains.map((domain) => (
                                <span
                                  key={domain._id}
                                  className={cn(
                                    'rounded-full border px-2 py-1',
                                    domain.status === 'failed'
                                      ? 'border-destructive/40 bg-destructive/10 text-destructive'
                                      : 'border-amber-200 bg-amber-50 text-amber-700',
                                  )}
                                >
                                  {domain.hostname}{' '}
                                  <span className="capitalize">{domain.status}</span>
                                </span>
                              ))}
                            </div>
                          ) : null}

                          {tenant.settings?.appName ? (
                            <p className="text-xs text-muted-foreground">
                              App name:{' '}
                              <span className="text-foreground">{tenant.settings.appName}</span>
                            </p>
                          ) : null}
                        </div>

                        <div className="flex flex-col items-start gap-3 md:items-end">
                          <span
                            className={cn(
                              'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium capitalize',
                              statusBadgeVariants[tenant.status],
                            )}
                          >
                            {tenant.status}
                          </span>
                          <div className="text-xs text-muted-foreground">
                            <p>Created {formatDate(tenant.createdAt)}</p>
                            <p>Updated {formatDate(tenant.updatedAt)}</p>
                          </div>
                          <div className="inline-flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                            <span>View details</span>
                            <span aria-hidden="true">→</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                : null}

              {showEmpty ? (
                <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border/60 bg-muted/10 py-12 text-center">
                  <Building2 className="h-10 w-10 text-muted-foreground" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">
                      No tenants match your filters.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Try adjusting your search or clear the quick filters.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleClearFilters}
                    disabled={showSkeleton || isError}
                  >
                    Reset view
                  </Button>
                </div>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </div>
    </SuperAdminLayout>
  );
};

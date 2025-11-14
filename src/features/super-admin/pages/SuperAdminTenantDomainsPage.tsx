import { useAuth0 } from '@auth0/auth0-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Copy,
  Globe2,
  Loader2,
  RefreshCcw,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { ApiError } from '@/api/client';
import {
  createTenantCustomDomain,
  deleteTenantCustomDomain,
  setTenantPrimaryCustomDomain,
  verifyTenantCustomDomain,
  updateTenantById,
  type CreateTenantCustomDomainPayload,
  type TenantCustomDomainResponse,
  type TenantCustomDomainStatus,
} from '@/api/tenants';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { env } from '@/config/env';
import { cn } from '@/lib/utils';
import { isSubdomainOf, normalizeSubdomainLabel } from '@/shared';

import { SuperAdminLayout } from '../components/SuperAdminLayout';
import { superAdminTenantQueryKey, useSuperAdminTenant } from '../hooks/useSuperAdminTenant';
import { SUPER_ADMIN_TENANT_OVERVIEW_QUERY_KEY } from '../hooks/useSuperAdminTenantOverview';
import { SUPER_ADMIN_TENANTS_QUERY_KEY } from '../hooks/useSuperAdminTenants';

type DomainStatusMeta = {
  label: string;
  className: string;
};

const domainStatusMeta: Record<TenantCustomDomainStatus, DomainStatusMeta> = {
  pending: {
    label: 'Pending setup',
    className: 'border-amber-200 bg-amber-50 text-amber-700',
  },
  verifying: {
    label: 'Verifying…',
    className: 'border-sky-200 bg-sky-50 text-sky-700',
  },
  verified: {
    label: 'Verified',
    className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  },
  failed: {
    label: 'Verification failed',
    className: 'border-destructive/40 bg-destructive/10 text-destructive',
  },
};

const formatDateTime = (value?: string | null): string => {
  if (!value) {
    return '—';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return '—';
  }

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(parsed);
};

const createDnsInstruction = (domain: TenantCustomDomainResponse): string => {
  return `Add a TXT record for ${domain.verification.recordName} with value ${domain.verification.recordValue}.`;
};

export const SuperAdminTenantDomainsPage = (): JSX.Element => {
  const { tenantId } = useParams<{ tenantId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getAccessTokenSilently } = useAuth0();
  const queryClient = useQueryClient();

  const tenantQuery = useSuperAdminTenant(tenantId);
  const tenant = tenantQuery.data ?? null;

  const platformDomain = (env.VITE_PLATFORM_DOMAIN ?? 'manikumarkv.com').toLowerCase();
  const managedDomainSuffix = `.${platformDomain}`;

  const managedDomain = useMemo(() => {
    if (!tenant) {
      return null;
    }

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
  }, [platformDomain, tenant]);

  const managedDomainPrefix = useMemo(() => {
    if (!managedDomain) {
      return '';
    }
    if (!managedDomain.endsWith(managedDomainSuffix)) {
      return managedDomain;
    }
    return managedDomain.slice(0, -managedDomainSuffix.length);
  }, [managedDomain, managedDomainSuffix]);

  const [hostnameInput, setHostnameInput] = useState('');
  const [makePrimary, setMakePrimary] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [subdomainInput, setSubdomainInput] = useState('');
  const [subdomainError, setSubdomainError] = useState<string | null>(null);

  useEffect(() => {
    if (!managedDomainPrefix) {
      setSubdomainInput('');
      setSubdomainError(null);
      return;
    }

    setSubdomainInput(managedDomainPrefix);
    setSubdomainError(null);
  }, [managedDomainPrefix]);

  const invalidateTenantQueries = async () => {
    if (!tenantId) {
      return;
    }
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: superAdminTenantQueryKey(tenantId) }),
      queryClient.invalidateQueries({ queryKey: SUPER_ADMIN_TENANTS_QUERY_KEY }),
      queryClient.invalidateQueries({
        queryKey: [...SUPER_ADMIN_TENANT_OVERVIEW_QUERY_KEY, tenantId],
      }),
    ]);
  };

  const handleMutationError = (error: unknown, fallback: string) => {
    const message =
      error instanceof ApiError ? error.message : error instanceof Error ? error.message : fallback;

    toast({
      title: 'Something went wrong',
      description: message,
      variant: 'destructive',
    });
  };

  const updateManagedDomainMutation = useMutation({
    mutationFn: async (normalizedLabel: string) => {
      if (!tenantId) {
        throw new Error('Tenant id is required');
      }
      if (!tenant) {
        throw new Error('Tenant is still loading');
      }
      const token = await getAccessTokenSilently();
      const nextDomain = `${normalizedLabel}.${platformDomain}`;
      const existingDomains = tenant.domains ?? [];
      const preservedDomains = existingDomains.filter(
        (domain) => !isSubdomainOf(domain, platformDomain),
      );
      const payloadDomains = [nextDomain, ...preservedDomains];
      return updateTenantById(token, tenantId, { domains: payloadDomains });
    },
    onSuccess: async (updatedTenant) => {
      const updatedManagedDomain =
        updatedTenant.domains?.find((domain) => isSubdomainOf(domain, platformDomain)) ?? null;
      if (updatedManagedDomain && updatedManagedDomain.endsWith(managedDomainSuffix)) {
        const prefix = updatedManagedDomain.slice(0, -managedDomainSuffix.length);
        setSubdomainInput(prefix);
      }
      setSubdomainError(null);
      toast({
        title: 'Subdomain saved',
        description: updatedManagedDomain
          ? `${updatedManagedDomain} is now the default tenant domain.`
          : 'Managed domain updated.',
      });
      await invalidateTenantQueries();
    },
    onError: (error) => {
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : 'Could not update the subdomain. Please try again.';
      setSubdomainError(message);
      handleMutationError(error, 'Could not update the subdomain. Please try again.');
    },
  });

  const handleManagedDomainSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!tenantId || !tenant) {
      setSubdomainError('Tenant details are still loading. Please try again.');
      return;
    }
    if (updateManagedDomainMutation.isPending) {
      return;
    }

    const normalizedLabel = normalizeSubdomainLabel(subdomainInput);
    if (!normalizedLabel) {
      setSubdomainError('Subdomain must include at least one letter or number.');
      return;
    }
    if (normalizedLabel.length > 63) {
      setSubdomainError('Subdomain must be 63 characters or fewer.');
      return;
    }

    if (normalizedLabel !== subdomainInput) {
      setSubdomainInput(normalizedLabel);
    }

    if (managedDomainPrefix === normalizedLabel) {
      toast({
        title: 'No changes detected',
        description: 'The managed subdomain already uses this prefix.',
      });
      return;
    }

    setSubdomainError(null);
    updateManagedDomainMutation.mutate(normalizedLabel);
  };

  const handleCopyManagedDomain = async () => {
    if (!managedDomain) {
      return;
    }

    if (typeof window === 'undefined' || !window.navigator?.clipboard?.writeText) {
      toast({
        title: 'Copy unsupported',
        description: `Copy the domain manually: ${managedDomain}`,
      });
      return;
    }

    try {
      await window.navigator.clipboard.writeText(managedDomain);
      toast({
        title: 'Copied to clipboard',
        description: managedDomain,
      });
    } catch (_error) {
      toast({
        title: 'Copy failed',
        description: `Copy the domain manually: ${managedDomain}`,
        variant: 'destructive',
      });
    }
  };

  const updatingManagedDomain = updateManagedDomainMutation.isPending;

  const createDomainMutation = useMutation({
    mutationFn: async (payload: CreateTenantCustomDomainPayload) => {
      if (!tenantId) {
        throw new Error('Tenant id is required');
      }
      const token = await getAccessTokenSilently();
      return createTenantCustomDomain(token, tenantId, payload);
    },
    onSuccess: async (domain) => {
      setHostnameInput('');
      setMakePrimary(false);
      setFormError(null);
      toast({
        title: 'Verification record generated',
        description: createDnsInstruction(domain),
      });
      await invalidateTenantQueries();
    },
    onError: (error) => {
      setFormError(
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : 'Could not create the custom domain. Please try again.',
      );
    },
  });

  const verifyDomainMutation = useMutation({
    mutationFn: async (domainId: string) => {
      if (!tenantId) {
        throw new Error('Tenant id is required');
      }
      const token = await getAccessTokenSilently();
      return verifyTenantCustomDomain(token, tenantId, domainId);
    },
    onSuccess: async (domain) => {
      toast({
        title: domain.status === 'verified' ? 'Domain verified' : 'Verification failed',
        description:
          domain.status === 'verified'
            ? `${domain.hostname} now routes to Leapstar.`
            : (domain.verification.failureReason ??
              'We could not find the DNS TXT record. Please double-check and try again.'),
        variant: domain.status === 'verified' ? 'default' : 'destructive',
      });
      await invalidateTenantQueries();
    },
    onError: (error) => {
      handleMutationError(error, 'Could not verify the domain. Please try again.');
    },
  });

  const setPrimaryMutation = useMutation({
    mutationFn: async (domainId: string) => {
      if (!tenantId) {
        throw new Error('Tenant id is required');
      }
      const token = await getAccessTokenSilently();
      return setTenantPrimaryCustomDomain(token, tenantId, domainId);
    },
    onSuccess: async (domain) => {
      toast({
        title: 'Primary domain updated',
        description: `${domain.hostname} will be used for tenant routing.`,
      });
      await invalidateTenantQueries();
    },
    onError: (error) => {
      handleMutationError(error, 'Could not update the primary domain. Please try again.');
    },
  });

  const deleteDomainMutation = useMutation({
    mutationFn: async (domainId: string) => {
      if (!tenantId) {
        throw new Error('Tenant id is required');
      }
      const token = await getAccessTokenSilently();
      await deleteTenantCustomDomain(token, tenantId, domainId);
      return domainId;
    },
    onSuccess: async () => {
      toast({
        title: 'Custom domain removed',
        description: 'The domain and related routing were deleted.',
      });
      await invalidateTenantQueries();
    },
    onError: (error) => {
      handleMutationError(error, 'Could not remove the domain. Please try again.');
    },
  });

  const isLoadingTenant = tenantQuery.isLoading || tenantQuery.isFetching;
  const loadError = tenantQuery.isError ? tenantQuery.error : null;

  const sortedDomains = useMemo(() => {
    return [...(tenant?.customDomains ?? [])].sort((a, b) => {
      const aTime = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const bTime = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return bTime - aTime;
    });
  }, [tenant?.customDomains]);

  const handleCreateDomain = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!hostnameInput.trim()) {
      setFormError('Domain name is required.');
      return;
    }

    createDomainMutation.mutate({
      hostname: hostnameInput.trim(),
      isPrimary: makePrimary,
    });
  };

  const creatingDomain = createDomainMutation.isPending;
  const verifyingDomainId = verifyDomainMutation.variables;
  const settingPrimaryId = setPrimaryMutation.variables;
  const deletingDomainId = deleteDomainMutation.variables;

  return (
    <SuperAdminLayout
      title={tenant ? `${tenant.name} • Domains` : 'Tenant domain setup'}
      description="Configure tenant routing, issue verification records, and manage primary domains."
      breadcrumbs={[
        { label: 'Super admin portal', href: '/super-admin' },
        { label: 'Tenants', href: '/super-admin/tenants' },
        tenant
          ? { label: tenant.name, href: `/super-admin/tenants/${tenant._id}` }
          : { label: 'Tenant overview', href: '/super-admin/tenants' },
        { label: 'Domain setup' },
      ]}
      documentTitle={tenant ? `Super Admin • ${tenant.name} domains` : 'Super Admin • Domains'}
    >
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
            onClick={() =>
              navigate(tenant ? `/super-admin/tenants/${tenant._id}` : '/super-admin/tenants')
            }
          >
            <ArrowLeft className="h-4 w-4" />
            Back to tenant
          </Button>
          {tenant ? (
            <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
              <Globe2 className="h-4 w-4" />
              <span>{tenant.slug}</span>
            </span>
          ) : null}
        </div>

        {loadError ? (
          <div className="flex flex-col gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-destructive">
            <div className="flex items-center gap-2 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>
                {loadError instanceof Error
                  ? loadError.message
                  : 'We could not load the tenant details.'}
              </span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                void tenantQuery.refetch();
              }}
            >
              Retry
            </Button>
          </div>
        ) : null}

        <Card className="border-border/80">
          <CardHeader className="space-y-1">
            <CardTitle className="text-base font-semibold">Leapstar-hosted subdomain</CardTitle>
            <CardDescription>
              Manage the default tenant domain on {platformDomain}. This subdomain works immediately
              while custom domains propagate.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <form className="space-y-4" onSubmit={handleManagedDomainSubmit}>
              {subdomainError ? (
                <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {subdomainError}
                </div>
              ) : null}

              <div className="space-y-2">
                <Label htmlFor="tenant-managed-subdomain">Subdomain prefix</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="tenant-managed-subdomain"
                    placeholder="district-name"
                    value={subdomainInput}
                    onChange={(event) => {
                      const value = event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-');
                      setSubdomainInput(value);
                      if (subdomainError) {
                        setSubdomainError(null);
                      }
                    }}
                    disabled={updatingManagedDomain || isLoadingTenant}
                  />
                  <span className="text-sm text-muted-foreground">.{platformDomain}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Use this domain for onboarding before a custom domain is verified.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="submit"
                  disabled={updatingManagedDomain || isLoadingTenant || !tenantId || !tenant}
                >
                  {updatingManagedDomain ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving…
                    </>
                  ) : (
                    'Save subdomain'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="inline-flex items-center gap-2"
                  onClick={() => {
                    void handleCopyManagedDomain();
                  }}
                  disabled={!managedDomain || isLoadingTenant}
                >
                  <Copy className="h-4 w-4" />
                  Copy domain
                </Button>
              </div>
            </form>

            {managedDomain ? (
              <div className="rounded-md border border-border/70 bg-muted/40 px-3 py-2 text-sm">
                <span className="text-muted-foreground">Default URL:</span>{' '}
                <a
                  href={`https://${managedDomain}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-foreground underline-offset-4 hover:underline"
                >
                  https://{managedDomain}
                </a>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <section className="grid gap-6 lg:grid-cols-[2fr,3fr]">
          <Card className="border-border/80">
            <CardHeader className="space-y-1">
              <CardTitle className="text-base font-semibold">Add a custom domain</CardTitle>
              <CardDescription>
                Generate DNS records and optionally mark the domain as primary. Verification happens
                over DNS TXT lookup.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-5" onSubmit={handleCreateDomain}>
                {formError ? (
                  <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {formError}
                  </div>
                ) : null}

                <div className="space-y-2">
                  <Label htmlFor="tenant-custom-domain">Domain hostname</Label>
                  <Input
                    id="tenant-custom-domain"
                    placeholder="learn.example.org"
                    value={hostnameInput}
                    onChange={(event) => {
                      setHostnameInput(event.target.value);
                      if (formError) {
                        setFormError(null);
                      }
                    }}
                    disabled={creatingDomain || isLoadingTenant}
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter the full hostname without protocol. Wildcard records are not supported.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    id="tenant-custom-domain-primary"
                    type="checkbox"
                    className="h-4 w-4 rounded border border-border/60 accent-primary"
                    checked={makePrimary}
                    onChange={(event) => {
                      setMakePrimary(event.target.checked);
                      if (formError) {
                        setFormError(null);
                      }
                    }}
                    disabled={creatingDomain || isLoadingTenant}
                  />
                  <Label htmlFor="tenant-custom-domain-primary" className="text-sm font-normal">
                    Make this the primary domain after verification
                  </Label>
                </div>

                <div className="flex items-center justify-end">
                  <Button type="submit" disabled={creatingDomain || isLoadingTenant || !tenantId}>
                    {creatingDomain ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creating…
                      </>
                    ) : (
                      'Generate verification record'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="border-border/80">
            <CardHeader className="space-y-1">
              <CardTitle className="text-base font-semibold">Verification checklist</CardTitle>
              <CardDescription>
                Add the TXT record to the tenant&apos;s DNS host, wait for propagation, then verify
                from this page.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-4 w-4 text-emerald-500" />
                <p>
                  Add a TXT record using the generated name and value. Most providers apply changes
                  in under 15 minutes, but some can take up to 24 hours.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <RefreshCcw className="mt-0.5 h-4 w-4 text-sky-500" />
                <p>
                  Press <span className="font-medium text-foreground">Verify DNS</span> after the
                  record propagates. We will look up the TXT value in real time.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                <p>
                  Once verified, mark the domain as primary so all tenant routes use the new
                  hostname.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4">
          <h2 className="text-base font-semibold text-foreground">Configured domains</h2>

          {isLoadingTenant ? (
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, index) => (
                <div key={index} className="rounded-xl border border-border/60 bg-muted/10 p-4">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="mt-3 h-4 w-72" />
                  <Skeleton className="mt-4 h-9 w-full" />
                </div>
              ))}
            </div>
          ) : null}

          {!isLoadingTenant && sortedDomains.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border/60 bg-muted/10 py-12 text-center text-sm text-muted-foreground">
              <Globe2 className="h-8 w-8" />
              <p>No custom domains have been added yet.</p>
              <p>Generate a verification record to get started.</p>
            </div>
          ) : null}

          {!isLoadingTenant && sortedDomains.length > 0 ? (
            <div className="space-y-4">
              {sortedDomains.map((domain) => {
                const statusMeta = domainStatusMeta[domain.status];
                const verifyLoading =
                  verifyDomainMutation.isPending && verifyingDomainId === domain._id;
                const primaryLoading =
                  setPrimaryMutation.isPending && settingPrimaryId === domain._id;
                const deleteLoading =
                  deleteDomainMutation.isPending && deletingDomainId === domain._id;

                return (
                  <div
                    key={domain._id}
                    className="space-y-4 rounded-xl border border-border/70 bg-background/80 p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{domain.hostname}</p>
                        <p className="text-xs text-muted-foreground">
                          Created {formatDateTime(domain.createdAt)}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={cn(
                            'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium',
                            statusMeta.className,
                          )}
                        >
                          {statusMeta.label}
                        </span>
                        {domain.isPrimary ? (
                          <span className="inline-flex items-center rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                            Primary domain
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-2">
                      <div className="space-y-1">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          TXT record name
                        </p>
                        <p className="rounded-md border border-dashed border-border/60 bg-muted/10 px-3 py-2 font-mono text-xs text-foreground">
                          {domain.verification.recordName}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          TXT record value
                        </p>
                        <p className="rounded-md border border-dashed border-border/60 bg-muted/10 px-3 py-2 font-mono text-xs text-foreground">
                          {domain.verification.recordValue}
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-2 text-xs text-muted-foreground lg:grid-cols-2">
                      <p>
                        Last checked:{' '}
                        <span className="text-foreground">
                          {formatDateTime(domain.verification.lastCheckedAt)}
                        </span>
                      </p>
                      <p>
                        Verified:{' '}
                        <span className="text-foreground">
                          {formatDateTime(domain.verification.verifiedAt)}
                        </span>
                      </p>
                      {domain.verification.failureReason ? (
                        <p className="lg:col-span-2 text-destructive">
                          {domain.verification.failureReason}
                        </p>
                      ) : null}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {domain.status !== 'verified' ? (
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => verifyDomainMutation.mutate(domain._id)}
                          disabled={verifyDomainMutation.isPending}
                        >
                          {verifyLoading ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Verifying…
                            </>
                          ) : (
                            'Verify DNS'
                          )}
                        </Button>
                      ) : null}

                      {domain.status === 'verified' && !domain.isPrimary ? (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setPrimaryMutation.mutate(domain._id)}
                          disabled={setPrimaryMutation.isPending}
                        >
                          {primaryLoading ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Setting primary…
                            </>
                          ) : (
                            'Make primary'
                          )}
                        </Button>
                      ) : null}

                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => {
                          if (
                            domain.isPrimary &&
                            !window.confirm(
                              'Removing the primary domain will fall back to the default tenant routing. Continue?',
                            )
                          ) {
                            return;
                          }
                          deleteDomainMutation.mutate(domain._id);
                        }}
                        disabled={deleteDomainMutation.isPending}
                      >
                        {deleteLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Removing…
                          </>
                        ) : (
                          <>
                            <Trash2 className="h-4 w-4" /> Remove
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}
        </section>
      </div>
    </SuperAdminLayout>
  );
};

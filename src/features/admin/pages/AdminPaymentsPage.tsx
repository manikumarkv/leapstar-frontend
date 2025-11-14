import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  CircleSlash,
  Clock,
  ExternalLink,
  Loader2,
  RefreshCcw,
  ShieldAlert,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

import type { TenantPaymentStatusResponse, TenantBillingStatus } from '@/api/payments';
import type { BreadcrumbItem } from '@/components/navigation/PageBreadcrumbs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import {
  useAdminPaymentStatus,
  useStripeOnboardingLinkMutation,
} from '@/features/admin/hooks/useAdminPayments';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';
import { cn } from '@/lib/utils';

import { AdminLayout } from '../components/AdminLayout';

const breadcrumbs: BreadcrumbItem[] = [
  { label: 'Admin portal', href: '/admin' },
  { label: 'Payments' },
];

type StatusConfig = {
  label: string;
  description: string;
  badgeClass: string;
  icon: LucideIcon;
};

const STATUS_CONFIG: Record<TenantBillingStatus, StatusConfig> = {
  not_connected: {
    label: 'Not connected',
    description:
      'Connect a Stripe Express account to receive enrollment payments and manage payouts.',
    badgeClass: 'border border-amber-200 bg-amber-50 text-amber-700',
    icon: AlertTriangle,
  },
  pending: {
    label: 'Pending verification',
    description:
      'Stripe is reviewing submitted details. Complete any outstanding requirements to enable payouts.',
    badgeClass: 'border border-sky-200 bg-sky-50 text-sky-700',
    icon: Clock,
  },
  active: {
    label: 'Ready for payouts',
    description:
      'Your Stripe account can accept payments and schedule payouts for staff or partners.',
    badgeClass: 'border border-emerald-200 bg-emerald-50 text-emerald-700',
    icon: CheckCircle2,
  },
  restricted: {
    label: 'Action required',
    description:
      'Stripe has restricted transfers or payouts. Resolve the flagged items below to restore service.',
    badgeClass: 'border border-destructive/30 bg-destructive/10 text-destructive',
    icon: ShieldAlert,
  },
};

type CapabilityMeta = {
  label: string;
  tone: string;
  icon: LucideIcon;
  statusLabel: string;
};

const getCapabilityMeta = (status: string): CapabilityMeta => {
  switch (status) {
    case 'active':
      return {
        label: 'Active',
        tone: 'text-emerald-600',
        icon: CheckCircle2,
        statusLabel: 'Active',
      };
    case 'pending':
      return {
        label: 'Pending review',
        tone: 'text-sky-600',
        icon: Clock,
        statusLabel: 'Pending',
      };
    case 'inactive':
      return {
        label: 'Inactive',
        tone: 'text-muted-foreground',
        icon: CircleSlash,
        statusLabel: 'Inactive',
      };
    case 'disabled':
      return {
        label: 'Disabled',
        tone: 'text-destructive',
        icon: AlertTriangle,
        statusLabel: 'Disabled',
      };
    default:
      return {
        label: status,
        tone: 'text-muted-foreground',
        icon: AlertCircle,
        statusLabel: status,
      };
  }
};

const formatDateTime = (value: string | null): string => {
  if (!value) {
    return '--';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '--';
  }
  return date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
};

const formatRequirementKey = (value: string): string => {
  return value
    .replace(/\./g, ' › ')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (match) => match.toUpperCase());
};

const formatCapabilityName = (key: string): string => {
  return key
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const deriveOnboardingButtonLabel = (status: TenantPaymentStatusResponse | undefined): string => {
  if (!status || !status.hasAccount) {
    return 'Connect with Stripe';
  }
  if (status.status === 'pending') {
    return 'Resume account setup';
  }
  if (status.status === 'restricted') {
    return 'Resolve Stripe requirements';
  }
  if (!status.chargesEnabled || !status.payoutsEnabled || status.requirementsDue.length > 0) {
    return 'Complete account setup';
  }
  return 'Manage Stripe account';
};

export const AdminPaymentsPage = (): JSX.Element => {
  const { data: currentUser, isLoading: isUserLoading } = useCurrentUser();
  const tenantId = currentUser?.tenant?.id ?? null;
  const tenantName = currentUser?.tenant?.name ?? 'Tenant';

  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const paymentStatusQuery = useAdminPaymentStatus({ tenantId, enabled: !isUserLoading });
  const {
    data: paymentStatus,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = paymentStatusQuery;

  const onboardingMutation = useStripeOnboardingLinkMutation(tenantId);
  const { mutateAsync: createOnboardingLink, isPending: isCreatingLink } = onboardingMutation;

  const statusConfig = paymentStatus ? STATUS_CONFIG[paymentStatus.status] : undefined;
  const StatusIcon = statusConfig?.icon;
  const capabilityEntries = useMemo(
    () => Object.entries(paymentStatus?.capabilities ?? {}),
    [paymentStatus?.capabilities],
  );

  useEffect(() => {
    let dirty = false;
    const next = new URLSearchParams(searchParams);

    if (searchParams.has('refresh')) {
      dirty = true;
      next.delete('refresh');
      toast({
        title: 'Stripe onboarding resumed',
        description: 'Continue the verification flow in Stripe to finish connecting your account.',
      });
      if (tenantId) {
        void refetch();
      }
    }

    if (searchParams.has('connected')) {
      dirty = true;
      next.delete('connected');
      toast.success('Stripe account connected', {
        description:
          'We are refreshing your payout status. It may take a few moments to reflect updates.',
      });
      if (tenantId) {
        void refetch();
      }
    }

    if (searchParams.has('error')) {
      dirty = true;
      next.delete('error');
      toast.error('Stripe onboarding was interrupted', {
        description: 'Try again or contact support if the issue persists.',
      });
    }

    if (dirty) {
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, refetch, setSearchParams, tenantId, toast]);

  const showSkeleton =
    isUserLoading ||
    isLoading ||
    (isFetching && (!paymentStatus || Object.keys(paymentStatus).length === 0));

  const errorMessage = useMemo(() => {
    if (!error) {
      return undefined;
    }
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'object' && error && 'message' in error) {
      const message = (error as { message?: unknown }).message;
      if (typeof message === 'string') {
        return message;
      }
    }
    return 'We could not load the Stripe connection status. Please try again.';
  }, [error]);

  const onboardingButtonLabel = deriveOnboardingButtonLabel(paymentStatus);

  const handleConnectClick = async () => {
    if (!tenantId) {
      toast.error('Tenant context missing', {
        description: 'We need a tenant association to initiate Stripe onboarding.',
      });
      return;
    }

    const origin = window.location.origin;
    try {
      const link = await createOnboardingLink({
        refreshUrl: `${origin}/admin/payments?refresh=1`,
        returnUrl: `${origin}/admin/payments?connected=1`,
      });

      toast.success('Redirecting to Stripe', {
        description: 'Finish onboarding in the new tab that opens.',
      });

      window.location.assign(link.url);
    } catch (mutationError) {
      const message =
        mutationError instanceof Error
          ? mutationError.message
          : 'We could not create the Stripe onboarding link.';
      toast.error('Unable to open Stripe onboarding', {
        description: message,
      });
    }
  };

  const showTenantContextMissing = !isUserLoading && !tenantId;

  return (
    <AdminLayout
      title="Payments"
      description="Connect Stripe to accept enrollment payments and issue payouts to your staff or partners."
      breadcrumbs={breadcrumbs}
      documentTitle="Admin Payments"
    >
      <div className="flex flex-col gap-8">
        {showTenantContextMissing ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-sm text-amber-700">
            <h2 className="text-lg font-semibold text-amber-700">Tenant context required</h2>
            <p className="mt-2 text-amber-700/80">
              We could not determine which tenant you manage. Contact support to verify your account
              permissions before configuring payments.
            </p>
          </div>
        ) : null}

        {isError && !showSkeleton ? (
          <div className="flex flex-col gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span>{errorMessage}</span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                void refetch();
              }}
            >
              {isFetching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCcw className="h-4 w-4" />
              )}
              Refresh
            </Button>
          </div>
        ) : null}

        {showSkeleton ? (
          <Card className="border-border/80">
            <CardHeader className="space-y-3">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="space-y-6">
              <Skeleton className="h-12 w-full" />
              <div className="grid gap-4 sm:grid-cols-3">
                {Array.from({ length: 3 }).map((_value, index) => (
                  <Skeleton key={`payments-skeleton-${index}`} className="h-20 w-full" />
                ))}
              </div>
              <Skeleton className="h-9 w-48" />
            </CardContent>
          </Card>
        ) : null}

        {!showSkeleton && paymentStatus && statusConfig && StatusIcon ? (
          <Card className="border-border/80">
            <CardHeader className="space-y-3">
              <CardTitle className="flex items-center gap-2 text-2xl">
                Stripe Connect
                <br className="block sm:hidden" />
                <span className="text-base font-normal text-muted-foreground">{tenantName}</span>
              </CardTitle>
              <CardDescription>{statusConfig.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col gap-4 rounded-xl border border-border/80 bg-muted/30 p-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2 text-base font-semibold text-foreground">
                    <StatusIcon className="h-5 w-5" />
                    {statusConfig.label}
                  </div>
                  <p>
                    {paymentStatus.status === 'active'
                      ? 'Payments and payouts are enabled. Monitor requirements below for any follow-up items.'
                      : 'Complete onboarding steps in Stripe to unlock payments and payouts for your tenant.'}
                  </p>
                </div>
                <span
                  className={cn(
                    'inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide',
                    statusConfig.badgeClass,
                  )}
                >
                  <StatusIcon className="h-4 w-4" />
                  {statusConfig.label}
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  {
                    label: 'Charges enabled',
                    value: paymentStatus.chargesEnabled,
                    helper: 'Required to collect enrollment fees',
                  },
                  {
                    label: 'Payouts enabled',
                    value: paymentStatus.payoutsEnabled,
                    helper: 'Required to send credits to staff or partners',
                  },
                  {
                    label: 'Details submitted',
                    value: paymentStatus.detailsSubmitted,
                    helper: 'Stripe has the required business information',
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={cn(
                      'rounded-xl border p-3 text-sm transition-colors',
                      item.value
                        ? 'border-emerald-200 bg-emerald-50/60 text-emerald-700'
                        : 'border-amber-200 bg-amber-50/70 text-amber-700',
                    )}
                  >
                    <div className="flex items-center gap-2 font-semibold">
                      {item.value ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <AlertTriangle className="h-4 w-4" />
                      )}
                      {item.label}
                    </div>
                    <p className="mt-1 text-xs text-current/80">{item.helper}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button
                  type="button"
                  onClick={handleConnectClick}
                  disabled={isCreatingLink || !tenantId}
                >
                  {isCreatingLink ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ExternalLink className="h-4 w-4" />
                  )}
                  {onboardingButtonLabel}
                  {!isCreatingLink ? <ArrowRight className="h-4 w-4" /> : null}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    void refetch();
                  }}
                  disabled={isFetching}
                >
                  <RefreshCcw className={cn('h-4 w-4', isFetching ? 'animate-spin' : undefined)} />
                  Refresh status
                </Button>
              </div>

              <dl className="grid gap-4 md:grid-cols-3">
                <div>
                  <dt className="text-xs uppercase text-muted-foreground">Stripe account ID</dt>
                  <dd className="text-sm font-medium text-foreground">
                    {paymentStatus.stripeAccountId ?? '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase text-muted-foreground">Default currency</dt>
                  <dd className="text-sm font-medium text-foreground">
                    {paymentStatus.defaultCurrency?.toUpperCase() ?? '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase text-muted-foreground">Last synced</dt>
                  <dd className="text-sm font-medium text-foreground">
                    {isFetching ? 'Refreshing…' : formatDateTime(paymentStatus.lastSyncedAt)}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        ) : null}

        {!showSkeleton && paymentStatus ? (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <Card className="border-border/80">
              <CardHeader>
                <CardTitle className="text-xl">Account requirements</CardTitle>
                <CardDescription>
                  Stripe may request additional information to verify your business and enable
                  payouts.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {paymentStatus.requirementsDue.length === 0 ? (
                  <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50/70 p-4 text-sm text-emerald-700">
                    <CheckCircle2 className="h-5 w-5" />
                    <div>
                      <p className="font-medium">All current requirements satisfied</p>
                      <p className="text-xs text-emerald-700/80">
                        We will notify you here if Stripe asks for anything new.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Provide the following details in Stripe to unlock transfers and payouts.
                    </p>
                    <ul className="space-y-3">
                      {paymentStatus.requirementsDue.map((requirement) => (
                        <li
                          key={requirement}
                          className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50/80 p-3 text-sm text-amber-700"
                        >
                          <AlertTriangle className="mt-0.5 h-4 w-4" />
                          <span>{formatRequirementKey(requirement)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {paymentStatus.requirementsDueBy ? (
                  <div className="rounded-lg border border-amber-200 bg-amber-50/70 p-4 text-sm text-amber-700">
                    <p className="font-medium">Deadline</p>
                    <p className="text-xs text-amber-700/80">
                      Submit required information before{' '}
                      {formatDateTime(paymentStatus.requirementsDueBy)} to avoid payout delays.
                    </p>
                  </div>
                ) : null}

                {paymentStatus.disabledReason ? (
                  <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
                    <p className="font-semibold">Stripe restriction</p>
                    <p className="mt-1 text-destructive/80">{paymentStatus.disabledReason}</p>
                  </div>
                ) : null}
              </CardContent>
            </Card>

            <Card className="border-border/80">
              <CardHeader>
                <CardTitle className="text-xl">Capabilities</CardTitle>
                <CardDescription>
                  Track which Stripe capabilities are enabled for this tenant&rsquo;s Connect
                  account.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {capabilityEntries.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Stripe has not reported capability information for this account yet.
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {capabilityEntries.map(([capabilityKey, capabilityStatus]) => {
                      const meta = getCapabilityMeta(capabilityStatus);
                      const CapabilityIcon = meta.icon;
                      return (
                        <li
                          key={capabilityKey}
                          className="flex items-center justify-between rounded-lg border border-border/60 bg-card/80 px-3 py-3"
                        >
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {formatCapabilityName(capabilityKey)}
                            </p>
                            <p className="text-xs text-muted-foreground">{meta.statusLabel}</p>
                          </div>
                          <span
                            className={cn(
                              'inline-flex items-center gap-2 text-sm font-medium',
                              meta.tone,
                            )}
                          >
                            <CapabilityIcon className="h-4 w-4" />
                            {meta.label}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>
    </AdminLayout>
  );
};

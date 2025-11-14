import { useAuth0 } from '@auth0/auth0-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, CheckCircle2, Image, Loader2, Palette } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { updateTenantById, type UpdateTenantBrandingPayload } from '@/api/tenants';
import type { BreadcrumbItem } from '@/components/navigation/PageBreadcrumbs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AdminLayout } from '@/features/admin/components/AdminLayout';
import {
  useTenantDetails,
  TENANT_DETAILS_QUERY_KEY,
} from '@/features/admin/hooks/useTenantDetails';
import { useCurrentUser, CURRENT_USER_QUERY_KEY } from '@/features/auth/hooks/useCurrentUser';
import { adjustHexLightness, getAccessibleTextColor, normalizeHex } from '@/lib/color';

const HEX_PATTERN = /^#?[0-9a-fA-F]{6}$/;

const breadcrumbs: BreadcrumbItem[] = [
  { label: 'Admin portal', href: '/admin' },
  { label: 'Tenant appearance' },
];

type BrandingFormState = {
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
};

type BrandingFormErrors = Partial<Record<keyof BrandingFormState, string | null>>;

type SectionMessage = {
  type: 'success' | 'error' | 'info';
  text: string;
};

const defaultBrandingState: BrandingFormState = {
  logoUrl: '',
  primaryColor: '#2563EB',
  secondaryColor: '#1D4ED8',
};

const normalizeColorInput = (value: string): string => normalizeHex(value, '#2563EB');

const validateBranding = (state: BrandingFormState): BrandingFormErrors => {
  const errors: BrandingFormErrors = {};

  if (state.logoUrl && !state.logoUrl.startsWith('http')) {
    errors.logoUrl = 'Provide a valid URL (including protocol).';
  }

  if (!HEX_PATTERN.test(state.primaryColor)) {
    errors.primaryColor = 'Enter a 6-digit hex color (e.g. #2563EB).';
  }

  if (!HEX_PATTERN.test(state.secondaryColor)) {
    errors.secondaryColor = 'Enter a 6-digit hex color (e.g. #1D4ED8).';
  }

  return errors;
};

const getAccentColor = (primaryColor: string) => adjustHexLightness(primaryColor, 0.08);

export const AdminTenantAppearancePage = (): JSX.Element => {
  const { getAccessTokenSilently } = useAuth0();
  const queryClient = useQueryClient();
  const { data: currentUser } = useCurrentUser();

  const tenantId = currentUser?.tenant?.id ?? null;

  const { data: tenant, isLoading, isError, error } = useTenantDetails(tenantId ?? undefined);

  const [formState, setFormState] = useState<BrandingFormState>(defaultBrandingState);
  const [baselineState, setBaselineState] = useState<BrandingFormState>(defaultBrandingState);
  const [formErrors, setFormErrors] = useState<BrandingFormErrors>({});
  const [message, setMessage] = useState<SectionMessage | null>(null);

  useEffect(() => {
    if (!tenant) {
      return;
    }

    const branding = tenant.settings?.branding ?? {};
    const nextState: BrandingFormState = {
      logoUrl: branding?.logoUrl ?? '',
      primaryColor: branding?.primaryColor ? normalizeColorInput(branding.primaryColor) : '#2563EB',
      secondaryColor: branding?.secondaryColor
        ? normalizeColorInput(branding.secondaryColor)
        : '#1D4ED8',
    };

    setFormState(nextState);
    setBaselineState(nextState);
    setFormErrors({});
    setMessage(null);
  }, [tenant]);

  const mutation = useMutation({
    mutationFn: async (payload: UpdateTenantBrandingPayload) => {
      if (!tenantId) {
        throw new Error('Tenant id missing');
      }
      const token = await getAccessTokenSilently();
      return updateTenantById(token, tenantId, {
        settings: {
          branding: payload,
        },
      });
    },
    onSuccess: async () => {
      if (tenantId) {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: TENANT_DETAILS_QUERY_KEY(tenantId) }),
          queryClient.invalidateQueries({ queryKey: CURRENT_USER_QUERY_KEY }),
        ]);
      }
      setMessage({ type: 'success', text: 'Tenant branding updated successfully.' });
    },
    onError: (mutationError: unknown) => {
      const text =
        mutationError instanceof Error
          ? mutationError.message
          : 'Unable to update tenant branding. Please try again.';
      setMessage({ type: 'error', text });
    },
  });

  const isDirty = useMemo(() => {
    return (
      formState.logoUrl !== baselineState.logoUrl ||
      formState.primaryColor !== baselineState.primaryColor ||
      formState.secondaryColor !== baselineState.secondaryColor
    );
  }, [baselineState, formState]);

  const accentColor = useMemo(
    () => getAccentColor(formState.primaryColor),
    [formState.primaryColor],
  );
  const primaryForeground = useMemo(
    () => normalizeHex(getAccessibleTextColor(formState.primaryColor), '#FFFFFF'),
    [formState.primaryColor],
  );
  const secondaryForeground = useMemo(
    () => normalizeHex(getAccessibleTextColor(formState.secondaryColor), '#0F172A'),
    [formState.secondaryColor],
  );
  const accentForeground = useMemo(
    () => normalizeHex(getAccessibleTextColor(accentColor), '#FFFFFF'),
    [accentColor],
  );

  const handleChange = (field: keyof BrandingFormState, value: string) => {
    setFormState((previous) => ({ ...previous, [field]: value }));
    setFormErrors((previous) => ({ ...previous, [field]: null }));
    setMessage(null);
  };

  const handleColorChange = (field: 'primaryColor' | 'secondaryColor', value: string) => {
    const normalized = normalizeColorInput(value);
    handleChange(field, normalized);
  };

  const handleSubmit = async () => {
    const normalizedState: BrandingFormState = {
      logoUrl: formState.logoUrl.trim(),
      primaryColor: normalizeColorInput(formState.primaryColor),
      secondaryColor: normalizeColorInput(formState.secondaryColor),
    };

    const validation = validateBranding(normalizedState);
    const hasErrors = Object.values(validation).some(Boolean);

    if (hasErrors) {
      setFormErrors(validation);
      setMessage({ type: 'error', text: 'Please resolve the highlighted fields.' });
      return;
    }

    const payload: UpdateTenantBrandingPayload = {
      logoUrl: normalizedState.logoUrl.length ? normalizedState.logoUrl : null,
      primaryColor: normalizedState.primaryColor,
      secondaryColor: normalizedState.secondaryColor,
    };

    setMessage(null);
    try {
      await mutation.mutateAsync(payload);
      const nextState: BrandingFormState = {
        logoUrl: payload.logoUrl ?? '',
        primaryColor: payload.primaryColor ?? defaultBrandingState.primaryColor,
        secondaryColor: payload.secondaryColor ?? defaultBrandingState.secondaryColor,
      };
      setFormState(nextState);
      setBaselineState(nextState);
    } catch {
      // Error handled in onError.
    }
  };

  if (!tenantId) {
    return (
      <AdminLayout
        title="Tenant appearance"
        description="Define the branding palette that tenant-facing experiences use."
        breadcrumbs={breadcrumbs}
        documentTitle="Tenant Appearance"
      >
        <Card className="border-destructive/40 bg-destructive/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" /> Missing tenant context
            </CardTitle>
            <CardDescription className="text-destructive">
              You need an active tenant association to configure tenant branding.
            </CardDescription>
          </CardHeader>
        </Card>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Tenant appearance"
      description="Control how the platform looks for your tenant members across light and dark modes."
      breadcrumbs={breadcrumbs}
      documentTitle="Tenant Appearance"
    >
      <div className="space-y-8">
        {isLoading ? (
          <Card className="border-border/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading tenant branding
              </CardTitle>
              <CardDescription>Fetching the latest appearance settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
            </CardContent>
          </Card>
        ) : null}

        {isError ? (
          <Card className="border-destructive/40 bg-destructive/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-4 w-4" /> Unable to load tenant branding
              </CardTitle>
              <CardDescription className="text-destructive">
                {error instanceof Error ? error.message : 'An unexpected error occurred.'}
              </CardDescription>
            </CardHeader>
          </Card>
        ) : null}

        {!isLoading && !isError ? (
          <Card className="border-border/80">
            <CardHeader>
              <CardTitle className="text-foreground">Color palette</CardTitle>
              <CardDescription>
                Tune the primary and secondary colors that feed both light and dark theme tokens.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {message ? (
                <div
                  className={
                    message.type === 'success'
                      ? 'rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600'
                      : message.type === 'info'
                        ? 'rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-primary'
                        : 'rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive'
                  }
                >
                  <div className="flex items-center gap-2">
                    {message.type === 'success' ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : message.type === 'info' ? (
                      <Loader2 className="h-4 w-4" />
                    ) : (
                      <AlertCircle className="h-4 w-4" />
                    )}
                    <span>{message.text}</span>
                  </div>
                </div>
              ) : null}

              <div className="grid gap-6 lg:grid-cols-[2fr_minmax(0,1fr)]">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="logoUrl" className="text-sm font-medium text-foreground">
                      Logo URL
                    </Label>
                    <Input
                      id="logoUrl"
                      type="url"
                      placeholder="https://cdn.example.com/assets/logo.svg"
                      value={formState.logoUrl}
                      onChange={(event) => handleChange('logoUrl', event.target.value)}
                      disabled={mutation.isPending}
                    />
                    <p className="text-xs text-muted-foreground">
                      Provide a publicly accessible image URL (SVG or PNG recommended).
                    </p>
                    {formErrors.logoUrl ? (
                      <p className="text-xs text-destructive">{formErrors.logoUrl}</p>
                    ) : null}
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-foreground">Primary color</Label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          className="h-10 w-16 cursor-pointer rounded border border-border bg-transparent p-1"
                          value={formState.primaryColor}
                          onChange={(event) =>
                            handleColorChange('primaryColor', event.target.value)
                          }
                          disabled={mutation.isPending}
                        />
                        <span className="font-mono text-xs text-muted-foreground">
                          {formState.primaryColor.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Used for primary actions, highlights, and interactive accents.
                      </p>
                      {formErrors.primaryColor ? (
                        <p className="text-xs text-destructive">{formErrors.primaryColor}</p>
                      ) : null}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-foreground">Secondary color</Label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          className="h-10 w-16 cursor-pointer rounded border border-border bg-transparent p-1"
                          value={formState.secondaryColor}
                          onChange={(event) =>
                            handleColorChange('secondaryColor', event.target.value)
                          }
                          disabled={mutation.isPending}
                        />
                        <span className="font-mono text-xs text-muted-foreground">
                          {formState.secondaryColor.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Applied to supporting surfaces, badges, and nested cards.
                      </p>
                      {formErrors.secondaryColor ? (
                        <p className="text-xs text-destructive">{formErrors.secondaryColor}</p>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="space-y-4 rounded-xl border border-border/60 bg-background/70 p-5 shadow-inner">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Palette className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Live preview</p>
                      <p className="text-xs text-muted-foreground">
                        Snapshot of how these colors drive UI tokens.
                      </p>
                    </div>
                  </div>

                  <div
                    className="rounded-lg border border-border/50"
                    style={{ backgroundColor: '#ffffff' }}
                  >
                    <div
                      className="rounded-t-lg px-4 py-3 text-sm font-semibold"
                      style={{
                        backgroundColor: formState.primaryColor,
                        color: primaryForeground,
                      }}
                    >
                      Primary button
                    </div>
                    <div className="space-y-3 px-4 py-4 text-xs" style={{ color: '#0f172a' }}>
                      <p>Headline and supporting copy styles.</p>
                      <span
                        className="inline-flex rounded-full px-3 py-1 text-xs font-medium"
                        style={{
                          backgroundColor: formState.secondaryColor,
                          color: secondaryForeground,
                        }}
                      >
                        Secondary badge
                      </span>
                      <span style={{ color: accentColor }}>Accent link</span>
                    </div>
                  </div>

                  <div
                    className="rounded-lg border border-border/50"
                    style={{ backgroundColor: '#0f172a' }}
                  >
                    <div
                      className="rounded-t-lg px-4 py-3 text-sm font-semibold"
                      style={{
                        backgroundColor: formState.secondaryColor,
                        color: secondaryForeground,
                      }}
                    >
                      Dark mode card
                    </div>
                    <div className="space-y-3 px-4 py-4 text-xs" style={{ color: '#f8fafc' }}>
                      <p>Body text on dark surfaces remains readable.</p>
                      <span
                        className="inline-flex rounded-full px-3 py-1 text-xs font-medium"
                        style={{
                          backgroundColor: accentColor,
                          color: accentForeground,
                        }}
                      >
                        Accent pill
                      </span>
                      <span style={{ color: formState.primaryColor }}>Primary underline</span>
                    </div>
                  </div>

                  {formState.logoUrl ? (
                    <div className="rounded-lg border border-dashed border-border/60 p-4 text-center">
                      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Image className="h-6 w-6" />
                      </div>
                      <p className="text-xs font-medium text-foreground">Logo preview</p>
                      <p
                        className="mt-1 truncate text-xs text-muted-foreground"
                        title={formState.logoUrl}
                      >
                        {formState.logoUrl}
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setFormState(baselineState);
                    setFormErrors({});
                    setMessage(null);
                  }}
                  disabled={!isDirty || mutation.isPending}
                >
                  Reset
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    void handleSubmit();
                  }}
                  disabled={!isDirty || mutation.isPending}
                >
                  {mutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving
                    </>
                  ) : (
                    'Save changes'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </AdminLayout>
  );
};

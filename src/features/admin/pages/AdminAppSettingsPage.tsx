import { useAuth0 } from '@auth0/auth0-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import {
  upsertSystemSetting,
  type ApiSystemSetting,
  type UpsertSystemSettingPayload,
} from '@/api/systemSettings';
import type { BreadcrumbItem } from '@/components/navigation/PageBreadcrumbs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { AdminLayout } from '../components/AdminLayout';
import {
  ADMIN_SYSTEM_SETTINGS_QUERY_KEY,
  useAdminSystemSettings,
} from '../hooks/useAdminSystemSettings';

type SettingFieldDefinition = {
  key: string;
  label: string;
  type: 'text' | 'tel' | 'number';
  placeholder?: string;
  helperText?: string;
  required?: boolean;
  min?: number;
  scope?: 'global' | 'tenant-default';
  description?: string;
};

type SettingSectionDefinition = {
  id: string;
  title: string;
  description: string;
  fields: SettingFieldDefinition[];
};

type SectionMessage = {
  type: 'success' | 'error' | 'info';
  text: string;
};

const settingSections: SettingSectionDefinition[] = [
  {
    id: 'support',
    title: 'Support & communication',
    description: 'Contact channels rendered across user-facing help surfaces.',
    fields: [
      {
        key: 'support.phone',
        label: 'Support phone number',
        type: 'tel',
        placeholder: '+1-555-0138',
        helperText: 'Shown on help dialogs and transactional emails.',
        required: true,
        scope: 'global',
        description: 'Primary support phone number used across the platform.',
      },
    ],
  },
  {
    id: 'students',
    title: 'Student defaults',
    description: 'Credit allocations applied when new tenants or students are provisioned.',
    fields: [
      {
        key: 'students.defaultCredits',
        label: 'Default student credits',
        type: 'number',
        min: 0,
        helperText: 'Used when a tenant does not override their initial credit allocation.',
        required: true,
        scope: 'tenant-default',
        description: 'Fallback default credit balance for new students.',
      },
    ],
  },
  {
    id: 'resources',
    title: 'Resource storage',
    description: 'Control which storage integration backs file uploads.',
    fields: [
      {
        key: 'resources.storageProvider',
        label: 'Storage provider key',
        type: 'text',
        placeholder: 's3',
        helperText: 'Matches the backend integration identifier (e.g. s3, gcs, azure).',
        required: true,
        scope: 'global',
        description: 'Active storage provider identifier for uploaded assets.',
      },
    ],
  },
];

const trackedSettingKeys = new Set<string>(
  settingSections.flatMap((section) => section.fields.map((field) => field.key)),
);

const breadcrumbs: BreadcrumbItem[] = [
  { label: 'Admin portal', href: '/admin' },
  { label: 'Application settings' },
];

const formatSettingValue = (field: SettingFieldDefinition, rawValue: unknown): string => {
  if (rawValue === null || rawValue === undefined) {
    return '';
  }
  if (field.type === 'number' && typeof rawValue === 'number') {
    return Number.isFinite(rawValue) ? rawValue.toString() : '';
  }
  if (typeof rawValue === 'string') {
    return rawValue;
  }
  return JSON.stringify(rawValue);
};

const parseSettingValue = (
  field: SettingFieldDefinition,
  rawValue: string,
): { success: true; value: unknown } | { success: false; error: string } => {
  const trimmed = rawValue.trim();

  if (field.type === 'number') {
    if (!trimmed.length) {
      return field.required
        ? { success: false, error: 'This value is required.' }
        : { success: true, value: null };
    }
    const numeric = Number(trimmed);
    if (Number.isNaN(numeric)) {
      return { success: false, error: 'Enter a valid number.' };
    }
    if (field.min !== undefined && numeric < field.min) {
      return { success: false, error: `Value must be at least ${field.min}.` };
    }
    return { success: true, value: numeric };
  }

  if (!trimmed.length && field.required) {
    return { success: false, error: 'This value is required.' };
  }

  return { success: true, value: trimmed };
};

export const AdminAppSettingsPage = (): JSX.Element => {
  const queryClient = useQueryClient();
  const { getAccessTokenSilently } = useAuth0();
  const { data: systemSettings, isLoading, isError, error } = useAdminSystemSettings();

  const settingsMap = useMemo(() => {
    const map = new Map<string, ApiSystemSetting>();
    (systemSettings ?? []).forEach((setting) => {
      map.set(setting.key, setting);
    });
    return map;
  }, [systemSettings]);

  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [baselineValues, setBaselineValues] = useState<Record<string, string>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string | null>>({});
  const [sectionMessages, setSectionMessages] = useState<Record<string, SectionMessage | null>>({});
  const [savingSection, setSavingSection] = useState<string | null>(null);

  useEffect(() => {
    if (!systemSettings) {
      return;
    }
    const nextValues: Record<string, string> = {};
    settingSections.forEach((section) => {
      section.fields.forEach((field) => {
        const current = settingsMap.get(field.key);
        nextValues[field.key] = formatSettingValue(field, current?.value);
      });
    });
    setFormValues(nextValues);
    setBaselineValues(nextValues);
  }, [settingsMap, systemSettings]);

  const updateSettingMutation = useMutation({
    mutationFn: async (payload: UpsertSystemSettingPayload) => {
      const token = await getAccessTokenSilently();
      return upsertSystemSetting(token, payload);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ADMIN_SYSTEM_SETTINGS_QUERY_KEY });
    },
  });

  const handleFieldChange = (key: string, value: string) => {
    setFormValues((previous) => ({ ...previous, [key]: value }));
    setFieldErrors((previous) => ({ ...previous, [key]: null }));
  };

  const handleSaveSection = async (sectionId: string) => {
    const section = settingSections.find((candidate) => candidate.id === sectionId);
    if (!section) {
      return;
    }

    const pendingErrors: Record<string, string | null> = {};
    const updates: UpsertSystemSettingPayload[] = [];

    section.fields.forEach((field) => {
      const currentValue = formValues[field.key] ?? '';
      const baselineValue = baselineValues[field.key] ?? '';
      if (currentValue === baselineValue) {
        pendingErrors[field.key] = null;
        return;
      }

      const parseResult = parseSettingValue(field, currentValue);
      if (!parseResult.success) {
        pendingErrors[field.key] = parseResult.error;
        return;
      }

      pendingErrors[field.key] = null;

      const existingSetting = settingsMap.get(field.key);
      updates.push({
        key: field.key,
        value: parseResult.value,
        description: existingSetting?.description ?? field.description,
        scope: existingSetting?.scope ?? field.scope,
      });
    });

    setFieldErrors((previous) => ({ ...previous, ...pendingErrors }));

    const hasValidationError = Object.values(pendingErrors).some((message) => message);
    if (hasValidationError) {
      setSectionMessages((previous) => ({
        ...previous,
        [section.id]: { type: 'error', text: 'Please resolve the highlighted fields.' },
      }));
      return;
    }

    if (updates.length === 0) {
      setSectionMessages((previous) => ({
        ...previous,
        [section.id]: { type: 'info', text: 'No changes to save for this section.' },
      }));
      return;
    }

    setSavingSection(section.id);
    setSectionMessages((previous) => ({ ...previous, [section.id]: null }));

    try {
      for (const update of updates) {
        await updateSettingMutation.mutateAsync(update);
      }

      const updatedBaselineEntries: Record<string, string> = {};
      updates.forEach((update) => {
        updatedBaselineEntries[update.key] = formValues[update.key] ?? '';
      });
      setBaselineValues((previous) => ({ ...previous, ...updatedBaselineEntries }));

      setSectionMessages((previous) => ({
        ...previous,
        [section.id]: { type: 'success', text: 'Settings saved successfully.' },
      }));
    } catch (mutationError) {
      const message =
        mutationError instanceof Error
          ? mutationError.message
          : 'Unable to update settings. Please try again.';
      setSectionMessages((previous) => ({
        ...previous,
        [section.id]: { type: 'error', text: message },
      }));
    } finally {
      setSavingSection(null);
    }
  };

  const otherSettings = useMemo(() => {
    return (systemSettings ?? []).filter((setting) => !trackedSettingKeys.has(setting.key));
  }, [systemSettings]);

  return (
    <AdminLayout
      title="Application settings"
      description="Configure platform preferences, policies, and integrations."
      breadcrumbs={breadcrumbs}
      documentTitle="Admin Application Settings"
    >
      <div className="space-y-8">
        {isLoading ? (
          <Card className="border-border/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading settings
              </CardTitle>
              <CardDescription>Retrieving the latest application configuration.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
            </CardContent>
          </Card>
        ) : null}

        {isError ? (
          <Card className="border-destructive/50 bg-destructive/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-4 w-4" /> Unable to load settings
              </CardTitle>
              <CardDescription className="text-destructive">
                {error instanceof Error ? error.message : 'An unexpected error occurred.'}
              </CardDescription>
            </CardHeader>
          </Card>
        ) : null}

        {!isLoading && !isError ? (
          <div className="space-y-8">
            {settingSections.map((section) => {
              const sectionMessage = sectionMessages[section.id];
              const sectionDirty = section.fields.some(
                (field) => (formValues[field.key] ?? '') !== (baselineValues[field.key] ?? ''),
              );
              const disabled = savingSection === section.id || updateSettingMutation.isPending;

              return (
                <Card key={section.id} className="border-border/80">
                  <CardHeader>
                    <CardTitle className="text-foreground">{section.title}</CardTitle>
                    <CardDescription>{section.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {sectionMessage ? (
                      <div
                        className={
                          sectionMessage.type === 'success'
                            ? 'rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600'
                            : sectionMessage.type === 'info'
                              ? 'rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-primary'
                              : 'rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive'
                        }
                      >
                        <div className="flex items-center gap-2">
                          {sectionMessage.type === 'success' ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : sectionMessage.type === 'info' ? (
                            <Loader2 className="h-4 w-4" />
                          ) : (
                            <AlertCircle className="h-4 w-4" />
                          )}
                          <span>{sectionMessage.text}</span>
                        </div>
                      </div>
                    ) : null}

                    <div className="grid gap-6 md:grid-cols-2">
                      {section.fields.map((field) => {
                        const value = formValues[field.key] ?? '';
                        const errorMessage = fieldErrors[field.key];
                        return (
                          <div key={field.key} className="space-y-2">
                            <Label htmlFor={field.key} className="text-sm text-foreground">
                              {field.label}
                            </Label>
                            <Input
                              id={field.key}
                              type={field.type === 'number' ? 'number' : field.type}
                              min={field.type === 'number' ? field.min : undefined}
                              placeholder={field.placeholder}
                              value={value}
                              onChange={(event) => handleFieldChange(field.key, event.target.value)}
                              disabled={disabled}
                            />
                            {field.helperText ? (
                              <p className="text-xs text-muted-foreground">{field.helperText}</p>
                            ) : null}
                            {errorMessage ? (
                              <p className="text-xs text-destructive">{errorMessage}</p>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-end gap-3">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => {
                          const resetValues: Record<string, string> = {};
                          section.fields.forEach((field) => {
                            const baseline = baselineValues[field.key] ?? '';
                            resetValues[field.key] = baseline;
                          });
                          setFormValues((previous) => ({ ...previous, ...resetValues }));
                          setFieldErrors((previous) => ({
                            ...previous,
                            ...Object.fromEntries(
                              section.fields.map((field) => [field.key, null as string | null]),
                            ),
                          }));
                          setSectionMessages((previous) => ({
                            ...previous,
                            [section.id]: null,
                          }));
                        }}
                        disabled={!sectionDirty || disabled}
                      >
                        Reset
                      </Button>
                      <Button
                        type="button"
                        onClick={() => {
                          void handleSaveSection(section.id);
                        }}
                        disabled={!sectionDirty || disabled}
                      >
                        {savingSection === section.id ? (
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
              );
            })}

            {otherSettings.length ? (
              <Card className="border-border/80">
                <CardHeader>
                  <CardTitle className="text-foreground">Additional settings</CardTitle>
                  <CardDescription>
                    These settings are available via the API but are not yet editable from this
                    interface.
                  </CardDescription>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="text-left text-xs uppercase text-muted-foreground">
                      <tr>
                        <th className="px-3 py-2 font-medium">Key</th>
                        <th className="px-3 py-2 font-medium">Value</th>
                        <th className="px-3 py-2 font-medium">Scope</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {otherSettings.map((setting) => (
                        <tr key={setting._id} className="align-top">
                          <td className="px-3 py-2 font-mono text-xs text-foreground">
                            {setting.key}
                          </td>
                          <td className="px-3 py-2 text-foreground">
                            <pre className="whitespace-pre-wrap break-words text-xs text-muted-foreground">
                              {JSON.stringify(setting.value, null, 2)}
                            </pre>
                          </td>
                          <td className="px-3 py-2 text-xs text-muted-foreground">
                            {setting.scope}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            ) : null}
          </div>
        ) : null}
      </div>
    </AdminLayout>
  );
};

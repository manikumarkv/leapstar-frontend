import { useAuth0 } from '@auth0/auth0-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { getEmailPreferences, updateEmailPreferences, type EmailPreferences } from '@/api/settings';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const EmailPreferencesPage = (): JSX.Element => {
  const { getAccessTokenSilently, isLoading: authLoading } = useAuth0();

  const { data, isLoading } = useQuery(
    ['email-preferences'],
    async () => {
      const token = await getAccessTokenSilently();
      return getEmailPreferences(token);
    },
    { enabled: !authLoading },
  );
  const [form, setForm] = useState<EmailPreferences | null>(null);
  const mutation = useMutation(
    async (updated: EmailPreferences) => {
      const token = await getAccessTokenSilently();
      return updateEmailPreferences(token, updated);
    },
    { onSuccess: (prefs) => setForm(prefs) },
  );

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  if (authLoading || isLoading || !form) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        Loading preferences...
      </div>
    );
  }

  const toggle = (key: keyof EmailPreferences) => {
    setForm((prev) => (prev ? { ...prev, [key]: !prev[key] } : prev));
  };

  const handleSave = () => {
    if (!form) return;
    mutation.mutate(form);
  };

  const pageBody = (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Email preferences</h2>
        <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
          Choose which communications you would like to receive. You can change these anytime.
        </p>
      </div>

      <div className="grid gap-6 md:max-w-xl">
        <PreferenceRow
          label="Product updates"
          description="New features, improvements, and important announcements about the platform."
          checked={form.productUpdates}
          onChange={() => toggle('productUpdates')}
        />
        <PreferenceRow
          label="Marketing"
          description="Occasional marketing and promotional content (opt-in)."
          checked={form.marketing}
          onChange={() => toggle('marketing')}
        />
        <PreferenceRow
          label="Transactions"
          description="Receipts, confirmations, and critical account activity (always recommended)."
          checked={form.transactions}
          onChange={() => toggle('transactions')}
        />
        <PreferenceRow
          label="Reminders"
          description="Program reminders, enrollment deadlines, upcoming events."
          checked={form.reminders}
          onChange={() => toggle('reminders')}
        />
      </div>

      <div className="flex items-center gap-4">
        <Button onClick={handleSave} disabled={mutation.isLoading}>
          {mutation.isLoading ? 'Saving...' : 'Save preferences'}
        </Button>
        {mutation.isSuccess ? (
          <span className="text-sm text-green-600 dark:text-green-400">Saved</span>
        ) : null}
      </div>
    </div>
  );

  return pageBody;
};

interface PreferenceRowProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}

const PreferenceRow = ({ label, description, checked, onChange }: PreferenceRowProps) => (
  <label className="flex cursor-pointer items-start gap-4 rounded-lg border border-border/60 p-4 hover:bg-muted/30">
    <div className="pt-1">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className={cn(
          'h-4 w-4 rounded border border-border bg-background text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        )}
      />
    </div>
    <div>
      <p className="font-medium leading-none">{label}</p>
      <p className="mt-1 text-xs text-muted-foreground md:text-sm">{description}</p>
    </div>
  </label>
);

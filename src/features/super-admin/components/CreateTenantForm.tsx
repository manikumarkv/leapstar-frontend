import { useAuth0 } from '@auth0/auth0-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusCircle } from 'lucide-react';
import { type ChangeEvent, type FormEvent, useState } from 'react';

import { ApiError } from '@/api/client';
import { createTenant, type CreateTenantPayload, type TenantResponse } from '@/api/tenants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

import { SUPER_ADMIN_TENANTS_QUERY_KEY } from '../hooks/useSuperAdminTenants';

type CreateTenantFormProps = {
  onSuccess?: (tenant: TenantResponse) => void;
};

type TenantFormState = {
  name: string;
  slug: string;
  domains: string;
  appName: string;
};

const createInitialTenantFormState = (): TenantFormState => ({
  name: '',
  slug: '',
  domains: '',
  appName: '',
});

const slugifyTenantSlug = (value: string): string => {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const parseDomainList = (value: string): string[] => {
  return value
    .split(/[,\n]+/)
    .map((domain) => domain.trim().toLowerCase())
    .filter((domain) => domain.length > 0);
};

export const CreateTenantForm = ({ onSuccess }: CreateTenantFormProps): JSX.Element => {
  const { getAccessTokenSilently } = useAuth0();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [formValues, setFormValues] = useState(() => createInitialTenantFormState());
  const [isSlugDirty, setIsSlugDirty] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (payload: CreateTenantPayload) => {
      const token = await getAccessTokenSilently();
      return createTenant(token, payload);
    },
    onSuccess: async (tenant) => {
      setSubmissionError(null);
      setFormValues(createInitialTenantFormState());
      setIsSlugDirty(false);
      toast({
        title: 'Tenant created',
        description: `${tenant.name} is now available.`,
      });
      await queryClient.invalidateQueries({ queryKey: SUPER_ADMIN_TENANTS_QUERY_KEY });
      onSuccess?.(tenant);
    },
    onError: (error: unknown) => {
      if (error instanceof ApiError) {
        setSubmissionError(error.message);
        return;
      }
      if (error instanceof Error) {
        setSubmissionError(error.message);
        return;
      }
      setSubmissionError('Could not create the tenant. Please try again.');
    },
  });

  const isSubmitting = mutation.isPending;

  const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setSubmissionError(null);
    setFormValues((previous) => ({
      ...previous,
      name: value,
      slug: isSlugDirty ? previous.slug : slugifyTenantSlug(value),
    }));
  };

  const handleSlugChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setSubmissionError(null);
    setIsSlugDirty(true);
    setFormValues((previous) => ({
      ...previous,
      slug: value,
    }));
  };

  const handleSlugBlur = () => {
    setFormValues((previous) => ({
      ...previous,
      slug: slugifyTenantSlug(previous.slug),
    }));
  };

  const handleDomainsChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setSubmissionError(null);
    setFormValues((previous) => ({
      ...previous,
      domains: value,
    }));
  };

  const handleAppNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setSubmissionError(null);
    setFormValues((previous) => ({
      ...previous,
      appName: value,
    }));
  };

  const normalizedSlug = slugifyTenantSlug(formValues.slug);
  const isCreateDisabled =
    isSubmitting || formValues.name.trim().length === 0 || normalizedSlug.length === 0;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = formValues.name.trim();
    const nextSlug = slugifyTenantSlug(formValues.slug);

    if (!trimmedName) {
      setSubmissionError('Tenant name is required.');
      return;
    }

    if (!nextSlug) {
      setSubmissionError('Tenant slug is required.');
      return;
    }

    setFormValues((previous) => ({
      ...previous,
      slug: nextSlug,
    }));

    const payload: CreateTenantPayload = {
      name: trimmedName,
      slug: nextSlug,
    };

    const domains = parseDomainList(formValues.domains);
    if (domains.length > 0) {
      payload.domains = domains;
    }

    const appName = formValues.appName.trim();
    if (appName.length > 0) {
      payload.settings = { appName };
    }

    setSubmissionError(null);
    mutation.mutate(payload);
  };

  return (
    <form className="grid gap-6" onSubmit={handleSubmit}>
      {submissionError ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {submissionError}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 md:gap-6">
        <div className="grid gap-2">
          <Label htmlFor="tenant-name">Tenant name</Label>
          <Input
            id="tenant-name"
            placeholder="Sunrise Academy"
            value={formValues.name}
            onChange={handleNameChange}
            disabled={isSubmitting}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="tenant-slug">Tenant slug</Label>
          <Input
            id="tenant-slug"
            placeholder="sunrise-academy"
            value={formValues.slug}
            onChange={handleSlugChange}
            onBlur={handleSlugBlur}
            disabled={isSubmitting}
            required
          />
          <p className="text-xs text-muted-foreground">
            Lowercase letters, numbers, and hyphens only. This appears in URLs and API keys.
          </p>
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="tenant-domains">Domains (optional)</Label>
        <Input
          id="tenant-domains"
          placeholder="learn.example.org, staff.example.org"
          value={formValues.domains}
          onChange={handleDomainsChange}
          disabled={isSubmitting}
        />
        <p className="text-xs text-muted-foreground">
          Separate multiple domains with commas or new lines.
        </p>
      </div>

      <div className="grid gap-2 md:max-w-md">
        <Label htmlFor="tenant-app-name">App name (optional)</Label>
        <Input
          id="tenant-app-name"
          placeholder="Leapstar for Sunrise"
          value={formValues.appName}
          onChange={handleAppNameChange}
          disabled={isSubmitting}
        />
      </div>

      <div className="flex items-center justify-end">
        <Button
          type="submit"
          disabled={isCreateDisabled}
          className="inline-flex items-center gap-2"
        >
          {isSubmitting ? (
            'Creating…'
          ) : (
            <>
              <PlusCircle className="h-4 w-4" />
              Create tenant
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

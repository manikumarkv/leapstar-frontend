import { useAuth0 } from '@auth0/auth0-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { FormEvent, ChangeEvent } from 'react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ApiError } from '@/api/client';
import { addParent, type AddParentPayload } from '@/api/users';
import type { BreadcrumbItem } from '@/components/navigation/PageBreadcrumbs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';
import { StudentLayout } from '@/features/student/components/StudentLayout';
import { STUDENT_PARENTS_QUERY_KEY } from '@/features/student/hooks/useStudentParents';

const breadcrumbs: BreadcrumbItem[] = [
  { label: 'Student portal', href: '/student' },
  { label: 'Parents', href: '/student/parents' },
  { label: 'Add parent' },
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const US_PHONE_PATTERN = /^(?:\+?1\s?)?(?:\(\d{3}\)|\d{3})[\s.-]?\d{3}[\s.-]?\d{4}$/;

export const StudentAddParentPage = (): JSX.Element => {
  const { getAccessTokenSilently } = useAuth0();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data: currentUser } = useCurrentUser();

  const tenantId = currentUser?.tenant?.id ?? null;

  const [formValues, setFormValues] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const isEmailValid = useMemo(() => {
    const candidate = formValues.email.trim();
    if (!candidate.length) return false;
    return EMAIL_PATTERN.test(candidate);
  }, [formValues.email]);

  const isPhoneValid = useMemo(() => {
    const candidate = formValues.phone.trim();
    if (!candidate.length) return true;
    return US_PHONE_PATTERN.test(candidate);
  }, [formValues.phone]);

  const isFormIncomplete = useMemo(() => {
    if (
      !formValues.firstName.trim() ||
      !formValues.lastName.trim() ||
      !formValues.email.trim() ||
      !isEmailValid
    ) {
      return true;
    }

    const phoneCandidate = formValues.phone.trim();
    if (phoneCandidate.length && !isPhoneValid) {
      return true;
    }

    return false;
  }, [formValues, isEmailValid, isPhoneValid]);

  const addParentMutation = useMutation({
    mutationFn: async (payload: AddParentPayload) => {
      if (!tenantId) {
        throw new Error('Tenant context missing');
      }
      const token = await getAccessTokenSilently();
      return addParent(token, tenantId, payload);
    },
    onSuccess: async () => {
      setSubmissionError(null);
      if (tenantId) {
        await queryClient.invalidateQueries({
          queryKey: [...STUDENT_PARENTS_QUERY_KEY, tenantId ?? 'unknown'],
        });
      }
      navigate('/student/parents');
    },
    onError: (error: unknown) => {
      if (error instanceof ApiError) {
        setSubmissionError(error.message);
      } else if (error instanceof Error) {
        setSubmissionError(error.message);
      } else {
        setSubmissionError('Unable to send the invitation. Please try again.');
      }
    },
  });

  const isSubmitting = addParentMutation.isPending;

  const handleInputChange =
    (field: 'firstName' | 'lastName' | 'email' | 'phone') =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;
      setFormValues((previous) => ({
        ...previous,
        [field]: value,
      }));
    };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!tenantId) {
      setSubmissionError('Tenant context missing. Please refresh and try again.');
      return;
    }

    if (!isEmailValid) {
      setSubmissionError('Please enter a valid email address.');
      return;
    }

    if (formValues.phone.trim() && !isPhoneValid) {
      setSubmissionError('Please enter a valid phone number.');
      return;
    }

    const payload: AddParentPayload = {
      firstName: formValues.firstName.trim(),
      lastName: formValues.lastName.trim(),
      email: formValues.email.trim().toLowerCase(),
      phone: formValues.phone.trim() ? formValues.phone.trim() : undefined,
    };

    setSubmissionError(null);
    addParentMutation.mutate(payload);
  };

  return (
    <StudentLayout
      title="Invite a parent"
      description="Send an invitation to connect a parent or guardian with your account."
      breadcrumbs={breadcrumbs}
      documentTitle="Invite Parent"
    >
      <div className="flex flex-col gap-6">
        <Card className="mx-auto w-full max-w-2xl border-border/70 bg-card/90 shadow-lg dark:border-border/50 dark:bg-slate-950/70">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">Parent details</CardTitle>
            <CardDescription>
              Share contact information so your parent or guardian can receive an invitation email.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {submissionError ? (
              <div className="mb-6 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
                {submissionError}
              </div>
            ) : null}
            {!tenantId ? (
              <div className="mb-6 rounded-lg border border-amber-300/40 bg-amber-100/40 p-4 text-sm text-amber-700">
                Tenant context is missing. Make sure your profile is loaded before inviting a
                parent.
              </div>
            ) : null}
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="parent-first-name">First name</Label>
                  <Input
                    id="parent-first-name"
                    placeholder="Alex"
                    autoComplete="given-name"
                    value={formValues.firstName}
                    onChange={handleInputChange('firstName')}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="parent-last-name">Last name</Label>
                  <Input
                    id="parent-last-name"
                    placeholder="Rivera"
                    autoComplete="family-name"
                    value={formValues.lastName}
                    onChange={handleInputChange('lastName')}
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="parent-email">Email</Label>
                <Input
                  id="parent-email"
                  type="email"
                  autoComplete="email"
                  pattern={EMAIL_PATTERN.source}
                  placeholder="parent@example.com"
                  value={formValues.email}
                  onChange={handleInputChange('email')}
                  required
                  disabled={isSubmitting}
                  aria-invalid={!isEmailValid && Boolean(formValues.email.trim())}
                />
                {!isEmailValid && Boolean(formValues.email.trim()) ? (
                  <p className="text-sm text-destructive">Enter a valid email address.</p>
                ) : null}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="parent-phone">Phone number (optional)</Label>
                <Input
                  id="parent-phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="555-0102"
                  value={formValues.phone}
                  onChange={handleInputChange('phone')}
                  disabled={isSubmitting}
                  pattern={US_PHONE_PATTERN.source}
                  aria-invalid={!isPhoneValid && Boolean(formValues.phone.trim())}
                />
                {!isPhoneValid && Boolean(formValues.phone.trim()) ? (
                  <p className="text-sm text-destructive">Enter a valid phone number.</p>
                ) : null}
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/student/parents')}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isFormIncomplete || isSubmitting || !tenantId}>
                  {isSubmitting ? 'Sending…' : 'Send invite'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </StudentLayout>
  );
};

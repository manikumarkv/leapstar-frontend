import { useAuth0 } from '@auth0/auth0-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { ApiError } from '@/api/client';
import {
  createProgram,
  updateProgram,
  type ApiProgramStatus,
  type CreateProgramPayload,
} from '@/api/programs';
import type { BreadcrumbItem } from '@/components/navigation/PageBreadcrumbs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ADMIN_PROGRAM_QUERY_KEY, useAdminProgram } from '@/features/admin/hooks/useAdminProgram';
import { ADMIN_PROGRAMS_QUERY_KEY } from '@/features/admin/hooks/useAdminPrograms';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';

import { AdminLayout } from '../components/AdminLayout';

const DAYS_OF_WEEK = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;

type DayOfWeek = (typeof DAYS_OF_WEEK)[number];

const formatToISOString = (value: string): string => {
  const date = new Date(value);
  return date.toISOString();
};

const toDateInputValue = (value?: string): string => {
  if (!value) {
    return '';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return date.toISOString().slice(0, 10);
};

const coerceInteger = (value: string, fallback = 0): number => {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    return fallback;
  }
  return Math.max(parsed, 0);
};

export const AdminProgramCreatePage = (): JSX.Element => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { getAccessTokenSilently } = useAuth0();
  const { data: currentUser } = useCurrentUser();
  const { id: programId } = useParams<{ id: string }>();

  const tenantId = currentUser?.tenant?.id ?? null;
  const tenantName = currentUser?.tenant?.name ?? 'Current tenant';
  const isEditing = Boolean(programId);
  const programQuery = useAdminProgram({ tenantId, programId: programId ?? null });
  const { data: existingProgram, isError: programLoadFailed } = programQuery;

  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [enrollmentStart, setEnrollmentStart] = useState('');
  const [enrollmentEnd, setEnrollmentEnd] = useState('');
  const [maxEnrollments, setMaxEnrollments] = useState('20');
  const [costCredits, setCostCredits] = useState('0');
  const [locationRoom, setLocationRoom] = useState('');
  const [locationAddress, setLocationAddress] = useState('');
  const [locationCity, setLocationCity] = useState('');
  const [locationState, setLocationState] = useState('');
  const [locationPostalCode, setLocationPostalCode] = useState('');
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>([]);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [currentStatus, setCurrentStatus] = useState<ApiProgramStatus>('draft');
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    if (isEditing && existingProgram && !hasHydrated) {
      setTitle(existingProgram.title ?? '');
      setSummary(existingProgram.summary ?? '');
      setDescription(existingProgram.description ?? '');
      setStartDate(toDateInputValue(existingProgram.dateRange?.start));
      setEndDate(toDateInputValue(existingProgram.dateRange?.end));
      setEnrollmentStart(toDateInputValue(existingProgram.enrollmentWindow?.start));
      setEnrollmentEnd(toDateInputValue(existingProgram.enrollmentWindow?.end));
      setSelectedDays((existingProgram.schedule?.daysOfWeek as DayOfWeek[]) ?? []);
      setStartTime(existingProgram.schedule?.startTime ?? '');
      setEndTime(existingProgram.schedule?.endTime ?? '');
      setMaxEnrollments(String(existingProgram.maxEnrollments ?? ''));
      setCostCredits(
        typeof existingProgram.costCredits === 'number' ? String(existingProgram.costCredits) : '0',
      );
      setLocationRoom(existingProgram.location?.room ?? '');
      setLocationAddress(existingProgram.location?.address?.line1 ?? '');
      setLocationCity(existingProgram.location?.address?.city ?? '');
      setLocationState(existingProgram.location?.address?.state ?? '');
      setLocationPostalCode(existingProgram.location?.address?.postalCode ?? '');
      setCurrentStatus(existingProgram.status);
      setHasHydrated(true);
    }
  }, [existingProgram, hasHydrated, isEditing]);

  const createProgramMutation = useMutation({
    mutationFn: async (payload: CreateProgramPayload) => {
      if (!tenantId) {
        throw new Error('Tenant context missing');
      }
      const token = await getAccessTokenSilently();
      return createProgram(token, tenantId, payload);
    },
    onSuccess: async (program) => {
      if (tenantId) {
        await queryClient.invalidateQueries({ queryKey: [...ADMIN_PROGRAMS_QUERY_KEY, tenantId] });
      }
      navigate(`/admin/programs/${program._id}`);
    },
    onError: (error: unknown) => {
      if (error instanceof ApiError) {
        setSubmissionError(error.message);
      } else if (error instanceof Error) {
        setSubmissionError(error.message);
      } else {
        setSubmissionError('Unable to create program. Please try again.');
      }
    },
  });

  const updateProgramMutation = useMutation({
    mutationFn: async (payload: CreateProgramPayload) => {
      if (!tenantId || !programId) {
        throw new Error('Tenant context missing');
      }
      const token = await getAccessTokenSilently();
      return updateProgram(token, tenantId, programId, payload);
    },
    onSuccess: async (program) => {
      if (tenantId) {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: [...ADMIN_PROGRAMS_QUERY_KEY, tenantId],
          }),
          queryClient.invalidateQueries({
            queryKey: [...ADMIN_PROGRAM_QUERY_KEY, tenantId, program._id],
          }),
        ]);
      }
      navigate(`/admin/programs/${program._id}`);
    },
    onError: (error: unknown) => {
      if (error instanceof ApiError) {
        setSubmissionError(error.message);
      } else if (error instanceof Error) {
        setSubmissionError(error.message);
      } else {
        setSubmissionError('Unable to update program. Please try again.');
      }
    },
  });

  const activeMutation = isEditing ? updateProgramMutation : createProgramMutation;

  const isSubmitting = activeMutation.isPending;

  const breadcrumbs: BreadcrumbItem[] = useMemo(() => {
    const base: BreadcrumbItem[] = [
      { label: 'Admin portal', href: '/admin' },
      { label: 'Programs', href: '/admin/programs' },
    ];
    base.push({ label: isEditing ? 'Edit program' : 'Create program' });
    return base;
  }, [isEditing]);

  const pageTitle = isEditing ? 'Edit program' : 'Create program';
  const pageDescription = isEditing
    ? `Refine the program details for ${tenantName}.`
    : `Launch a new program for ${tenantName}. Provide schedule details, enrollment capacity, and availability.`;
  const documentTitle = isEditing ? 'Edit Program' : 'Create Program';
  const isFormDisabled = isSubmitting || (isEditing && (!hasHydrated || programLoadFailed));

  const toggleDay = (day: DayOfWeek) => {
    setSelectedDays((current) =>
      current.includes(day) ? current.filter((value) => value !== day) : [...current, day],
    );
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!tenantId) {
      setSubmissionError('Tenant context is missing. Refresh and try again.');
      return;
    }

    if (isEditing && !hasHydrated) {
      setSubmissionError('Program details are still loading. Please wait a moment and try again.');
      return;
    }

    if (!title.trim()) {
      setSubmissionError('Title is required.');
      return;
    }
    if (!startDate || !endDate) {
      setSubmissionError('Start and end dates are required.');
      return;
    }
    if (!enrollmentStart || !enrollmentEnd) {
      setSubmissionError('Enrollment window is required.');
      return;
    }

    setSubmissionError(null);

    const maxEnrollmentsValue = Math.max(coerceInteger(maxEnrollments, 20), 1);
    const costCreditsValue = coerceInteger(costCredits, 0);

    const payload: CreateProgramPayload = {
      title: title.trim(),
      summary: summary.trim() || undefined,
      description: description.trim() || undefined,
      dateRange: {
        start: formatToISOString(startDate),
        end: formatToISOString(endDate),
      },
      schedule:
        selectedDays.length > 0 || startTime || endTime
          ? {
              daysOfWeek: selectedDays,
              startTime: startTime || undefined,
              endTime: endTime || undefined,
            }
          : undefined,
      maxEnrollments: maxEnrollmentsValue,
      enrollmentWindow: {
        start: formatToISOString(enrollmentStart),
        end: formatToISOString(enrollmentEnd),
      },
      location:
        locationRoom || locationAddress || locationCity || locationState || locationPostalCode
          ? {
              room: locationRoom || undefined,
              address: {
                line1: locationAddress || undefined,
                city: locationCity || undefined,
                state: locationState || undefined,
                postalCode: locationPostalCode || undefined,
              },
            }
          : undefined,
      costCredits: costCreditsValue,
      status: isEditing ? currentStatus : 'draft',
    };

    activeMutation.mutate(payload);
  };

  return (
    <AdminLayout
      title={pageTitle}
      description={pageDescription}
      breadcrumbs={breadcrumbs}
      documentTitle={documentTitle}
    >
      <Card className="max-w-3xl border-border/80">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">Program details</CardTitle>
          <CardDescription>
            {isEditing
              ? 'Update program information to keep students informed.'
              : 'Fill in key information to make this program discoverable.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {submissionError ? (
            <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
              {submissionError}
            </div>
          ) : null}
          {!tenantId ? (
            <div className="mb-6 rounded-lg border border-amber-300/40 bg-amber-100/40 p-4 text-sm text-amber-700">
              Tenant context unavailable. Ensure your profile is loaded before creating a program.
            </div>
          ) : null}

          {isEditing && programLoadFailed ? (
            <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
              We could not load this program. Please refresh and try again.
            </div>
          ) : null}

          {isEditing && !hasHydrated && !programLoadFailed ? (
            <div className="mb-6 space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : null}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <label className="grid gap-2">
                <span className="text-sm font-medium text-foreground">Program title *</span>
                <Input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="STEM Foundations"
                  required
                  disabled={isFormDisabled}
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-medium text-foreground">Summary</span>
                <Input
                  value={summary}
                  onChange={(event) => setSummary(event.target.value)}
                  placeholder="A quick snapshot of outcomes and focus areas"
                  disabled={isFormDisabled}
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-medium text-foreground">Description</span>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Describe learning goals, expectations, and requirements"
                  rows={4}
                  className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={isFormDisabled}
                />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm font-medium text-foreground">Program start *</span>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                  required
                  disabled={isFormDisabled}
                />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-medium text-foreground">Program end *</span>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                  required
                  disabled={isFormDisabled}
                />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm font-medium text-foreground">Start time</span>
                <Input
                  type="time"
                  value={startTime}
                  onChange={(event) => setStartTime(event.target.value)}
                  disabled={isFormDisabled}
                />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-medium text-foreground">End time</span>
                <Input
                  type="time"
                  value={endTime}
                  onChange={(event) => setEndTime(event.target.value)}
                  disabled={isFormDisabled}
                />
              </label>
            </div>

            <fieldset>
              <legend className="text-sm font-medium text-foreground">Days of week</legend>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {DAYS_OF_WEEK.map((day) => (
                  <label
                    key={day}
                    className="inline-flex items-center gap-2 text-sm capitalize text-muted-foreground"
                  >
                    <input
                      type="checkbox"
                      checked={selectedDays.includes(day)}
                      onChange={() => toggleDay(day)}
                      disabled={isFormDisabled}
                      className="h-4 w-4 rounded border border-border text-primary focus:ring-primary"
                    />
                    {day.slice(0, 3)}
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm font-medium text-foreground">Enrollment opens *</span>
                <Input
                  type="date"
                  value={enrollmentStart}
                  onChange={(event) => setEnrollmentStart(event.target.value)}
                  required
                  disabled={isFormDisabled}
                />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-medium text-foreground">Enrollment closes *</span>
                <Input
                  type="date"
                  value={enrollmentEnd}
                  onChange={(event) => setEnrollmentEnd(event.target.value)}
                  required
                  disabled={isFormDisabled}
                />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm font-medium text-foreground">Maximum seats *</span>
                <Input
                  type="number"
                  min={1}
                  value={maxEnrollments}
                  onChange={(event) => setMaxEnrollments(event.target.value)}
                  required
                  disabled={isFormDisabled}
                />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-medium text-foreground">Credits cost</span>
                <Input
                  type="number"
                  min={0}
                  value={costCredits}
                  onChange={(event) => setCostCredits(event.target.value)}
                  disabled={isFormDisabled}
                />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm font-medium text-foreground">Room</span>
                <Input
                  value={locationRoom}
                  onChange={(event) => setLocationRoom(event.target.value)}
                  placeholder="Studio 2"
                  disabled={isFormDisabled}
                />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-medium text-foreground">Street address</span>
                <Input
                  value={locationAddress}
                  onChange={(event) => setLocationAddress(event.target.value)}
                  placeholder="123 Learning Way"
                  disabled={isFormDisabled}
                />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <label className="grid gap-2">
                <span className="text-sm font-medium text-foreground">City</span>
                <Input
                  value={locationCity}
                  onChange={(event) => setLocationCity(event.target.value)}
                  placeholder="Seattle"
                  disabled={isFormDisabled}
                />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-medium text-foreground">State</span>
                <Input
                  value={locationState}
                  onChange={(event) => setLocationState(event.target.value)}
                  placeholder="WA"
                  disabled={isFormDisabled}
                />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-medium text-foreground">Postal code</span>
                <Input
                  value={locationPostalCode}
                  onChange={(event) => setLocationPostalCode(event.target.value)}
                  placeholder="98101"
                  disabled={isFormDisabled}
                />
              </label>
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" type="button" disabled={isSubmitting} asChild>
                <Link to="/admin/programs">Cancel</Link>
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !tenantId || (isEditing && !hasHydrated)}
              >
                {isSubmitting
                  ? isEditing
                    ? 'Saving…'
                    : 'Creating…'
                  : isEditing
                    ? 'Save changes'
                    : 'Create program'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

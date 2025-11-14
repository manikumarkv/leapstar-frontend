import { useAuth0 } from '@auth0/auth0-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  Layers,
  Loader2,
  MapPin,
  PencilLine,
  Trash2,
  Users,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
  deleteProgram,
  publishProgram as publishProgramApi,
  unpublishProgram as unpublishProgramApi,
  type ApiProgramSchedule,
  type ApiProgramStatus,
} from '@/api/programs';
import type { BreadcrumbItem } from '@/components/navigation/PageBreadcrumbs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAdminProgram, ADMIN_PROGRAM_QUERY_KEY } from '@/features/admin/hooks/useAdminProgram';
import { ADMIN_PROGRAMS_QUERY_KEY } from '@/features/admin/hooks/useAdminPrograms';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';
import { cn } from '@/lib/utils';

import { AdminLayout } from '../components/AdminLayout';

const statusLabelMap: Record<ApiProgramStatus, string> = {
  draft: 'Draft',
  published: 'Published',
  cancelled: 'Cancelled',
  archived: 'Archived',
};

const statusToneMap: Record<ApiProgramStatus, string> = {
  draft: 'bg-muted text-muted-foreground',
  published: 'bg-emerald-500/10 text-emerald-600',
  cancelled: 'bg-destructive/10 text-destructive',
  archived: 'bg-slate-500/10 text-slate-600',
};

const dayAbbreviations: Record<string, string> = {
  monday: 'Mon',
  tuesday: 'Tue',
  wednesday: 'Wed',
  thursday: 'Thu',
  friday: 'Fri',
  saturday: 'Sat',
  sunday: 'Sun',
};

const formatDate = (value?: string): string => {
  if (!value) {
    return '--';
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return '--';
  }
  return parsed.toLocaleDateString();
};

const formatDateTime = (value?: string): string => {
  if (!value) {
    return '--';
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return '--';
  }
  return `${parsed.toLocaleDateString()} ${parsed.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
};

const formatSchedule = (schedule?: ApiProgramSchedule): string => {
  if (!schedule) {
    return '--';
  }
  const days = (schedule.daysOfWeek ?? []).map((day) => dayAbbreviations[day] ?? day).join(' · ');
  const timeRange = [schedule.startTime, schedule.endTime].filter(Boolean).join(' – ');

  if (days && timeRange) {
    return `${days} · ${timeRange}`;
  }
  if (days) {
    return days;
  }
  if (timeRange) {
    return timeRange;
  }
  return '--';
};

export const AdminProgramDetailPage = (): JSX.Element => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { getAccessTokenSilently } = useAuth0();
  const { data: currentUser } = useCurrentUser();
  const { id: programId } = useParams<{ id: string }>();

  const tenantId = currentUser?.tenant?.id ?? null;

  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Admin portal', href: '/admin' },
    { label: 'Programs', href: '/admin/programs' },
  ];

  const [actionError, setActionError] = useState<string | null>(null);

  const programQuery = useAdminProgram({ tenantId, programId: programId ?? null });
  const { data: program, isLoading, isError, refetch, isFetching } = programQuery;

  const documentTitle = program
    ? `Program • ${program.title}`
    : programId
      ? `Program ${programId}`
      : 'Program overview';

  if (program?.title) {
    breadcrumbs.push({ label: program.title });
  } else if (programId) {
    breadcrumbs.push({ label: `Program ${programId}` });
  } else {
    breadcrumbs.push({ label: 'Program overview' });
  }

  const invalidateProgramQueries = async () => {
    if (!tenantId || !programId) {
      return;
    }
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: [...ADMIN_PROGRAM_QUERY_KEY, tenantId, programId],
      }),
      queryClient.invalidateQueries({ queryKey: [...ADMIN_PROGRAMS_QUERY_KEY, tenantId] }),
    ]);
  };

  const publishMutation = useMutation({
    mutationFn: async () => {
      if (!tenantId || !programId) {
        throw new Error('Tenant context missing');
      }
      const token = await getAccessTokenSilently();
      return publishProgramApi(token, tenantId, programId);
    },
    onSuccess: async () => {
      setActionError(null);
      await invalidateProgramQueries();
    },
    onError: (error: unknown) => {
      setActionError(error instanceof Error ? error.message : 'Unable to publish program.');
    },
  });

  const unpublishMutation = useMutation({
    mutationFn: async () => {
      if (!tenantId || !programId) {
        throw new Error('Tenant context missing');
      }
      const token = await getAccessTokenSilently();
      return unpublishProgramApi(token, tenantId, programId);
    },
    onSuccess: async () => {
      setActionError(null);
      await invalidateProgramQueries();
    },
    onError: (error: unknown) => {
      setActionError(error instanceof Error ? error.message : 'Unable to unpublish program.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!tenantId || !programId) {
        throw new Error('Tenant context missing');
      }
      const token = await getAccessTokenSilently();
      await deleteProgram(token, tenantId, programId);
    },
    onSuccess: async () => {
      setActionError(null);
      if (tenantId) {
        await queryClient.invalidateQueries({
          queryKey: [...ADMIN_PROGRAMS_QUERY_KEY, tenantId],
        });
      }
      navigate('/admin/programs');
    },
    onError: (error: unknown) => {
      setActionError(error instanceof Error ? error.message : 'Unable to delete program.');
    },
  });

  const isMutating =
    publishMutation.isPending || unpublishMutation.isPending || deleteMutation.isPending;

  const actionButtons = useMemo(() => {
    if (!program) {
      return null;
    }
    const buttons: JSX.Element[] = [];

    buttons.push(
      <Button
        key="edit"
        type="button"
        variant="outline"
        disabled={isMutating}
        onClick={() => {
          navigate(`/admin/programs/${program._id}/edit`);
        }}
      >
        <PencilLine className="mr-2 h-4 w-4" />
        Edit
      </Button>,
    );

    if (program.status === 'draft') {
      buttons.push(
        <Button
          key="publish"
          type="button"
          onClick={() => {
            publishMutation.mutate();
          }}
          disabled={publishMutation.isPending || isFetching}
        >
          {publishMutation.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Layers className="mr-2 h-4 w-4" />
          )}
          Publish
        </Button>,
      );
    }

    if (program.status === 'published') {
      buttons.push(
        <Button
          key="unpublish"
          type="button"
          variant="secondary"
          onClick={() => {
            unpublishMutation.mutate();
          }}
          disabled={unpublishMutation.isPending || isFetching}
        >
          {unpublishMutation.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Layers className="mr-2 h-4 w-4" />
          )}
          Unpublish
        </Button>,
      );
    }

    buttons.push(
      <AlertDialog key="delete">
        <AlertDialogTrigger asChild>
          <Button type="button" variant="destructive" disabled={deleteMutation.isPending}>
            {deleteMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="mr-2 h-4 w-4" />
            )}
            Delete
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this program?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. If enrollments exist, the deletion will be blocked and
              no changes will be applied.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                deleteMutation.mutate();
              }}
            >
              Delete program
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>,
    );

    return buttons;
  }, [
    program,
    isMutating,
    publishMutation,
    unpublishMutation,
    deleteMutation,
    navigate,
    isFetching,
  ]);

  const statusBadge = program ? (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium capitalize',
        statusToneMap[program.status],
      )}
    >
      <Layers className="h-3.5 w-3.5" />
      {statusLabelMap[program.status]}
    </span>
  ) : null;

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col gap-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-36 w-full" />
        </div>
      );
    }

    if (isError || !program) {
      return (
        <Card className="border-destructive/40 bg-destructive/10">
          <CardHeader className="gap-2">
            <CardTitle className="flex items-center gap-2 text-destructive">
              Program unavailable
            </CardTitle>
            <CardDescription className="text-destructive">
              We could not load this program. It may have been deleted or you may not have
              permissions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                refetch();
              }}
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="-ml-2 h-8 px-2 text-xs text-muted-foreground"
                onClick={() => navigate('/admin/programs')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to programs
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-semibold text-foreground">{program.title}</h2>
              {statusBadge}
            </div>
            <p className="max-w-2xl text-sm text-muted-foreground">
              {program.summary ||
                program.description ||
                'No summary text has been provided for this program yet.'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">{actionButtons}</div>
        </div>

        {actionError ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            {actionError}
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <Card className="border-border/80">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-foreground">
                Program details
              </CardTitle>
              <CardDescription>
                Core schedule, enrollment capacity, and publication timeline.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 text-sm">
              <div className="grid gap-1">
                <span className="text-xs uppercase text-muted-foreground">Schedule</span>
                <div className="flex items-center gap-2 text-foreground">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{formatSchedule(program.schedule)}</span>
                </div>
              </div>
              <div className="grid gap-1">
                <span className="text-xs uppercase text-muted-foreground">Date range</span>
                <div className="flex items-center gap-2 text-foreground">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {formatDate(program.dateRange?.start)} → {formatDate(program.dateRange?.end)}
                  </span>
                </div>
              </div>
              <div className="grid gap-1">
                <span className="text-xs uppercase text-muted-foreground">Enrollment window</span>
                <div className="flex items-center gap-2 text-foreground">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {formatDate(program.enrollmentWindow?.start)} →{' '}
                    {formatDate(program.enrollmentWindow?.end)}
                  </span>
                </div>
              </div>
              <div className="grid gap-1">
                <span className="text-xs uppercase text-muted-foreground">Maximum seats</span>
                <span className="text-foreground">{program.maxEnrollments.toLocaleString()}</span>
              </div>
              <div className="grid gap-1">
                <span className="text-xs uppercase text-muted-foreground">Credits cost</span>
                <span className="text-foreground">
                  {typeof program.costCredits === 'number' ? program.costCredits : '--'}
                </span>
              </div>
              <div className="grid gap-1">
                <span className="text-xs uppercase text-muted-foreground">Published at</span>
                <span className="text-foreground">{formatDateTime(program.publishedAt)}</span>
              </div>
              <div className="grid gap-1">
                <span className="text-xs uppercase text-muted-foreground">Cancelled at</span>
                <span className="text-foreground">{formatDateTime(program.cancelledAt)}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/80">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-foreground">
                Location & tags
              </CardTitle>
              <CardDescription>
                Where this program meets and its primary classification.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 text-sm">
              <div className="grid gap-1">
                <span className="text-xs uppercase text-muted-foreground">Location</span>
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div className="space-y-1 text-foreground">
                    {program.location?.room ? <div>{program.location.room}</div> : null}
                    {program.location?.address ? (
                      <div className="text-sm text-muted-foreground">
                        {[program.location.address.line1, program.location.address.line2]
                          .filter(Boolean)
                          .join(', ')}
                        <br />
                        {[program.location.address.city, program.location.address.state]
                          .filter(Boolean)
                          .join(', ')}
                        {program.location.address.postalCode
                          ? ` ${program.location.address.postalCode}`
                          : ''}
                        {program.location.address.country ? (
                          <>
                            <br />
                            {program.location.address.country}
                          </>
                        ) : null}
                      </div>
                    ) : (
                      <div className="text-muted-foreground">No location details provided.</div>
                    )}
                  </div>
                </div>
              </div>
              <div className="grid gap-1">
                <span className="text-xs uppercase text-muted-foreground">Tags</span>
                {program.tags?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {program.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-muted-foreground">No tags have been added.</span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/80">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-foreground">Description</CardTitle>
            <CardDescription>Provide context, expectations, and learning goals.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm text-foreground">
              {program.description || 'No description has been provided.'}
            </p>
          </CardContent>
        </Card>

        {program.metadata && Object.keys(program.metadata).length ? (
          <Card className="border-border/80">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-foreground">Metadata</CardTitle>
              <CardDescription>
                Structured values provided by integrations or admins.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="overflow-auto rounded-md bg-muted p-4 text-xs text-muted-foreground">
                {JSON.stringify(program.metadata, null, 2)}
              </pre>
            </CardContent>
          </Card>
        ) : null}
      </div>
    );
  };

  return (
    <AdminLayout
      title="Program overview"
      description="Inspect curriculum, track progress, and curate session details for this program."
      breadcrumbs={breadcrumbs}
      documentTitle={documentTitle}
    >
      {renderContent()}
    </AdminLayout>
  );
};

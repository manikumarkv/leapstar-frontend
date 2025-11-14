import { AlertCircle, CalendarDays, Clock, Layers, Users } from 'lucide-react';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';

import type { ApiProgram, ApiProgramSchedule, ApiProgramStatus } from '@/api/programs';
import type { BreadcrumbItem } from '@/components/navigation/PageBreadcrumbs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAdminPrograms } from '@/features/admin/hooks/useAdminPrograms';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';
import { cn } from '@/lib/utils';

import { AdminLayout } from '../components/AdminLayout';

const breadcrumbs: BreadcrumbItem[] = [
  { label: 'Admin portal', href: '/admin' },
  { label: 'Programs' },
];

type ProgramRow = {
  id: string;
  title: string;
  summary?: string;
  status: ApiProgramStatus;
  statusLabel: string;
  statusTone: string;
  schedule: string;
  duration: string;
  seats: number;
  costCredits?: number;
};

const statusToneMap: Record<ApiProgramStatus, string> = {
  draft: 'bg-muted text-muted-foreground',
  published: 'bg-emerald-500/10 text-emerald-600',
  cancelled: 'bg-destructive/10 text-destructive',
  archived: 'bg-slate-500/10 text-slate-600',
};

const statusLabelMap: Record<ApiProgramStatus, string> = {
  draft: 'Draft',
  published: 'Published',
  cancelled: 'Cancelled',
  archived: 'Archived',
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
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '--';
  }
  return date.toLocaleDateString();
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

const toProgramRows = (programs: ApiProgram[] | undefined): ProgramRow[] => {
  if (!programs?.length) {
    return [];
  }
  return programs.map((program) => ({
    id: program._id,
    title: program.title,
    summary: program.summary ?? program.description,
    status: program.status,
    statusLabel: statusLabelMap[program.status],
    statusTone: statusToneMap[program.status],
    schedule: formatSchedule(program.schedule),
    duration: `${formatDate(program.dateRange?.start)} → ${formatDate(program.dateRange?.end)}`,
    seats: program.maxEnrollments,
    costCredits: program.costCredits,
  }));
};

export const AdminProgramsPage = (): JSX.Element => {
  const { data: currentUser, isLoading: isCurrentUserLoading } = useCurrentUser();
  const tenantId = currentUser?.tenant?.id ?? null;
  const tenantName = currentUser?.tenant?.name ?? 'Current tenant';

  const programsQuery = useAdminPrograms({ tenantId });
  const { data: apiPrograms, isLoading, isFetching, isError, refetch } = programsQuery;

  const showSkeleton =
    isCurrentUserLoading || isLoading || (isFetching && (!apiPrograms || apiPrograms.length === 0));

  const programRows = useMemo(() => toProgramRows(apiPrograms), [apiPrograms]);

  const showEmptyState = !showSkeleton && !isError && programRows.length === 0;
  const skeletonRows = useMemo(() => Array.from({ length: 6 }, (_value, index) => index), []);

  return (
    <AdminLayout
      title="Programs"
      description="Review schedules, enrollment caps, and publish-ready offerings for your tenant."
      breadcrumbs={breadcrumbs}
      documentTitle="Admin Programs"
    >
      <div className="flex flex-col gap-8">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-foreground">Program catalog</h2>
            <p className="text-sm text-muted-foreground">
              {tenantName}: monitor live offerings, draft concepts, and archived sessions in a
              single view.
            </p>
          </div>
          <Button asChild>
            <Link to="/admin/programs/create">Create program</Link>
          </Button>
        </header>

        <Card className="border-border/80">
          <CardHeader className="gap-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Layers className="h-4 w-4" />
              Programs
            </div>
            <CardDescription>
              Track publication status, timelines, and seat availability.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isError ? (
              <div className="flex flex-col gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  <span>We could not load the programs. Please try again.</span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    refetch();
                  }}
                >
                  Retry
                </Button>
              </div>
            ) : null}

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border text-sm">
                <thead>
                  <tr className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Program</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Schedule</th>
                    <th className="px-4 py-3 font-medium">Duration</th>
                    <th className="px-4 py-3 font-medium">Seats</th>
                    <th className="px-4 py-3 font-medium">Credits</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {showSkeleton ? (
                    skeletonRows.map((row) => (
                      <tr key={`program-skeleton-${row}`} className="bg-background">
                        <td className="px-4 py-4">
                          <Skeleton className="h-5 w-48" />
                          <Skeleton className="mt-2 h-4 w-64" />
                        </td>
                        <td className="px-4 py-4">
                          <Skeleton className="h-5 w-20" />
                        </td>
                        <td className="px-4 py-4">
                          <Skeleton className="h-5 w-36" />
                        </td>
                        <td className="px-4 py-4">
                          <Skeleton className="h-5 w-32" />
                        </td>
                        <td className="px-4 py-4">
                          <Skeleton className="h-5 w-12" />
                        </td>
                        <td className="px-4 py-4">
                          <Skeleton className="h-5 w-12" />
                        </td>
                      </tr>
                    ))
                  ) : showEmptyState ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-10 text-center text-sm text-muted-foreground"
                      >
                        No programs are available yet. Publish a program to see it listed here.
                      </td>
                    </tr>
                  ) : (
                    programRows.map((program) => (
                      <tr key={program.id} className="bg-background">
                        <td className="px-4 py-3 align-top">
                          <Link
                            to={`/admin/programs/${program.id}`}
                            className="inline-flex flex-col gap-1 text-left"
                          >
                            <span className="font-medium text-foreground hover:text-primary">
                              {program.title}
                            </span>
                            {program.summary ? (
                              <span className="text-xs text-muted-foreground line-clamp-2">
                                {program.summary}
                              </span>
                            ) : null}
                          </Link>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium capitalize',
                              program.statusTone,
                            )}
                          >
                            <Layers className="h-3.5 w-3.5" />
                            {program.statusLabel}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{program.schedule}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <CalendarDays className="h-4 w-4 text-muted-foreground" />
                            <span>{program.duration}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>{program.seats.toLocaleString()}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {typeof program.costCredits === 'number' ? program.costCredits : '--'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

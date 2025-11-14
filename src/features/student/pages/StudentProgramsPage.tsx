import { AlertCircle } from 'lucide-react';
import { useMemo } from 'react';

import type { ApiProgram, ApiProgramDateRange, ApiProgramSchedule } from '@/api/programs';
import type { BreadcrumbItem } from '@/components/navigation/PageBreadcrumbs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';
import { StudentLayout } from '@/features/student/components/StudentLayout';
import {
  StudentProgramCard,
  StudentProgramCardSkeleton,
  type StudentProgramCardData,
} from '@/features/student/components/StudentProgramCard';
import { useStudentPrograms } from '@/features/student/hooks/useStudentPrograms';

const breadcrumbs: BreadcrumbItem[] = [
  { label: 'Student portal', href: '/student' },
  { label: 'Programs' },
];

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

const parseDate = (value?: string): Date | null => {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

type EnrollmentStatus = 'enrolled' | 'waitlisted' | 'pending';

const isEnrollmentStatus = (value: unknown): value is EnrollmentStatus => {
  if (typeof value !== 'string') {
    return false;
  }
  return value === 'enrolled' || value === 'waitlisted' || value === 'pending';
};

type StudentProgramMetadata = {
  enrollmentCount?: number;
  studentEnrollmentStatus?: EnrollmentStatus;
};

const extractStudentProgramMetadata = (program: ApiProgram): StudentProgramMetadata => {
  const raw = program.metadata;
  if (!raw || typeof raw !== 'object') {
    return {};
  }

  const candidate = raw as Record<string, unknown>;
  const enrollmentCountValue = candidate.enrollmentCount;
  const statusValue = candidate.studentEnrollmentStatus;

  const metadata: StudentProgramMetadata = {};

  if (isFiniteNumber(enrollmentCountValue) && enrollmentCountValue >= 0) {
    metadata.enrollmentCount = enrollmentCountValue;
  }

  if (isEnrollmentStatus(statusValue)) {
    metadata.studentEnrollmentStatus = statusValue;
  }

  return metadata;
};

const toDateLabel = (value?: string): string | null => {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return dateFormatter.format(date);
};

const formatDateRange = (range?: ApiProgramDateRange): string => {
  if (!range) {
    return 'Date to be announced';
  }
  const start = toDateLabel(range.start);
  const end = toDateLabel(range.end);
  if (start && end) {
    return `${start} – ${end}`;
  }
  if (start) {
    return start;
  }
  if (end) {
    return end;
  }
  return 'Date to be announced';
};

const formatTimeLabel = (schedule?: ApiProgramSchedule): string => {
  if (!schedule) {
    return 'Time to be announced';
  }

  const timeRange = [schedule.startTime, schedule.endTime].filter(Boolean).join(' – ');
  if (timeRange) {
    return timeRange;
  }

  return 'Time to be announced';
};

const formatLocation = (program: ApiProgram): string => {
  const { location } = program;
  if (!location) {
    return 'Location to be announced';
  }

  const parts: string[] = [];
  if (location.room) {
    parts.push(location.room);
  }

  if (location.address) {
    const { line1, line2, city, state, postalCode, country } = location.address;
    const street = [line1, line2].filter(Boolean).join(', ');
    const cityState = [city, state].filter(Boolean).join(', ');
    const postalCountry = [postalCode, country].filter(Boolean).join(' ');
    const addressSections = [street, cityState, postalCountry].filter(Boolean).join(' · ');
    if (addressSections) {
      parts.push(addressSections);
    }
  }

  return parts.length ? parts.join(' · ') : 'Location to be announced';
};

const formatPointsLabel = (costCredits?: number): string => {
  if (typeof costCredits === 'number') {
    if (costCredits > 0) {
      return `${costCredits.toLocaleString()} points`;
    }
    return 'Included';
  }
  return 'Included';
};

const formatEnrollmentLabel = (program: ApiProgram, metadata: StudentProgramMetadata): string => {
  if (typeof metadata.enrollmentCount === 'number') {
    return `${metadata.enrollmentCount.toLocaleString()} / ${program.maxEnrollments.toLocaleString()} enrolled`;
  }
  return `${program.maxEnrollments.toLocaleString()} seats available`;
};

const describeEnrollmentState = (
  program: ApiProgram,
  metadata: StudentProgramMetadata,
): Pick<StudentProgramCardData, 'statusPill' | 'actionLabel' | 'actionDisabled'> => {
  if (metadata.studentEnrollmentStatus === 'enrolled') {
    return {
      statusPill: { label: 'Enrolled', tone: 'success' },
      actionLabel: 'Already enrolled',
      actionDisabled: true,
    };
  }

  if (metadata.studentEnrollmentStatus === 'waitlisted') {
    return {
      statusPill: { label: 'Waitlisted', tone: 'warning' },
      actionLabel: 'View status',
      actionDisabled: false,
    };
  }

  if (metadata.studentEnrollmentStatus === 'pending') {
    return {
      statusPill: { label: 'Pending', tone: 'neutral' },
      actionLabel: 'View status',
      actionDisabled: false,
    };
  }

  if (program.status === 'cancelled') {
    return {
      statusPill: { label: 'Cancelled', tone: 'warning' },
      actionLabel: 'Unavailable',
      actionDisabled: true,
    };
  }

  if (program.status === 'archived') {
    return {
      statusPill: { label: 'Archived', tone: 'neutral' },
      actionLabel: 'Unavailable',
      actionDisabled: true,
    };
  }

  const now = new Date();
  const startDate = parseDate(program.enrollmentWindow?.start);
  const endDate = parseDate(program.enrollmentWindow?.end);

  if (startDate && now < startDate) {
    const opensLabel = toDateLabel(program.enrollmentWindow?.start);
    return {
      statusPill: { label: 'Opens soon', tone: 'primary' },
      actionLabel: opensLabel ? `Opens ${opensLabel}` : 'Opens soon',
      actionDisabled: true,
    };
  }

  if (endDate && now > endDate) {
    const closedLabel = toDateLabel(program.enrollmentWindow?.end);
    return {
      statusPill: { label: 'Closed', tone: 'neutral' },
      actionLabel: closedLabel ? `Closed ${closedLabel}` : 'Enrollment closed',
      actionDisabled: true,
    };
  }

  return {
    statusPill: null,
    actionLabel: 'Enroll now',
    actionDisabled: false,
  };
};

const toStudentProgramCards = (programs: ApiProgram[] | undefined): StudentProgramCardData[] => {
  if (!programs?.length) {
    return [];
  }

  return programs.map((program) => {
    const metadata = extractStudentProgramMetadata(program);
    const enrollmentState = describeEnrollmentState(program, metadata);

    return {
      id: program._id,
      title: program.title,
      summary:
        program.summary?.trim() ||
        program.description?.trim() ||
        'Program details will be shared soon. Check back for the full overview.',
      dateLabel: formatDateRange(program.dateRange),
      timeLabel: formatTimeLabel(program.schedule),
      locationLabel: formatLocation(program),
      enrollmentLabel: formatEnrollmentLabel(program, metadata),
      pointsLabel: formatPointsLabel(program.costCredits),
      actionLabel: enrollmentState.actionLabel,
      actionDisabled: enrollmentState.actionDisabled,
      statusPill: enrollmentState.statusPill,
    } satisfies StudentProgramCardData;
  });
};

export const StudentProgramsPage = (): JSX.Element => {
  const { data: currentUser, isLoading: isCurrentUserLoading } = useCurrentUser();
  const tenantId = currentUser?.tenant?.id ?? null;
  const tenantName = currentUser?.tenant?.name ?? 'your organization';

  const programsQuery = useStudentPrograms({ tenantId, status: 'published' });
  const { data: apiPrograms, isLoading, isFetching, isError, refetch } = programsQuery;

  const showSkeleton =
    isCurrentUserLoading || isLoading || (isFetching && (!apiPrograms || apiPrograms.length === 0));

  const skeletonItems = useMemo(() => Array.from({ length: 4 }, (_, index) => index), []);
  const programCards = useMemo(() => toStudentProgramCards(apiPrograms), [apiPrograms]);

  const showEmptyState = !showSkeleton && !isError && programCards.length === 0;

  return (
    <StudentLayout
      title="Available classes"
      description="Browse and enroll in upcoming classes tailored to your learning goals."
      breadcrumbs={breadcrumbs}
      documentTitle="Student Programs"
    >
      <div className="flex flex-col gap-8">
        <section className="rounded-3xl border border-border/60 bg-gradient-to-br from-card/85 via-background/80 to-background/60 p-6 shadow-lg">
          <h2 className="text-lg font-semibold">Featured programs</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Browse curated recommendations, compare program details, and bookmark options to explore
            later. Programs that are published in your tenant will show up here automatically.
          </p>
          <div className="mt-4 flex flex-wrap gap-6 text-sm">
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-wide text-muted-foreground">
                Published programs
              </span>
              {showSkeleton ? (
                <Skeleton className="mt-1 h-6 w-12" />
              ) : (
                <span className="mt-1 text-xl font-semibold text-foreground">
                  {programCards.length}
                </span>
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-wide text-muted-foreground">
                Organization
              </span>
              {isCurrentUserLoading ? (
                <Skeleton className="mt-1 h-5 w-32" />
              ) : (
                <span className="mt-1 text-base font-medium text-foreground">{tenantName}</span>
              )}
            </div>
          </div>
        </section>

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

        {showSkeleton ? (
          <div className="grid gap-6 lg:grid-cols-2">
            {skeletonItems.map((item) => (
              <StudentProgramCardSkeleton key={`student-program-skeleton-${item}`} />
            ))}
          </div>
        ) : showEmptyState ? (
          <div className="rounded-xl border border-border bg-background p-8 text-center text-sm text-muted-foreground">
            No programs are available right now. Check back soon for new opportunities.
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {programCards.map((program) => (
              <StudentProgramCard key={program.id} program={program} />
            ))}
          </div>
        )}
      </div>
    </StudentLayout>
  );
};

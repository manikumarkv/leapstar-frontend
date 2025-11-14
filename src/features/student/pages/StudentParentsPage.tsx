import { AlertCircle } from 'lucide-react';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import type { BreadcrumbItem } from '@/components/navigation/PageBreadcrumbs';
import { Button } from '@/components/ui/button';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';
import { StudentLayout } from '@/features/student/components/StudentLayout';
import {
  StudentParentCard,
  StudentParentCardSkeleton,
} from '@/features/student/components/StudentParentCard';
import { useStudentParents } from '@/features/student/hooks/useStudentParents';

const breadcrumbs: BreadcrumbItem[] = [
  { label: 'Student portal', href: '/student' },
  { label: 'Parents' },
];

export const StudentParentsPage = (): JSX.Element => {
  const { data: currentUser, isLoading: isCurrentUserLoading } = useCurrentUser();
  const tenantId = currentUser?.tenant?.id ?? null;
  const navigate = useNavigate();

  const parentQuery = useStudentParents({ tenantId });
  const parentData = parentQuery.data ?? [];

  const isLoading =
    isCurrentUserLoading ||
    parentQuery.isLoading ||
    (parentQuery.isFetching && parentData.length === 0);

  const showEmptyState = !isLoading && !parentQuery.isError && parentData.length === 0;
  const skeletonItems = useMemo(() => Array.from({ length: 2 }, (_, index) => index), []);

  return (
    <StudentLayout
      title="My Parents"
      description="Parent and guardian information"
      breadcrumbs={breadcrumbs}
      documentTitle="Student Parents"
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-background/80 p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-foreground">Invite a parent</h2>
            <p className="text-sm text-muted-foreground">
              Send an invitation to a trusted adult so they can stay connected to your progress.
            </p>
          </div>
          <Button
            type="button"
            className="self-start sm:self-auto"
            onClick={() => {
              navigate('/student/parents/add');
            }}
          >
            Add parent
          </Button>
        </div>

        {parentQuery.isError ? (
          <div className="flex flex-col gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span>We couldn&apos;t load your parents right now. Please try again.</span>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                parentQuery.refetch();
              }}
            >
              Retry
            </Button>
          </div>
        ) : null}

        {isLoading ? (
          <div className="grid gap-6">
            {skeletonItems.map((item) => (
              <StudentParentCardSkeleton key={`student-parent-skeleton-${item}`} />
            ))}
          </div>
        ) : showEmptyState ? (
          <div className="rounded-xl border border-border/60 bg-background/80 p-8 text-center text-sm text-muted-foreground">
            You haven&apos;t connected any parents or guardians yet. Use the invite option to add
            trusted adults to your account.
          </div>
        ) : (
          <div className="grid gap-6">
            {parentData.map((parent) => {
              const email = parent.email && parent.email.trim().length ? parent.email : undefined;
              const phone = parent.phone && parent.phone.trim().length ? parent.phone : undefined;
              const name = parent.displayName || 'Parent / Guardian';

              return (
                <StudentParentCard
                  key={parent.id}
                  name={name}
                  relationship="Parent/Guardian"
                  email={email}
                  phone={phone}
                />
              );
            })}
          </div>
        )}
      </div>
    </StudentLayout>
  );
};

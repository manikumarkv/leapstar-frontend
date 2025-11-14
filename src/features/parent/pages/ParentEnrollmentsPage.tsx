import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { ParentLayout } from '@/features/parent/components/ParentLayout';

const breadcrumbs = [{ label: 'Parent dashboard', href: '/parent' }, { label: 'Enrollments' }];

const demoEnrollments = [
  { id: 'enr-301', learner: 'Taylor', program: 'STEM Explorers', status: 'Pending documents' },
  { id: 'enr-404', learner: 'Jordan', program: 'Creative Writing Lab', status: 'Approved' },
];

export const ParentEnrollmentsPage = (): JSX.Element => {
  return (
    <ParentLayout
      title="Family enrollments"
      description="Monitor each learner’s status, submit documents, and review upcoming milestones."
      breadcrumbs={breadcrumbs}
      documentTitle="Parent Enrollments"
    >
      <div className="space-y-4">
        {demoEnrollments.map((enrollment) => (
          <div
            key={enrollment.id}
            className="flex flex-col gap-3 rounded-lg border border-border bg-background/80 p-5 shadow-sm md:flex-row md:items-center md:justify-between"
          >
            <div>
              <h2 className="text-lg font-semibold">{enrollment.program}</h2>
              <p className="text-sm text-muted-foreground">
                {enrollment.learner} • Status: {enrollment.status}
              </p>
            </div>
            <Button asChild variant="secondary">
              <Link to={`/parent/enrollments/${enrollment.id}`}>View details</Link>
            </Button>
          </div>
        ))}
      </div>
    </ParentLayout>
  );
};

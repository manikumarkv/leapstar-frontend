import { Link } from 'react-router-dom';

import type { BreadcrumbItem } from '@/components/navigation/PageBreadcrumbs';
import { Button } from '@/components/ui/button';
import { StudentLayout } from '@/features/student/components/StudentLayout';

const breadcrumbs: BreadcrumbItem[] = [
  { label: 'Student portal', href: '/student' },
  { label: 'Enrollments' },
];

const demoEnrollments = [
  { id: 'enr-101', name: 'STEM Explorers', status: 'Active' },
  { id: 'enr-202', name: 'Creative Writing Lab', status: 'Waitlisted' },
];

export const StudentEnrollmentsPage = (): JSX.Element => {
  return (
    <StudentLayout
      title="My enrollments"
      description="Review your active and past enrollments, plus any actions needed to stay on track."
      breadcrumbs={breadcrumbs}
      documentTitle="Student Enrollments"
    >
      <div className="space-y-4">
        {demoEnrollments.map((enrollment) => (
          <div
            key={enrollment.id}
            className="flex flex-col gap-3 rounded-lg border border-border bg-background/80 p-5 shadow-sm md:flex-row md:items-center md:justify-between"
          >
            <div>
              <h2 className="text-lg font-semibold">{enrollment.name}</h2>
              <p className="text-sm text-muted-foreground">Status: {enrollment.status}</p>
            </div>
            <Button asChild variant="secondary">
              <Link to={`/student/enrollments/${enrollment.id}`}>View details</Link>
            </Button>
          </div>
        ))}
      </div>
    </StudentLayout>
  );
};

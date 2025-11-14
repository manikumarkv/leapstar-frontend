import type { BreadcrumbItem } from '@/components/navigation/PageBreadcrumbs';
import { StudentLayout } from '@/features/student/components/StudentLayout';

const breadcrumbs: BreadcrumbItem[] = [
  { label: 'Student portal', href: '/student' },
  { label: 'Schedule' },
];

export const StudentSchedulePage = (): JSX.Element => {
  return (
    <StudentLayout
      title="Schedule"
      description="Plan ahead with a consolidated view of your classes, assignments, and reminders."
      breadcrumbs={breadcrumbs}
      documentTitle="Student Schedule"
    >
      <div className="rounded-lg border border-border bg-background/80 p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Calendar preview</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Your upcoming sessions and important deadlines will surface here once scheduling is
          connected.
        </p>
      </div>
    </StudentLayout>
  );
};

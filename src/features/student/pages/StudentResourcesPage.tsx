import type { BreadcrumbItem } from '@/components/navigation/PageBreadcrumbs';
import { StudentLayout } from '@/features/student/components/StudentLayout';

const breadcrumbs: BreadcrumbItem[] = [
  { label: 'Student portal', href: '/student' },
  { label: 'Resources' },
];

export const StudentResourcesPage = (): JSX.Element => {
  return (
    <StudentLayout
      title="Resources"
      description="Access guides, recordings, and practice materials that support your learning."
      breadcrumbs={breadcrumbs}
      documentTitle="Student Resources"
    >
      <div className="rounded-lg border border-border bg-background/80 p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Resource hub</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Once available, files and links shared by your coaches will be organized here for easy
          access.
        </p>
      </div>
    </StudentLayout>
  );
};

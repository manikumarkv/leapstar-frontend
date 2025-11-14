import type { BreadcrumbItem } from '@/components/navigation/PageBreadcrumbs';
import { StudentLayout } from '@/features/student/components/StudentLayout';

const breadcrumbs: BreadcrumbItem[] = [
  { label: 'Student portal', href: '/student' },
  { label: 'Support' },
];

export const StudentSupportPage = (): JSX.Element => {
  return (
    <StudentLayout
      title="Support"
      description="Get help from your program team, submit questions, and review responses."
      breadcrumbs={breadcrumbs}
      documentTitle="Student Support"
    >
      <div className="rounded-lg border border-border bg-background/80 p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Need assistance?</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This area will collect knowledge base articles, direct support contacts, and your open
          requests.
        </p>
      </div>
    </StudentLayout>
  );
};

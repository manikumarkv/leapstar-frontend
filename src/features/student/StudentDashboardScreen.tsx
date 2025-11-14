import { BookOpen, CalendarDays, MessageSquare } from 'lucide-react';

import type { BreadcrumbItem } from '@/components/navigation/PageBreadcrumbs';
import { StudentLayout } from '@/features/student/components/StudentLayout';

const quickActions = [
  {
    icon: BookOpen,
    title: 'Explore programs',
    description: 'Browse upcoming offerings and reserve your spot before seats fill up.',
  },
  {
    icon: CalendarDays,
    title: 'Check your schedule',
    description: 'Stay on top of class times, locations, and important deadlines.',
  },
  {
    icon: MessageSquare,
    title: 'Connect with coaches',
    description: 'Send questions, request feedback, and collaborate with your mentors.',
  },
];

const breadcrumbs: BreadcrumbItem[] = [
  { label: 'Student portal', href: '/student' },
  { label: 'Dashboard' },
];

export const StudentDashboardScreen = (): JSX.Element => {
  return (
    <StudentLayout
      title="Student dashboard"
      description="Track your progress, manage enrollments, and access resources tailored to your learning goals."
      breadcrumbs={breadcrumbs}
      documentTitle="Student Dashboard"
    >
      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-background/80 p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Next up</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            We&apos;ll highlight your upcoming sessions, assignments, and important reminders right
            here.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-background/80 p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Recent activity</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Keep tabs on completed lessons, submitted work, and coach feedback as it arrives.
          </p>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-base font-semibold text-muted-foreground">Quick actions</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {quickActions.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-xl border border-border bg-background/80 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-sm font-semibold">{title}</h3>
              <p className="mt-2 text-xs text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>
      </section>
    </StudentLayout>
  );
};

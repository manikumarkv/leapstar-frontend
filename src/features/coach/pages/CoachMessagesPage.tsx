import type { BreadcrumbItem } from '@/components/navigation/PageBreadcrumbs';
import { CoachLayout } from '@/features/coach/components/CoachLayout';

const breadcrumbs: BreadcrumbItem[] = [
  { label: 'Coach portal', href: '/coach' },
  { label: 'Messages' },
];

export const CoachMessagesPage = (): JSX.Element => {
  return (
    <CoachLayout
      title="Messages"
      description="Coordinate with students, families, and staff through a streamlined inbox."
      breadcrumbs={breadcrumbs}
      documentTitle="Coach Messages"
    >
      <div className="rounded-lg border border-border bg-background/80 p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Unified inbox</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Conversation history, announcements, and follow-up reminders will be available here to
          keep everyone aligned.
        </p>
      </div>
    </CoachLayout>
  );
};

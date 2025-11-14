import type { BreadcrumbItem } from '@/components/navigation/PageBreadcrumbs';

import { AdminEmptyState } from '../components/AdminEmptyState';
import { AdminLayout } from '../components/AdminLayout';

const breadcrumbs: BreadcrumbItem[] = [
  { label: 'Admin portal', href: '/admin' },
  { label: 'Coaches' },
];

export const AdminCoachesPage = (): JSX.Element => {
  return (
    <AdminLayout
      title="Coaches"
      description="Recruit, onboard, and assign coaches to upcoming programs."
      breadcrumbs={breadcrumbs}
      documentTitle="Admin Coaches"
    >
      <AdminEmptyState
        title="Coach roster"
        description="Search for coaches, adjust assignments, and manage availability."
      />
    </AdminLayout>
  );
};

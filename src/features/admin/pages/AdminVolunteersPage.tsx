import type { BreadcrumbItem } from '@/components/navigation/PageBreadcrumbs';

import { AdminEmptyState } from '../components/AdminEmptyState';
import { AdminLayout } from '../components/AdminLayout';

const breadcrumbs: BreadcrumbItem[] = [
  { label: 'Admin portal', href: '/admin' },
  { label: 'Volunteers' },
];

export const AdminVolunteersPage = (): JSX.Element => {
  return (
    <AdminLayout
      title="Volunteers"
      description="Coordinate volunteer engagement and celebrate community impact."
      breadcrumbs={breadcrumbs}
      documentTitle="Admin Volunteers"
    >
      <AdminEmptyState
        title="Volunteer roster"
        description="Track volunteer availability, onboarding, and assigned events."
      />
    </AdminLayout>
  );
};

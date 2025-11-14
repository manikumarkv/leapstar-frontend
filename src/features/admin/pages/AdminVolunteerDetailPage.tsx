import { useParams } from 'react-router-dom';

import type { BreadcrumbItem } from '@/components/navigation/PageBreadcrumbs';

import { AdminEmptyState } from '../components/AdminEmptyState';
import { AdminLayout } from '../components/AdminLayout';

export const AdminVolunteerDetailPage = (): JSX.Element => {
  const { id } = useParams<{ id: string }>();

  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Admin portal', href: '/admin' },
    { label: 'Volunteers', href: '/admin/volunteers' },
    { label: id ? `Volunteer ${id}` : 'Volunteer profile' },
  ];

  return (
    <AdminLayout
      title="Volunteer profile"
      description="View background checks, event history, and performance notes."
      breadcrumbs={breadcrumbs}
      documentTitle={id ? `Admin Volunteer ${id}` : 'Admin Volunteer Profile'}
    >
      <AdminEmptyState
        title={`Volunteer ID: ${id ?? 'unknown'}`}
        description="Assignments, hours logged, and impact stories will populate this view."
      />
    </AdminLayout>
  );
};

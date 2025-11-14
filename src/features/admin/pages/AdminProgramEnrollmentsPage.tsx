import { useParams } from 'react-router-dom';

import type { BreadcrumbItem } from '@/components/navigation/PageBreadcrumbs';

import { AdminEmptyState } from '../components/AdminEmptyState';
import { AdminLayout } from '../components/AdminLayout';

export const AdminProgramEnrollmentsPage = (): JSX.Element => {
  const { id } = useParams<{ id: string }>();

  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Admin portal', href: '/admin' },
    { label: 'Programs', href: '/admin/programs' },
    { label: id ? `Program ${id}` : 'Program enrollments' },
    { label: 'Enrollments' },
  ];

  return (
    <AdminLayout
      title="Program enrollments"
      description="Review enrollment activity, approve requests, and monitor capacity in real time."
      breadcrumbs={breadcrumbs}
      documentTitle={id ? `Admin Program ${id} Enrollments` : 'Admin Program Enrollments'}
    >
      <AdminEmptyState
        title={`Enrollment list for program ID: ${id ?? 'unknown'}`}
        description="Enrollment requests, rosters, and waitlists will surface in this screen."
      />
    </AdminLayout>
  );
};

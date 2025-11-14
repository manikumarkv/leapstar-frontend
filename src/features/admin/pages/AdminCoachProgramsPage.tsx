import { useParams } from 'react-router-dom';

import type { BreadcrumbItem } from '@/components/navigation/PageBreadcrumbs';

import { AdminEmptyState } from '../components/AdminEmptyState';
import { AdminLayout } from '../components/AdminLayout';

export const AdminCoachProgramsPage = (): JSX.Element => {
  const { id } = useParams<{ id: string }>();

  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Admin portal', href: '/admin' },
    { label: 'Coaches', href: '/admin/coaches' },
    { label: id ? `Coach ${id}` : 'Coach assignments' },
    { label: 'Assignments' },
  ];

  return (
    <AdminLayout
      title="Coach assignments"
      description="See which programs this coach supports and adjust workloads as needed."
      breadcrumbs={breadcrumbs}
      documentTitle={id ? `Admin Coach ${id} Assignments` : 'Admin Coach Assignments'}
    >
      <AdminEmptyState
        title={`Programs for coach ID: ${id ?? 'unknown'}`}
        description="Allocation charts, availability insights, and scheduling tools will live here."
      />
    </AdminLayout>
  );
};

import { useParams } from 'react-router-dom';

import type { BreadcrumbItem } from '@/components/navigation/PageBreadcrumbs';

import { AdminEmptyState } from '../components/AdminEmptyState';
import { AdminLayout } from '../components/AdminLayout';

export const AdminCoachDetailPage = (): JSX.Element => {
  const { id } = useParams<{ id: string }>();

  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Admin portal', href: '/admin' },
    { label: 'Coaches', href: '/admin/coaches' },
    { label: id ? `Coach ${id}` : 'Coach profile' },
  ];

  return (
    <AdminLayout
      title="Coach profile"
      description="Review credentials, track performance, and manage assignments."
      breadcrumbs={breadcrumbs}
      documentTitle={id ? `Admin Coach ${id}` : 'Admin Coach Profile'}
    >
      <AdminEmptyState
        title={`Coach ID: ${id ?? 'unknown'}`}
        description="Upcoming sessions, certifications, and feedback will appear on this page."
      />
    </AdminLayout>
  );
};

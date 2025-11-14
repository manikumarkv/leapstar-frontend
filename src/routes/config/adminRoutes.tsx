import type { ComponentType } from 'react';

import { AdminAppSettingsPage } from '@/features/admin/pages/AdminAppSettingsPage';
import { AdminCoachDetailPage } from '@/features/admin/pages/AdminCoachDetailPage';
import { AdminCoachesPage } from '@/features/admin/pages/AdminCoachesPage';
import { AdminCoachProgramsPage } from '@/features/admin/pages/AdminCoachProgramsPage';
import { AdminDashboardPage } from '@/features/admin/pages/AdminDashboardPage';
import { AdminPaymentsPage } from '@/features/admin/pages/AdminPaymentsPage';
import { AdminProgramCreatePage } from '@/features/admin/pages/AdminProgramCreatePage';
import { AdminProgramDetailPage } from '@/features/admin/pages/AdminProgramDetailPage';
import { AdminProgramEnrollmentsPage } from '@/features/admin/pages/AdminProgramEnrollmentsPage';
import { AdminProgramsPage } from '@/features/admin/pages/AdminProgramsPage';
import { AdminRoleDetailPage } from '@/features/admin/pages/AdminRoleDetailPage';
import { AdminRolesPage } from '@/features/admin/pages/AdminRolesPage';
import { AdminSettingsPage } from '@/features/admin/pages/AdminSettingsPage';
import { AdminTenantAppearancePage } from '@/features/admin/pages/AdminTenantAppearancePage';
import { AdminUserCreatePage } from '@/features/admin/pages/AdminUserCreatePage';
import { AdminUserDetailPage } from '@/features/admin/pages/AdminUserDetailPage';
import { AdminUsersPage } from '@/features/admin/pages/AdminUsersPage';
import { AdminVolunteerDetailPage } from '@/features/admin/pages/AdminVolunteerDetailPage';
import { AdminVolunteersPage } from '@/features/admin/pages/AdminVolunteersPage';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';

import type { AppRoute } from './types';

const withAdminAccess = (Component: ComponentType): JSX.Element => {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <Component />
    </ProtectedRoute>
  );
};

export const adminRoutes: AppRoute[] = [
  { path: '/admin', element: withAdminAccess(AdminDashboardPage) },
  { path: '/admin/programs', element: withAdminAccess(AdminProgramsPage) },
  { path: '/admin/programs/create', element: withAdminAccess(AdminProgramCreatePage) },
  { path: '/admin/programs/:id/edit', element: withAdminAccess(AdminProgramCreatePage) },
  { path: '/admin/programs/:id', element: withAdminAccess(AdminProgramDetailPage) },
  {
    path: '/admin/programs/:id/enrollments',
    element: withAdminAccess(AdminProgramEnrollmentsPage),
  },
  { path: '/admin/users', element: withAdminAccess(AdminUsersPage) },
  { path: '/admin/users/create', element: withAdminAccess(AdminUserCreatePage) },
  { path: '/admin/users/:id', element: withAdminAccess(AdminUserDetailPage) },
  { path: '/admin/roles', element: withAdminAccess(AdminRolesPage) },
  { path: '/admin/roles/:id', element: withAdminAccess(AdminRoleDetailPage) },
  { path: '/admin/coaches', element: withAdminAccess(AdminCoachesPage) },
  { path: '/admin/coaches/:id', element: withAdminAccess(AdminCoachDetailPage) },
  { path: '/admin/coaches/:id/programs', element: withAdminAccess(AdminCoachProgramsPage) },
  { path: '/admin/volunteers', element: withAdminAccess(AdminVolunteersPage) },
  { path: '/admin/volunteers/:id', element: withAdminAccess(AdminVolunteerDetailPage) },
  { path: '/admin/payments', element: withAdminAccess(AdminPaymentsPage) },
  { path: '/admin/appearance', element: withAdminAccess(AdminTenantAppearancePage) },
  { path: '/admin/appsettings', element: withAdminAccess(AdminAppSettingsPage) },
  { path: '/admin/settings', element: withAdminAccess(AdminSettingsPage) },
];

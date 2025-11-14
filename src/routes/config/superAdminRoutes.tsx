import type { ComponentType } from 'react';

import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';
import { SuperAdminCreateTenantPage } from '@/features/super-admin/pages/SuperAdminCreateTenantPage';
import { SuperAdminDashboardPage } from '@/features/super-admin/pages/SuperAdminDashboardPage';
import { SuperAdminRolesPage } from '@/features/super-admin/pages/SuperAdminRolesPage';
import { SuperAdminSystemSettingsPage } from '@/features/super-admin/pages/SuperAdminSystemSettingsPage';
import { SuperAdminTenantDetailPage } from '@/features/super-admin/pages/SuperAdminTenantDetailPage';
import { SuperAdminTenantDomainsPage } from '@/features/super-admin/pages/SuperAdminTenantDomainsPage';
import { SuperAdminTenantsPage } from '@/features/super-admin/pages/SuperAdminTenantsPage';

import type { AppRoute } from './types';

const withSuperAdminAccess = (Component: ComponentType): JSX.Element => {
  return (
    <ProtectedRoute allowedRoles={['super-admin']}>
      <Component />
    </ProtectedRoute>
  );
};

export const superAdminRoutes: AppRoute[] = [
  { path: '/super-admin', element: withSuperAdminAccess(SuperAdminDashboardPage) },
  { path: '/super-admin/tenants', element: withSuperAdminAccess(SuperAdminTenantsPage) },
  {
    path: '/super-admin/tenants/:tenantId',
    element: withSuperAdminAccess(SuperAdminTenantDetailPage),
  },
  {
    path: '/super-admin/tenants/:tenantId/domains',
    element: withSuperAdminAccess(SuperAdminTenantDomainsPage),
  },
  { path: '/super-admin/tenants/new', element: withSuperAdminAccess(SuperAdminCreateTenantPage) },
  {
    path: '/super-admin/system-settings',
    element: withSuperAdminAccess(SuperAdminSystemSettingsPage),
  },
  { path: '/super-admin/roles', element: withSuperAdminAccess(SuperAdminRolesPage) },
];

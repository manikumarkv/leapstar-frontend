import type { ComponentType } from 'react';

import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';
import { VolunteerDashboardPage } from '@/features/volunteer/pages/VolunteerDashboardPage';

import type { AppRoute } from './types';

const withVolunteerAccess = (Component: ComponentType): JSX.Element => {
  return (
    <ProtectedRoute allowedRoles={['volunteer']}>
      <Component />
    </ProtectedRoute>
  );
};

export const volunteerRoutes: AppRoute[] = [
  { path: '/volunteer', element: withVolunteerAccess(VolunteerDashboardPage) },
];

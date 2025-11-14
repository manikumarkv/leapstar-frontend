import type { ComponentType } from 'react';

import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';
import { ParentApprovalsPage } from '@/features/parent/pages/ParentApprovalsPage';
import { ParentDashboardPage } from '@/features/parent/pages/ParentDashboardPage';
import { ParentEnrollmentDetailPage } from '@/features/parent/pages/ParentEnrollmentDetailPage';
import { ParentEnrollmentsPage } from '@/features/parent/pages/ParentEnrollmentsPage';
import { ParentMessagesPage } from '@/features/parent/pages/ParentMessagesPage';
import { ParentProfilePage } from '@/features/parent/pages/ParentProfilePage';
import { ParentResourcesPage } from '@/features/parent/pages/ParentResourcesPage';
import { ParentSettingsPage } from '@/features/parent/pages/ParentSettingsPage';

import type { AppRoute } from './types';

const withParentAccess = (Component: ComponentType): JSX.Element => {
  return (
    <ProtectedRoute allowedRoles={['parent']}>
      <Component />
    </ProtectedRoute>
  );
};

export const parentRoutes: AppRoute[] = [
  { path: '/parent', element: withParentAccess(ParentDashboardPage) },
  { path: '/parent/enrollments', element: withParentAccess(ParentEnrollmentsPage) },
  {
    path: '/parent/enrollments/:enrollmentId',
    element: withParentAccess(ParentEnrollmentDetailPage),
  },
  { path: '/parent/approvals', element: withParentAccess(ParentApprovalsPage) },
  { path: '/parent/resources', element: withParentAccess(ParentResourcesPage) },
  { path: '/parent/messages', element: withParentAccess(ParentMessagesPage) },
  { path: '/parent/profile', element: withParentAccess(ParentProfilePage) },
  { path: '/parent/settings', element: withParentAccess(ParentSettingsPage) },
];

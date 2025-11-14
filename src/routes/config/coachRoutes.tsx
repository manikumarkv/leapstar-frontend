import type { ComponentType } from 'react';

import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';
import { CoachDashboardPage } from '@/features/coach/pages/CoachDashboardPage';
import { CoachMessagesPage } from '@/features/coach/pages/CoachMessagesPage';
import { CoachProfilePage } from '@/features/coach/pages/CoachProfilePage';
import { CoachProgramDetailPage } from '@/features/coach/pages/CoachProgramDetailPage';
import { CoachProgramsPage } from '@/features/coach/pages/CoachProgramsPage';
import { CoachResourcesPage } from '@/features/coach/pages/CoachResourcesPage';
import { CoachSchedulePage } from '@/features/coach/pages/CoachSchedulePage';
import { CoachSettingsPage } from '@/features/coach/pages/CoachSettingsPage';

import type { AppRoute } from './types';

const withCoachAccess = (Component: ComponentType): JSX.Element => {
  return (
    <ProtectedRoute allowedRoles={['teacher']}>
      <Component />
    </ProtectedRoute>
  );
};

export const coachRoutes: AppRoute[] = [
  { path: '/coach', element: withCoachAccess(CoachDashboardPage) },
  { path: '/coach/programs', element: withCoachAccess(CoachProgramsPage) },
  { path: '/coach/programs/:programId', element: withCoachAccess(CoachProgramDetailPage) },
  { path: '/coach/schedule', element: withCoachAccess(CoachSchedulePage) },
  { path: '/coach/resources', element: withCoachAccess(CoachResourcesPage) },
  { path: '/coach/messages', element: withCoachAccess(CoachMessagesPage) },
  { path: '/coach/profile', element: withCoachAccess(CoachProfilePage) },
  { path: '/coach/settings', element: withCoachAccess(CoachSettingsPage) },
];

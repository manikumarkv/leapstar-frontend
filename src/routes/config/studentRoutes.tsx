import type { ComponentType } from 'react';

import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';
import { StudentAddParentPage } from '@/features/student/pages/StudentAddParentPage';
import { StudentDashboardPage } from '@/features/student/pages/StudentDashboardPage';
import { StudentEnrollmentDetailPage } from '@/features/student/pages/StudentEnrollmentDetailPage';
import { StudentEnrollmentsPage } from '@/features/student/pages/StudentEnrollmentsPage';
import { StudentParentsPage } from '@/features/student/pages/StudentParentsPage';
import { StudentProgramsPage } from '@/features/student/pages/StudentProgramsPage';
import { StudentResourcesPage } from '@/features/student/pages/StudentResourcesPage';
import { StudentSchedulePage } from '@/features/student/pages/StudentSchedulePage';
import { StudentSettingsPage } from '@/features/student/pages/StudentSettingsPage';
import { StudentSupportPage } from '@/features/student/pages/StudentSupportPage';

import type { AppRoute } from './types';

const withStudentAccess = (Component: ComponentType): JSX.Element => {
  return (
    <ProtectedRoute allowedRoles={['student']}>
      <Component />
    </ProtectedRoute>
  );
};

export const studentRoutes: AppRoute[] = [
  { path: '/student', element: withStudentAccess(StudentDashboardPage) },
  { path: '/student/programs', element: withStudentAccess(StudentProgramsPage) },
  { path: '/student/enrollments', element: withStudentAccess(StudentEnrollmentsPage) },
  {
    path: '/student/enrollments/:enrollmentId',
    element: withStudentAccess(StudentEnrollmentDetailPage),
  },
  { path: '/student/parents/add', element: withStudentAccess(StudentAddParentPage) },
  { path: '/student/parents', element: withStudentAccess(StudentParentsPage) },
  { path: '/student/schedule', element: withStudentAccess(StudentSchedulePage) },
  { path: '/student/resources', element: withStudentAccess(StudentResourcesPage) },
  { path: '/student/support', element: withStudentAccess(StudentSupportPage) },
  { path: '/student/settings', element: withStudentAccess(StudentSettingsPage) },
];

import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';
import { EmailPreferencesPage } from '@/features/settings/pages/EmailPreferencesPage';

import type { AppRoute } from './types';

// All authenticated roles can access settings; omit allowedRoles to just require auth.
export const settingsRoutes: AppRoute[] = [
  {
    path: '/settings',
    element: (
      <ProtectedRoute>
        <EmailPreferencesPage />
      </ProtectedRoute>
    ),
  },
];

import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';
import { AuthCallbackPage } from '@/features/auth/pages/AuthCallbackPage';
import { AuthErrorPage } from '@/features/auth/pages/AuthErrorPage';
import { HomePage } from '@/features/auth/pages/HomePage';
import { LogoutPage } from '@/features/auth/pages/LogoutPage';
import { RegisterCompletePage } from '@/features/auth/pages/RegisterCompletePage';
import { RegisterPage } from '@/features/auth/pages/RegisterPage';
import { UnauthorizedPage } from '@/features/auth/pages/UnauthorizedPage';
import { ProfilePage } from '@/features/profile/pages/ProfilePage';

import type { AppRoute } from './types';

export const publicRoutes: AppRoute[] = [
  { path: '/', element: <HomePage /> },
  { path: '/logout', element: <LogoutPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/register/complete', element: <RegisterCompletePage /> },
  { path: '/auth/callback', element: <AuthCallbackPage /> },
  { path: '/auth/error', element: <AuthErrorPage /> },
  { path: '/unauthorized', element: <UnauthorizedPage /> },
  {
    path: '/profile',
    element: (
      <ProtectedRoute>
        <ProfilePage />
      </ProtectedRoute>
    ),
  },
];

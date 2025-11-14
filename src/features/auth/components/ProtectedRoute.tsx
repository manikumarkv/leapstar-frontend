import { useAuth0 } from '@auth0/auth0-react';
import { useEffect, useMemo, useRef, type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { FullScreenLoader } from '@/components/feedback/FullScreenLoader';
import { resolveAuthErrorCode } from '@/features/auth/utils/authError';
import { useTenantDomain } from '@/providers/tenant/TenantDomainProvider';

import { useCurrentUser } from '../hooks/useCurrentUser';
import type { DashboardRole } from '../utils/roleUtils';
import { userHasDashboardRole } from '../utils/roleUtils';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: DashboardRole[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps): JSX.Element => {
  const location = useLocation();
  const { isAuthenticated, isLoading, loginWithRedirect, logout } = useAuth0();
  const loginInitiatedRef = useRef(false);
  const logoutInitiatedRef = useRef(false);
  const { data: tenantDomain } = useTenantDomain();
  const tenantId = tenantDomain.resolved ? (tenantDomain.tenant?.id ?? null) : null;
  const attemptedPath = useMemo(
    () => `${location.pathname}${location.search}${location.hash}`,
    [location.hash, location.pathname, location.search],
  );

  useEffect(() => {
    if (isAuthenticated) {
      loginInitiatedRef.current = false;
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !loginInitiatedRef.current) {
      loginInitiatedRef.current = true;
      const appState: Record<string, unknown> = {
        returnTo: `${location.pathname}${location.search}${location.hash}`,
      };

      if (tenantId) {
        appState.tenantId = tenantId;
      }

      void loginWithRedirect({
        appState,
      });
    }
  }, [
    isLoading,
    isAuthenticated,
    loginWithRedirect,
    tenantId,
    location.hash,
    location.pathname,
    location.search,
  ]);

  const {
    data,
    isLoading: isUserLoading,
    error,
  } = useCurrentUser({
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (!error || logoutInitiatedRef.current || typeof window === 'undefined') {
      return;
    }

    const errorCode = resolveAuthErrorCode(error);

    const searchParams = new URLSearchParams({ code: errorCode, returnTo: attemptedPath });
    if (tenantId) {
      searchParams.set('tenant', tenantId);
    }

    logoutInitiatedRef.current = true;
    loginInitiatedRef.current = true;
    void logout({
      logoutParams: {
        returnTo: `${window.location.origin.replace(/\/$/, '')}/auth/error?${searchParams.toString()}`,
      },
    });
  }, [attemptedPath, error, logout, tenantId]);

  if (isLoading || (isAuthenticated && isUserLoading)) {
    return <FullScreenLoader message="Loading your dashboard..." />;
  }

  if (!isAuthenticated) {
    return <FullScreenLoader message="Redirecting to sign in..." />;
  }

  if (!data?.user) {
    return <FullScreenLoader message="Loading your profile..." />;
  }

  if (allowedRoles && !userHasDashboardRole(data.user, allowedRoles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

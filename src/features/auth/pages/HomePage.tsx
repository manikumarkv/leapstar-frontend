import { useAuth0 } from '@auth0/auth0-react';
import { useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { App } from '@/App';
import { FullScreenLoader } from '@/components/feedback/FullScreenLoader';
import { useTenantDomain } from '@/providers/tenant/TenantDomainProvider';

import { useCurrentUser } from '../hooks/useCurrentUser';
import { resolveAuthErrorCode } from '../utils/authError';
import { resolveDashboardPath } from '../utils/roleUtils';

export const HomePage = (): JSX.Element => {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth0();
  const logoutInitiatedRef = useRef(false);
  const { data, isLoading, error } = useCurrentUser({ enabled: isAuthenticated });
  const { data: tenantDomain } = useTenantDomain();

  const destination = data?.user ? resolveDashboardPath(data.user) : null;
  const tenantId = tenantDomain.resolved ? (tenantDomain.tenant?.id ?? null) : null;
  const attemptedPath = useMemo(() => {
    if (typeof window === 'undefined') {
      return '/';
    }
    return `${window.location.pathname}${window.location.search}${window.location.hash}`;
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !error || logoutInitiatedRef.current || typeof window === 'undefined') {
      return;
    }

    const errorCode = resolveAuthErrorCode(error);
    const searchParams = new URLSearchParams({ code: errorCode, returnTo: attemptedPath });
    if (tenantId) {
      searchParams.set('tenant', tenantId);
    }

    logoutInitiatedRef.current = true;
    void logout({
      logoutParams: {
        returnTo: `${window.location.origin.replace(/\/$/, '')}/auth/error?${searchParams.toString()}`,
      },
    });
  }, [attemptedPath, error, isAuthenticated, logout, tenantId]);

  useEffect(() => {
    if (!isAuthenticated || !destination) {
      return;
    }

    navigate(destination, { replace: true });
  }, [destination, isAuthenticated, navigate]);

  if (isAuthenticated) {
    if (isLoading || !data?.user) {
      return <FullScreenLoader message="Loading your dashboard..." />;
    }

    if (!destination) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center text-foreground">
          <h1 className="text-2xl font-semibold">No dashboard available</h1>
          <p className="max-w-md text-sm text-muted-foreground">
            Your account is active, but we couldn&apos;t determine which dashboard to open. Please
            contact support for assistance.
          </p>
        </div>
      );
    }

    return <FullScreenLoader message="Redirecting to your dashboard..." />;
  }

  return <App />;
};

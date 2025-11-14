import { useAuth0 } from '@auth0/auth0-react';
import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

import { Button } from '@/components/ui/button';

const ERROR_COPY: Record<string, { title: string; message: string }> = {
  'tenant-membership-missing': {
    title: 'Account Not Linked to This Portal',
    message:
      'We could not find an active membership for your account in this tenant. Reach out to your program administrator if you believe this is a mistake.',
  },
  'session-expired': {
    title: 'Sign-in Session Expired',
    message: 'Please sign in again to continue.',
  },
  'profile-load-failed': {
    title: 'Unable to Load Your Profile',
    message: 'Something went wrong while loading your account. Please try again.',
  },
  unknown: {
    title: 'Sign-in Error',
    message: 'We ran into an unexpected issue while signing you in.',
  },
};

export const AuthErrorPage = (): JSX.Element => {
  const { loginWithRedirect, isLoading } = useAuth0();
  const [searchParams] = useSearchParams();

  const code = searchParams.get('code') ?? 'unknown';
  const tenantId = searchParams.get('tenant') ?? undefined;
  const returnTo = searchParams.get('returnTo') ?? '/';

  const { title, message } = useMemo(() => {
    return ERROR_COPY[code] ?? ERROR_COPY.unknown;
  }, [code]);

  const handleRetry = () => {
    const appState: Record<string, unknown> = {
      returnTo,
    };

    if (tenantId) {
      appState.tenantId = tenantId;
    }

    void loginWithRedirect({ appState });
  };

  const homeHref = '/';

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4 text-center text-foreground">
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold md:text-3xl">{title}</h1>
        <p className="mx-auto max-w-xl text-sm text-muted-foreground md:text-base">{message}</p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button onClick={handleRetry} disabled={isLoading}>
          Try signing in again
        </Button>
        <Button variant="outline" asChild>
          <a href={homeHref}>Go to homepage</a>
        </Button>
      </div>
    </div>
  );
};

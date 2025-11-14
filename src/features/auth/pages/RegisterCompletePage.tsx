import { useAuth0 } from '@auth0/auth0-react';
import { CheckCircle2, Loader2, TriangleAlert } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { registerUser } from '@/api/auth';
import { ApiError } from '@/api/client';
import { AppHeader } from '@/components/layout/AppHeader';
import { Button } from '@/components/ui/button';
import { clearPendingRegistrationRole, getPendingRegistrationRole } from '@/lib/registration';
import type { RegistrationRole } from '@/shared';

const isAlreadyRegisteredError = (error: unknown): boolean => {
  if (error instanceof ApiError) {
    if (error.status === 409) {
      return true;
    }
    return typeof error.message === 'string'
      ? error.message.toLowerCase().includes('user already registered')
      : false;
  }

  if (error instanceof Error && typeof error.message === 'string') {
    return error.message.toLowerCase().includes('user already registered');
  }

  return false;
};

const extractDetailMessage = (details: unknown): string | undefined => {
  if (!details) {
    return undefined;
  }

  if (typeof details === 'string') {
    const trimmed = details.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }

  if (Array.isArray(details)) {
    for (const entry of details) {
      const message = extractDetailMessage(entry);
      if (message) {
        return message;
      }
    }
    return undefined;
  }

  if (typeof details === 'object') {
    const record = details as Record<string, unknown>;
    const candidateKeys = ['message', 'error', 'detail', 'description'];

    for (const key of candidateKeys) {
      const value = record[key];
      const message = extractDetailMessage(value);
      if (message) {
        return message;
      }
    }

    if (Array.isArray(record.errors)) {
      const message = extractDetailMessage(record.errors);
      if (message) {
        return message;
      }
    }

    if (Array.isArray(record.issues)) {
      const message = extractDetailMessage(record.issues);
      if (message) {
        return message;
      }
    }

    if (typeof record.code === 'string' && record.code.trim().length > 0) {
      return record.code;
    }
  }

  return undefined;
};

const deriveRegistrationErrorMessage = (error: ApiError): string => {
  const detailMessage = extractDetailMessage(error.details);
  if (detailMessage) {
    return detailMessage;
  }

  if (typeof error.message === 'string' && error.message.trim().length > 0) {
    return error.message;
  }

  if (error.status >= 500) {
    return 'We ran into a server issue while completing your registration. Please try again soon.';
  }

  return 'Registration failed. Please try again.';
};

interface LocationState {
  registrationRole?: RegistrationRole;
}

type RegistrationStatus =
  | 'idle'
  | 'submitting'
  | 'success'
  | 'error'
  | 'missing-role'
  | 'unauthenticated'
  | 'already-registered';

export const RegisterCompletePage = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getAccessTokenSilently, isAuthenticated, isLoading, user } = useAuth0();

  const locationState = location.state as LocationState | null;

  const [role, setRole] = useState<RegistrationRole | undefined>(() => {
    if (locationState?.registrationRole) {
      return locationState.registrationRole;
    }
    return getPendingRegistrationRole();
  });
  const [status, setStatus] = useState<RegistrationStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const greetingName = useMemo(() => {
    return user?.name ?? user?.email ?? 'there';
  }, [user?.email, user?.name]);

  const submitRegistration = useCallback(
    async (currentRole: RegistrationRole) => {
      try {
        setStatus('submitting');
        setErrorMessage('');

        const token = await getAccessTokenSilently();
        const fullName = user?.name?.trim() || '';
        let firstName: string | undefined;
        let lastName: string | undefined;

        if (fullName) {
          const parts = fullName.split(/\s+/);
          if (parts.length === 1) {
            firstName = parts[0];
          } else if (parts.length > 1) {
            firstName = parts[0];
            lastName = parts.slice(1).join(' ');
          }
        }

        const profile =
          firstName || lastName || fullName
            ? {
                firstName: firstName ?? undefined,
                lastName: lastName ?? undefined,
                displayName: fullName || undefined,
              }
            : undefined;

        await registerUser(token, {
          role: currentRole,
          profile,
          email: user?.email ?? undefined,
          picture: typeof user?.picture === 'string' ? user.picture : undefined,
          auth0Id: user?.sub,
        });

        clearPendingRegistrationRole();
        setStatus('success');
      } catch (error) {
        if (isAlreadyRegisteredError(error)) {
          clearPendingRegistrationRole();
          setStatus('already-registered');
          return;
        }

        const message =
          error instanceof ApiError
            ? deriveRegistrationErrorMessage(error)
            : error instanceof Error
              ? error.message
              : 'Registration failed. Please try again.';
        setErrorMessage(message);
        setStatus('error');
      }
    },
    [getAccessTokenSilently, user],
  );

  useEffect(() => {
    if (locationState?.registrationRole && locationState.registrationRole !== role) {
      setRole(locationState.registrationRole);
    }
  }, [locationState?.registrationRole, role]);

  useEffect(() => {
    if (
      isLoading ||
      status === 'submitting' ||
      status === 'success' ||
      status === 'error' ||
      status === 'already-registered'
    ) {
      return;
    }

    if (!isAuthenticated) {
      setStatus('unauthenticated');
      return;
    }

    if (!role) {
      setStatus('missing-role');
      return;
    }

    void submitRegistration(role);
  }, [isAuthenticated, isLoading, role, status, submitRegistration]);

  const handleRetry = () => {
    if (role) {
      void submitRegistration(role);
    } else {
      setStatus('missing-role');
    }
  };

  const handleGoHome = () => {
    navigate('/', { replace: true });
  };

  const handleGoBackToRegister = () => {
    navigate('/register', { replace: true });
  };

  const renderContent = () => {
    switch (status) {
      case 'success':
        return (
          <div className="modern-card mx-auto max-w-xl bg-card/90 text-center shadow-2xl">
            <div className="flex flex-col items-center gap-6 px-8 py-10">
              <CheckCircle2 className="h-12 w-12 text-emerald-500" />
              <div className="space-y-2">
                <h1 className="text-2xl font-semibold">Welcome aboard, {greetingName}!</h1>
                <p className="text-sm text-muted-foreground">
                  Your registration is locked in. We&apos;ll use your student profile to personalize
                  the next steps.
                </p>
              </div>
              <Button onClick={handleGoHome} className="inline-flex items-center gap-2">
                Go to dashboard
              </Button>
            </div>
          </div>
        );
      case 'error':
        return (
          <div className="modern-card mx-auto max-w-xl bg-card/90 text-center shadow-2xl">
            <div className="flex flex-col items-center gap-6 px-8 py-10">
              <TriangleAlert className="h-12 w-12 text-amber-500" />
              <div className="space-y-3">
                <h1 className="text-2xl font-semibold">We hit a snag</h1>
                <p className="text-sm text-muted-foreground">{errorMessage}</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button variant="outline" onClick={handleGoBackToRegister}>
                  Back to register
                </Button>
                <Button onClick={handleRetry}>Try again</Button>
              </div>
            </div>
          </div>
        );
      case 'missing-role':
        return (
          <div className="modern-card mx-auto max-w-xl bg-card/90 text-center shadow-2xl">
            <div className="flex flex-col items-center gap-6 px-8 py-10">
              <TriangleAlert className="h-12 w-12 text-amber-500" />
              <div className="space-y-3">
                <h1 className="text-2xl font-semibold">Select a role to continue</h1>
                <p className="text-sm text-muted-foreground">
                  We couldn&apos;t determine which role you&apos;d like to register as. Please head
                  back and choose a role to finish setting up your account.
                </p>
              </div>
              <Button onClick={handleGoBackToRegister}>Choose role</Button>
            </div>
          </div>
        );
      case 'unauthenticated':
        return (
          <div className="modern-card mx-auto max-w-xl bg-card/90 text-center shadow-2xl">
            <div className="flex flex-col items-center gap-6 px-8 py-10">
              <TriangleAlert className="h-12 w-12 text-amber-500" />
              <div className="space-y-3">
                <h1 className="text-2xl font-semibold">Please sign in</h1>
                <p className="text-sm text-muted-foreground">
                  It looks like your session expired. Sign in again and we&apos;ll pick up right
                  where you left off.
                </p>
              </div>
              <Button onClick={handleGoBackToRegister}>Return to register</Button>
            </div>
          </div>
        );
      case 'already-registered':
        return (
          <div className="modern-card mx-auto max-w-xl bg-card/90 text-center shadow-2xl">
            <div className="flex flex-col items-center gap-6 px-8 py-10">
              <CheckCircle2 className="h-12 w-12 text-primary" />
              <div className="space-y-3">
                <h1 className="text-2xl font-semibold">You’re all set!</h1>
                <p className="text-sm text-muted-foreground">
                  Looks like you&apos;ve already completed registration. Head to your dashboard to
                  keep exploring.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button variant="outline" onClick={handleGoBackToRegister}>
                  Back to register
                </Button>
                <Button onClick={handleGoHome}>Go to dashboard</Button>
              </div>
            </div>
          </div>
        );
      case 'submitting':
      case 'idle':
      default:
        return (
          <div className="modern-card mx-auto max-w-xl bg-card/90 text-center shadow-2xl">
            <div className="flex flex-col items-center gap-6 px-8 py-10">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <div className="space-y-3">
                <h1 className="text-2xl font-semibold">Finishing up</h1>
                <p className="text-sm text-muted-foreground">
                  We&apos;re saving your registration details now. You&apos;ll be redirected in a
                  moment.
                </p>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />
      <main className="container mx-auto flex min-h-[60vh] items-center justify-center px-4 py-16">
        {renderContent()}
      </main>
    </div>
  );
};

import { Auth0Provider, type AppState } from '@auth0/auth0-react';
import { type PropsWithChildren, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { auth0Config } from '@/config/auth';
import { setPendingRegistrationRole } from '@/lib/registration';
import type { RegistrationRole } from '@/shared';

const getRedirectUri = (): string | undefined => {
  if (typeof window === 'undefined') {
    return undefined;
  }

  return window.location.origin;
};

export const Auth0ProviderWithNavigate = ({ children }: PropsWithChildren): JSX.Element => {
  const navigate = useNavigate();
  const redirectUri = useMemo(getRedirectUri, []);

  type RegistrationAppState = AppState & {
    role?: RegistrationRole;
    tenantId?: string | null;
  };

  const onRedirectCallback = (appState?: RegistrationAppState) => {
    if (appState?.role) {
      setPendingRegistrationRole(appState.role);
    }

    const target = appState?.returnTo ?? '/';

    const navigationState = {
      ...(appState?.role ? { registrationRole: appState.role } : {}),
      ...(appState?.tenantId ? { tenantId: appState.tenantId } : {}),
    };

    navigate(target, {
      replace: true,
      state: Object.keys(navigationState).length > 0 ? navigationState : undefined,
    });
  };

  return (
    <Auth0Provider
      domain={auth0Config.domain}
      clientId={auth0Config.clientId}
      authorizationParams={{
        redirect_uri: redirectUri,
        audience: auth0Config.audience,
        scope: auth0Config.scope,
      }}
      onRedirectCallback={onRedirectCallback}
      cacheLocation="localstorage"
      useRefreshTokens
    >
      {children}
    </Auth0Provider>
  );
};

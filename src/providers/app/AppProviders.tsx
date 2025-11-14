import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { type PropsWithChildren } from 'react';

import { Toaster } from '@/components/ui/toaster';
import { queryClient } from '@/lib/queryClient';
import { Auth0ProviderWithNavigate } from '@/providers/auth/Auth0ProviderWithNavigate';
import { TenantDomainProvider } from '@/providers/tenant/TenantDomainProvider';
import { ThemeProvider } from '@/providers/theme/ThemeProvider';

export const AppProviders = ({ children }: PropsWithChildren): JSX.Element => {
  return (
    <QueryClientProvider client={queryClient}>
      <TenantDomainProvider>
        <Auth0ProviderWithNavigate>
          <ThemeProvider>{children}</ThemeProvider>
        </Auth0ProviderWithNavigate>
      </TenantDomainProvider>
      {import.meta.env.DEV ? <ReactQueryDevtools initialIsOpen={false} /> : null}
      <Toaster />
    </QueryClientProvider>
  );
};

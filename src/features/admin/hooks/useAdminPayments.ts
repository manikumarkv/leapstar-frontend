import { useAuth0 } from '@auth0/auth0-react';
import { useMutation, useQuery, useQueryClient, type UseQueryResult } from '@tanstack/react-query';

import {
  createStripeOnboardingLink,
  getTenantPaymentStatus,
  type CreateStripeOnboardingLinkPayload,
  type TenantPaymentStatusResponse,
} from '@/api/payments';

export const ADMIN_PAYMENT_STATUS_QUERY_KEY = (tenantId: string | null | undefined) =>
  ['admin', 'payments', 'status', tenantId ?? 'none'] as const;

interface UseAdminPaymentStatusOptions {
  tenantId: string | null;
  enabled?: boolean;
}

export const useAdminPaymentStatus = ({
  tenantId,
  enabled = true,
}: UseAdminPaymentStatusOptions): UseQueryResult<TenantPaymentStatusResponse> => {
  const { getAccessTokenSilently } = useAuth0();

  return useQuery<TenantPaymentStatusResponse>({
    queryKey: ADMIN_PAYMENT_STATUS_QUERY_KEY(tenantId),
    enabled: Boolean(tenantId) && enabled,
    staleTime: 30_000,
    refetchInterval: false,
    queryFn: async () => {
      if (!tenantId) {
        throw new Error('Tenant id is required to load payment status');
      }
      const token = await getAccessTokenSilently();
      return getTenantPaymentStatus(token, tenantId);
    },
  });
};

export const useStripeOnboardingLinkMutation = (tenantId: string | null) => {
  const queryClient = useQueryClient();
  const { getAccessTokenSilently } = useAuth0();

  return useMutation({
    mutationFn: async (payload: CreateStripeOnboardingLinkPayload) => {
      if (!tenantId) {
        throw new Error('Tenant id is required to create a Stripe onboarding link');
      }
      const token = await getAccessTokenSilently();
      return createStripeOnboardingLink(token, tenantId, payload);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ADMIN_PAYMENT_STATUS_QUERY_KEY(tenantId) });
    },
  });
};

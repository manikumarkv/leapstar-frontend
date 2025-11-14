import { ApiError } from '@/api/client';

export type AuthErrorCode = 'tenant-membership-missing' | 'session-expired' | 'profile-load-failed';

export const resolveAuthErrorCode = (error: unknown): AuthErrorCode => {
  if (error instanceof ApiError) {
    if (error.status === 404) {
      return 'tenant-membership-missing';
    }
    if (error.status === 401 || error.status === 403) {
      return 'session-expired';
    }
  }
  return 'profile-load-failed';
};

import type { RegistrationRole } from '@/shared';

const STORAGE_KEY = 'leapstar:pending-registration-role';

const isBrowser = (): boolean => typeof window !== 'undefined';

export const setPendingRegistrationRole = (role: RegistrationRole): void => {
  if (!isBrowser()) {
    return;
  }
  window.sessionStorage.setItem(STORAGE_KEY, role);
};

export const getPendingRegistrationRole = (): RegistrationRole | undefined => {
  if (!isBrowser()) {
    return undefined;
  }
  const value = window.sessionStorage.getItem(STORAGE_KEY);
  if (!value) {
    return undefined;
  }
  return value as RegistrationRole;
};

export const clearPendingRegistrationRole = (): void => {
  if (!isBrowser()) {
    return;
  }
  window.sessionStorage.removeItem(STORAGE_KEY);
};

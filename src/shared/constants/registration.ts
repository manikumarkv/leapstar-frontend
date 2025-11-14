export const REGISTRATION_ROLES = [
  'student',
  'parent',
  'volunteer',
  'admin',
  'super-admin',
] as const;

export type RegistrationRole = (typeof REGISTRATION_ROLES)[number];

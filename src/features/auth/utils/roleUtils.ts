import type { CurrentUserResponse } from '@/api/auth';

export type DashboardRole =
  | 'student'
  | 'teacher'
  | 'admin'
  | 'parent'
  | 'volunteer'
  | 'super-admin';

const DESTINATIONS: Array<{ role: DashboardRole; path: string }> = [
  { role: 'super-admin', path: '/super-admin' },
  { role: 'admin', path: '/admin' },
  { role: 'teacher', path: '/coach' },
  { role: 'student', path: '/student' },
  { role: 'parent', path: '/parent' },
  { role: 'volunteer', path: '/volunteer' },
];

const toSlug = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const addIdentifier = (target: Set<string>, value?: unknown) => {
  if (typeof value !== 'string') {
    return;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return;
  }

  const lower = trimmed.toLowerCase();
  target.add(lower);
  target.add(toSlug(trimmed));
};

const collectRoleIdentifiers = (
  role: CurrentUserResponse['user']['roles'][number],
): Set<string> => {
  const identifiers = new Set<string>();

  if (role.metadata && typeof role.metadata === 'object' && !Array.isArray(role.metadata)) {
    const metadata = role.metadata as Record<string, unknown>;
    const baseName = typeof metadata.baseName === 'string' ? metadata.baseName : undefined;
    const seedKey = typeof metadata.seedKey === 'string' ? metadata.seedKey : undefined;

    addIdentifier(identifiers, baseName);
    addIdentifier(identifiers, seedKey);

    if (seedKey?.toLowerCase().includes('admin')) {
      addIdentifier(identifiers, 'admin');
    }
  }

  addIdentifier(identifiers, role.name);

  return identifiers;
};

export const userHasDashboardRole = (
  user: CurrentUserResponse['user'],
  roles: DashboardRole[],
): boolean => {
  if (!user.roles || user.roles.length === 0) {
    return false;
  }

  const desired = roles.map((role) => role.toLowerCase());

  return user.roles.some((role) => {
    const identifiers = collectRoleIdentifiers(role);
    return desired.some((target) => identifiers.has(target));
  });
};

export const resolveDashboardPath = (user: CurrentUserResponse['user']): string | null => {
  for (const destination of DESTINATIONS) {
    if (userHasDashboardRole(user, [destination.role])) {
      return destination.path;
    }
  }

  return null;
};

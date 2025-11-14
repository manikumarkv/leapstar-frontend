import { adminRoutes } from './adminRoutes';
import { coachRoutes } from './coachRoutes';
import { parentRoutes } from './parentRoutes';
import { publicRoutes } from './publicRoutes';
import { studentRoutes } from './studentRoutes';
import { superAdminRoutes } from './superAdminRoutes';
import type { AppRoute } from './types';
import { volunteerRoutes } from './volunteerRoutes';

export const appRoutes: AppRoute[] = [
  ...publicRoutes,
  ...adminRoutes,
  ...coachRoutes,
  ...studentRoutes,
  ...parentRoutes,
  ...volunteerRoutes,
  ...superAdminRoutes,
];

import {
  Award,
  BarChart3,
  BookOpen,
  Palette,
  Settings,
  ShieldCheck,
  UserCog,
  Users,
  Users2,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import type { BreadcrumbItem } from '@/components/navigation/PageBreadcrumbs';
import { Button } from '@/components/ui/button';
import { AdminLayout } from '@/features/admin/components/AdminLayout';

const breadcrumbs: BreadcrumbItem[] = [
  { label: 'Admin portal', href: '/admin' },
  { label: 'Dashboard' },
];

const kpiCards = [
  {
    label: 'Total programs',
    value: '24',
    trend: '+2 from last month',
    icon: BookOpen,
    accent: 'text-violet-500',
  },
  {
    label: 'Active users',
    value: '1,234',
    trend: '+123 from last month',
    icon: Users,
    accent: 'text-blue-500',
  },
  {
    label: 'Active enrollments',
    value: '856',
    trend: '+45 from last month',
    icon: BarChart3,
    accent: 'text-emerald-500',
  },
  {
    label: 'Pending approvals',
    value: '18',
    trend: '6 awaiting review',
    icon: ShieldCheck,
    accent: 'text-amber-500',
  },
];

const managementShortcuts = [
  {
    title: 'Programs',
    description: 'Curate offerings and scheduling details.',
    href: '/admin/programs',
    icon: BookOpen,
    accent: 'text-violet-500',
  },
  {
    title: 'Users',
    description: 'Invite members and adjust access levels.',
    href: '/admin/users',
    icon: Users,
    accent: 'text-blue-500',
  },
  {
    title: 'Coaches',
    description: 'Manage profiles and assigned cohorts.',
    href: '/admin/coaches',
    icon: UserCog,
    accent: 'text-emerald-500',
  },
  {
    title: 'Volunteers',
    description: 'Oversee availability and placements.',
    href: '/admin/volunteers',
    icon: Users2,
    accent: 'text-pink-500',
  },
  {
    title: 'Roles & permissions',
    description: 'Configure governance and policy controls.',
    href: '/admin/roles',
    icon: Award,
    accent: 'text-amber-500',
  },
  {
    title: 'Tenant appearance',
    description: 'Refresh the brand palette your members experience.',
    href: '/admin/appearance',
    icon: Palette,
    accent: 'text-teal-500',
  },
  {
    title: 'App settings',
    description: 'Manage platform-wide defaults and integrations.',
    href: '/admin/appsettings',
    icon: Settings,
    accent: 'text-orange-500',
  },
];

export const AdminDashboardPage = (): JSX.Element => {
  return (
    <AdminLayout
      title="Admin dashboard"
      description="Oversee tenant health, manage users, and keep programs running smoothly."
      breadcrumbs={breadcrumbs}
      documentTitle="Admin Dashboard"
    >
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpiCards.map(({ label, value, trend, icon: Icon, accent }) => (
          <div
            key={label}
            className="rounded-xl border border-border bg-card/80 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase text-muted-foreground">{label}</p>
                <p className="text-3xl font-semibold tracking-tight">{value}</p>
              </div>
              <span className={`rounded-full bg-primary/10 p-2 ${accent}`}>
                <Icon className="h-5 w-5" />
              </span>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">{trend}</p>
          </div>
        ))}
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[2fr_3fr]">
        <div className="rounded-2xl border border-border bg-card/80 p-6 shadow-sm">
          <header className="mb-5 space-y-1">
            <h2 className="text-lg font-semibold">Today&apos;s priorities</h2>
            <p className="text-sm text-muted-foreground">
              Quick glance at approvals, escalations, and key alerts requiring admin attention.
            </p>
          </header>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-3 rounded-lg bg-background/60 p-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-amber-500" aria-hidden="true" />
              <div>
                <p className="font-medium text-foreground">6 enrollments awaiting approval</p>
                <p>Review supporting documents before end of day.</p>
              </div>
            </li>
            <li className="flex items-start gap-3 rounded-lg bg-background/60 p-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
              <div>
                <p className="font-medium text-foreground">New coach onboarding checklist</p>
                <p>Complete background verification for 3 pending hires.</p>
              </div>
            </li>
            <li className="flex items-start gap-3 rounded-lg bg-background/60 p-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-blue-500" aria-hidden="true" />
              <div>
                <p className="font-medium text-foreground">Platform release notes</p>
                <p>Review integration changes and communicate updates to staff.</p>
              </div>
            </li>
          </ul>
        </div>

        <div className="rounded-2xl border border-border bg-card/80 p-6 shadow-sm">
          <header className="mb-5 space-y-1">
            <h2 className="text-lg font-semibold">Management shortcuts</h2>
            <p className="text-sm text-muted-foreground">
              Jump into core admin workflows and keep operations moving.
            </p>
          </header>
          <div className="grid gap-4 sm:grid-cols-2">
            {managementShortcuts.map(({ title, description, href, icon: Icon, accent }) => (
              <div
                key={title}
                className="group rounded-xl border border-border bg-background/70 p-5 transition hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md"
              >
                <div className={`mb-3 inline-flex rounded-full bg-primary/10 p-2 ${accent}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold text-foreground">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{description}</p>
                <Button asChild variant="link" className="mt-3 px-0 text-sm text-primary">
                  <Link to={href}>Manage</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </AdminLayout>
  );
};

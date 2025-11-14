import { SuperAdminLayout } from '../components/SuperAdminLayout';

export const SuperAdminRolesPage = (): JSX.Element => {
  return (
    <SuperAdminLayout
      title="Platform roles"
      description="Review and manage global roles available to all tenants."
      breadcrumbs={[
        { label: 'Super admin portal', href: '/super-admin' },
        { label: 'Platform roles' },
      ]}
      documentTitle="Super Admin • Platform roles"
    >
      <div className="rounded-lg border border-border/70 bg-muted/20 p-6 text-sm text-muted-foreground">
        Global role management will be built here.
      </div>
    </SuperAdminLayout>
  );
};

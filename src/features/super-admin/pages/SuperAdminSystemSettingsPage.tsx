import { SuperAdminLayout } from '../components/SuperAdminLayout';

export const SuperAdminSystemSettingsPage = (): JSX.Element => {
  return (
    <SuperAdminLayout
      title="System settings"
      description="Tweak platform-wide configuration, feature flags, and integrations."
      breadcrumbs={[
        { label: 'Super admin portal', href: '/super-admin' },
        { label: 'System settings' },
      ]}
      documentTitle="Super Admin • System settings"
    >
      <div className="rounded-lg border border-border/70 bg-muted/20 p-6 text-sm text-muted-foreground">
        System configuration panels coming soon.
      </div>
    </SuperAdminLayout>
  );
};

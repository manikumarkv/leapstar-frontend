import { Link } from 'react-router-dom';

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

interface PageBreadcrumbsProps {
  items: BreadcrumbItem[];
}

export const PageBreadcrumbs = ({ items }: PageBreadcrumbsProps): JSX.Element | null => {
  if (!items.length) {
    return null;
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground"
    >
      {items.map((item, index) => (
        <span key={`${item.label}-${index}`} className="flex items-center gap-2">
          {item.href ? (
            <Link to={item.href} className="transition-colors hover:text-foreground">
              {item.label}
            </Link>
          ) : (
            <span>{item.label}</span>
          )}
          {index < items.length - 1 ? <span aria-hidden="true">/</span> : null}
        </span>
      ))}
    </nav>
  );
};

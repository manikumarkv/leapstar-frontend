export const normalizeSubdomainLabel = (value: string): string => {
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) {
    return '';
  }

  const ascii = trimmed.normalize('NFKD').replace(/[\u0080-\uFFFF]/g, '');
  const sanitized = ascii
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');

  return sanitized;
};

export const isSubdomainOf = (hostname: string, apexDomain: string): boolean => {
  const normalizedHost = hostname.trim().toLowerCase();
  const normalizedApex = apexDomain.trim().toLowerCase();
  if (!normalizedHost || !normalizedApex) {
    return false;
  }

  const suffix = `.${normalizedApex}`;
  return normalizedHost.endsWith(suffix) && normalizedHost.length > suffix.length;
};

export const buildSubdomain = (label: string, apexDomain: string): string => {
  const normalizedLabel = label.trim().toLowerCase();
  const normalizedApex = apexDomain.trim().toLowerCase();

  if (!normalizedLabel) {
    return normalizedApex;
  }

  return `${normalizedLabel}.${normalizedApex}`;
};

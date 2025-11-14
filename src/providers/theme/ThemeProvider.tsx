import { useAuth0 } from '@auth0/auth0-react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';

import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';
import {
  adjustHexLightness,
  getAccessibleTextColor,
  hexToHslString,
  normalizeHex,
} from '@/lib/color';
import { useTenantDomain } from '@/providers/tenant/TenantDomainProvider';

type Theme = 'light' | 'dark';

type TenantBranding = {
  logoUrl?: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
};

type BrandState = {
  logoUrl: string | null;
  primaryColor: string;
  primaryForeground: string;
  secondaryColor: string;
  secondaryForeground: string;
  accentColor: string;
  accentForeground: string;
};

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  brand: BrandState;
}

const STORAGE_KEY = 'leapstar-theme';
const DEFAULT_PRIMARY = '#2563EB';
const DEFAULT_SECONDARY = '#1D4ED8';
const DEFAULT_FOREGROUND = '#0F172A';
const DEFAULT_INVERTED = '#FFFFFF';

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const getPreferredTheme = (): Theme => {
  if (typeof window === 'undefined') {
    return 'dark';
  }

  const storedTheme = window.localStorage.getItem(STORAGE_KEY);
  if (storedTheme === 'light' || storedTheme === 'dark') {
    return storedTheme;
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const buildBrandState = (branding: TenantBranding | null | undefined): BrandState => {
  const primaryColor = normalizeHex(branding?.primaryColor, DEFAULT_PRIMARY);
  const secondaryColor = normalizeHex(branding?.secondaryColor, DEFAULT_SECONDARY);

  const accentFromPrimary = adjustHexLightness(primaryColor, 0.08);

  const primaryForeground = normalizeHex(getAccessibleTextColor(primaryColor), DEFAULT_INVERTED);
  const secondaryForeground = normalizeHex(
    getAccessibleTextColor(secondaryColor),
    DEFAULT_FOREGROUND,
  );
  const accentForeground = normalizeHex(
    getAccessibleTextColor(accentFromPrimary),
    DEFAULT_INVERTED,
  );

  return {
    logoUrl: branding?.logoUrl ?? null,
    primaryColor,
    primaryForeground,
    secondaryColor,
    secondaryForeground,
    accentColor: accentFromPrimary,
    accentForeground,
  };
};

const DEFAULT_BRAND = buildBrandState(null);

export const ThemeProvider = ({ children }: PropsWithChildren): JSX.Element => {
  const { isAuthenticated } = useAuth0();
  const { data: currentUser } = useCurrentUser();
  const { data: tenantDomain } = useTenantDomain();
  const [theme, setThemeState] = useState<Theme>(() => getPreferredTheme());
  const [brand, setBrand] = useState<BrandState>(DEFAULT_BRAND);

  const applyBrandToCssVariables = useCallback((nextBrand: BrandState) => {
    if (typeof document === 'undefined') {
      return;
    }

    const root = document.documentElement;
    const setVar = (variable: string, hex: string) => {
      root.style.setProperty(variable, hexToHslString(hex));
    };

    setVar('--primary', nextBrand.primaryColor);
    setVar('--primary-foreground', nextBrand.primaryForeground);
    setVar('--ring', nextBrand.primaryColor);
    setVar('--secondary', nextBrand.secondaryColor);
    setVar('--secondary-foreground', nextBrand.secondaryForeground);
    setVar('--accent', nextBrand.accentColor);
    setVar('--accent-foreground', nextBrand.accentForeground);
    setVar('--sidebar-primary', nextBrand.primaryColor);
    setVar('--sidebar-primary-foreground', nextBrand.primaryForeground);
    setVar('--sidebar-accent', nextBrand.accentColor);
    setVar('--sidebar-accent-foreground', nextBrand.accentForeground);
    setVar('--sidebar-ring', nextBrand.primaryColor);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const domainBranding = tenantDomain.resolved ? (tenantDomain.tenant?.branding ?? null) : null;
  const tenantBranding = isAuthenticated
    ? (currentUser?.tenant?.branding ?? domainBranding)
    : domainBranding;

  const computedBrand = useMemo(() => buildBrandState(tenantBranding), [tenantBranding]);

  useEffect(() => {
    setBrand((previous) => (previous === computedBrand ? previous : computedBrand));
  }, [computedBrand]);

  useEffect(() => {
    applyBrandToCssVariables(brand);
  }, [applyBrandToCssVariables, brand]);

  const setTheme = useCallback((value: Theme) => {
    setThemeState(value);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((current) => (current === 'light' ? 'dark' : 'light'));
  }, []);

  const value = useMemo(
    () => ({
      theme,
      toggleTheme,
      setTheme,
      brand,
    }),
    [brand, theme, toggleTheme, setTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }

  return context;
};

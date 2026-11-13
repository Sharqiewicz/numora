import { useLocation } from '@tanstack/react-router';
import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';

export type PackageTab = 'react' | 'vue' | 'svelte' | 'core';
export type PackageRoutePrefix = 'numora-react' | 'numora';

const STORAGE_KEY = 'numora-docs-package';
const DEFAULT_PACKAGE: PackageTab = 'react';

interface PackageContextType {
  selectedPackage: PackageTab;
  setSelectedPackage: (pkg: PackageTab) => void;
  getPackageRoutePrefix: () => PackageRoutePrefix;
  isReactPackage: () => boolean;
}

const PackageContext = createContext<PackageContextType | undefined>(undefined);

// The URL is the source of truth on package pages, so prerendered HTML and
// first-time visitors get the sidebar that matches the page they're on.
function packageFromPath(pathname: string): PackageTab | null {
  if (/^\/docs\/numora-react(\/|$)/.test(pathname)) return 'react';
  if (/^\/docs\/numora(\/|$)/.test(pathname)) return 'core';
  return null;
}

export function PackageProvider({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const packageInPath = packageFromPath(pathname);
  const [storedPackage, setSelectedPackageState] = useState<PackageTab>(DEFAULT_PACKAGE);
  const [hydrated, setHydrated] = useState(false);
  const selectedPackage = packageInPath ?? storedPackage;

  // biome-ignore lint/correctness/useExhaustiveDependencies: mount-only read of the stored preference
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as PackageTab | null;
    if (!packageInPath && stored && ['react', 'core'].includes(stored)) {
      setSelectedPackageState(stored);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (packageInPath) setSelectedPackageState(packageInPath);
  }, [packageInPath]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, selectedPackage);
  }, [selectedPackage, hydrated]);

  const setSelectedPackage = (pkg: PackageTab) => {
    setSelectedPackageState(pkg);
  };

  const getPackageRoutePrefix = (): PackageRoutePrefix => {
    return selectedPackage === 'react' ? 'numora-react' : 'numora';
  };

  const isReactPackage = (): boolean => {
    return selectedPackage === 'react';
  };

  return (
    <PackageContext.Provider
      value={{
        selectedPackage,
        setSelectedPackage,
        getPackageRoutePrefix,
        isReactPackage,
      }}
    >
      {children}
    </PackageContext.Provider>
  );
}

export function usePackage() {
  const context = useContext(PackageContext);
  if (context === undefined) {
    throw new Error('usePackage must be used within a PackageProvider');
  }
  return context;
}

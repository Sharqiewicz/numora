import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type PackageTab = 'react' | 'vue' | 'svelte' | 'core'
export type PackageRoutePrefix = 'numora-react' | 'numora'

const STORAGE_KEY = 'numora-docs-package'
const DEFAULT_PACKAGE: PackageTab = 'react'

interface PackageContextType {
  selectedPackage: PackageTab
  setSelectedPackage: (pkg: PackageTab) => void
  getPackageRoutePrefix: () => PackageRoutePrefix
  isReactPackage: () => boolean
}

const PackageContext = createContext<PackageContextType | undefined>(undefined)

export function PackageProvider({ children }: { children: ReactNode }) {
  const [selectedPackage, setSelectedPackageState] = useState<PackageTab>(() => {
    if (typeof window === 'undefined') {
      return DEFAULT_PACKAGE
    }
    const stored = localStorage.getItem(STORAGE_KEY) as PackageTab | null
    return (stored && ['react', 'core'].includes(stored))
      ? stored
      : DEFAULT_PACKAGE
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, selectedPackage)
    }
  }, [selectedPackage])

  const setSelectedPackage = (pkg: PackageTab) => {
    setSelectedPackageState(pkg)
  }

  const getPackageRoutePrefix = (): PackageRoutePrefix => {
    return selectedPackage === 'react' ? 'numora-react' : 'numora'
  }

  const isReactPackage = (): boolean => {
    return selectedPackage === 'react'
  }

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
  )
}

export function usePackage() {
  const context = useContext(PackageContext)
  if (context === undefined) {
    throw new Error('usePackage must be used within a PackageProvider')
  }
  return context
}

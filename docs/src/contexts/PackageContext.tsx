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
  const [selectedPackage, setSelectedPackageState] = useState<PackageTab>(DEFAULT_PACKAGE)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as PackageTab | null
    if (stored && ['react', 'core'].includes(stored)) {
      setSelectedPackageState(stored)
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    localStorage.setItem(STORAGE_KEY, selectedPackage)
  }, [selectedPackage, hydrated])

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

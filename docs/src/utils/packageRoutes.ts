import type { PackageTab, PackageRoutePrefix } from '@/contexts/PackageContext'

export function getPackageRoutePrefix(packageTab: PackageTab): PackageRoutePrefix {
  return packageTab === 'react' ? 'numora-react' : 'numora'
}

export function getPackageHref(basePath: string, packagePrefix: PackageRoutePrefix): string {
  if (basePath === '/docs') {
    return `/docs/${packagePrefix}`
  }

  if (basePath === '/docs/installation') {
    return `/docs/${packagePrefix}/installation`
  }

  if (basePath.startsWith('/docs/features/')) {
    const feature = basePath.replace('/docs/features/', '')
    return `/docs/${packagePrefix}/features/${feature}`
  }

  return basePath
}

export function extractPageFromPath(path: string): string | null {
  if (path === '/docs/numora' || path === '/docs/numora-react') {
    return ''
  }

  const numoraMatch = path.match(/^\/docs\/numora(?:\/|$)(.*)$/)
  const reactMatch = path.match(/^\/docs\/numora-react(?:\/|$)(.*)$/)

  if (numoraMatch) {
    return numoraMatch[1] || ''
  }

  if (reactMatch) {
    return reactMatch[1] || ''
  }

  const legacyMatch = path.match(/^\/docs(?:\/|$)(.*)$/)
  if (legacyMatch) {
    return legacyMatch[1] || ''
  }

  return null
}

export function buildPackagePath(page: string, packagePrefix: PackageRoutePrefix): string {
  if (!page) {
    return `/docs/${packagePrefix}`
  }
  return `/docs/${packagePrefix}/${page}`
}

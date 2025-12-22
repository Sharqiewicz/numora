import { Link, useRouterState, useNavigate } from '@tanstack/react-router'
import {
  Rocket,
  Download,
  Shield,
  Type,
  Lock,
  Dot,
  Minimize2,
  FunctionSquare,
  Hash,
  Percent,
  Plug,
} from 'lucide-react'
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { TabsClipPath } from './TabsClipPath'
import { PackageTab, usePackage } from '@/contexts/PackageContext'
import { getPackageHref, extractPageFromPath, buildPackagePath } from '@/utils/packageRoutes'

const navigation = [
  {
    title: 'Overview',
    items: [
      {
        title: 'Get Started',
        href: '/docs',
        icon: Rocket,
      },
      {
        title: 'Installation',
        href: '/docs/installation',
        icon: Download,
      },
    ],
  },
  {
    title: 'Features',
    items: [
      {
        title: 'Sanitization',
        href: '/docs/features/sanitization',
        icon: Shield,
      },
      {
        title: 'Formatting',
        href: '/docs/features/formatting',
        icon: Type,
      },
      {
        title: 'Number Precision Safety',
        href: '/docs/features/number-precision-safety',
        icon: Lock,
      },
      {
        title: 'Decimals',
        href: '/docs/features/decimals',
        icon: Dot,
      },
      {
        title: 'Compact Notation',
        href: '/docs/features/compact-notation',
        icon: Minimize2,
      },
      {
        title: 'Scientific Notation',
        href: '/docs/features/scientific-notation',
        icon: FunctionSquare,
      },
      {
        title: 'Subscript Notation',
        href: '/docs/features/subscript-notation',
        icon: Hash,
      },
      {
        title: 'Leading Zeros',
        href: '/docs/features/leading-zeros',
        icon: Hash,
      },
      {
        title: 'Percent',
        href: '/docs/features/percent',
        icon: Percent,
      },
    ],
  },
  {
    title: 'Integrations',
    items: [
      {
        title: 'React Hook Form',
        href: '/docs/integrations/react-hook-form',
        icon: Plug,
      },
    ],
  },
]


const frameworkTabs: PackageTab[] = [
 'core', 'react', 'svelte'
]


export function DocsSidebar() {
  const router = useRouterState()
  const navigate = useNavigate()
  const currentPath = router.location.pathname
  const { selectedPackage, setSelectedPackage, getPackageRoutePrefix } = usePackage()
  const packagePrefix = getPackageRoutePrefix()

  const handlePackageChange = (tab: string) => {
    const newPackage = tab as typeof selectedPackage
    setSelectedPackage(newPackage)

    const page = extractPageFromPath(currentPath)
    if (page !== null) {
      const newPrefix = newPackage === 'react' ? 'numora-react' : 'numora'
      const newPath = buildPackagePath(page, newPrefix)
      navigate({ to: newPath })
    }
  }

  return (
    <SidebarContent>
      <TabsClipPath
        tabs={frameworkTabs}
        activeTab={selectedPackage}
        onChange={handlePackageChange}
      />
      {navigation.map((group) => {
        // Only show Integrations section for react package
        if (group.title === 'Integrations' && selectedPackage !== 'react') {
          return null
        }
        
        return (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const packageHref = getPackageHref(item.href, packagePrefix)
                  const isActive =
                    currentPath === packageHref ||
                    (packageHref !== `/docs/${packagePrefix}` && currentPath.startsWith(packageHref + '/'))
                  const Icon = item.icon
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <Link to={packageHref}>
                          <Icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )
      })}
    </SidebarContent>
  )
}

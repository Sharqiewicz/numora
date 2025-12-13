import { Link, useRouterState } from '@tanstack/react-router'
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
]

export function DocsSidebar() {
  const router = useRouterState()
  const currentPath = router.location.pathname

  return (
    <SidebarContent>
      {navigation.map((group) => (
        <SidebarGroup key={group.title}>
          <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {group.items.map((item) => {
                const isActive =
                  currentPath === item.href ||
                  (item.href !== '/docs' && currentPath.startsWith(item.href + '/'))
                const Icon = item.icon
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link to={item.href}>
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
      ))}
    </SidebarContent>
  )
}

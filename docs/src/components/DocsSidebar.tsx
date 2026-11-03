import { useEffect } from 'react';
import { Link, useRouter, useRouterState, useNavigate } from '@tanstack/react-router';
import { LayoutGroup, motion, useReducedMotion } from 'motion/react';
import {
  Rocket,
  Download,
  Shield,
  Type,
  Dot,
  Minimize2,
  FunctionSquare,
  Hash,
  Plug,
  Wand2,
  Workflow,
  FileDigit,
  Globe,
  Layers,
  Ruler,
  CheckCircle,
  Binary,
} from 'lucide-react';
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { TabsClipPath } from './TabsClipPath';
import { PackageTab, usePackage } from '@/contexts/PackageContext';
import { getPackageHref, extractPageFromPath, buildPackagePath } from '@/utils/packageRoutes';

const navigation = [
  {
    title: 'Overview',
    items: [
      {
        title: 'Get started',
        href: '/docs',
        icon: Rocket,
      },
      {
        title: 'Installation',
        href: '/docs/installation',
        icon: Download,
      },
      {
        title: 'How it works',
        href: '/docs/how-it-works',
        icon: Workflow,
      },
      {
        title: 'Anatomy',
        href: '/docs/anatomy',
        icon: Layers,
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
        title: 'Value types',
        href: '/docs/features/value-types',
        icon: FileDigit,
      },
      {
        title: 'Decimals',
        href: '/docs/features/decimals',
        icon: Dot,
      },
      {
        title: 'Locale',
        href: '/docs/features/locale',
        icon: Globe,
      },
      {
        title: 'Compact notation',
        href: '/docs/features/compact-notation',
        icon: Minimize2,
      },
      {
        title: 'Scientific notation',
        href: '/docs/features/scientific-notation',
        icon: FunctionSquare,
      },
      {
        title: 'Leading zeros',
        href: '/docs/features/leading-zeros',
        icon: Hash,
      },
      {
        title: 'Max length',
        href: '/docs/features/max-length',
        icon: Ruler,
      },
      {
        title: 'Validation',
        href: '/docs/features/validation',
        icon: CheckCircle,
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
        packages: ['react'] as PackageTab[],
      },
      {
        title: 'Torph',
        href: '/docs/integrations/torph',
        icon: Wand2,
      },
      {
        title: 'NumberFlow',
        href: '/docs/integrations/number-flow',
        icon: Binary,
      },
    ],
  },
  {
    title: 'Frameworks',
    items: [
      {
        title: 'Svelte',
        href: '/docs/frameworks/svelte',
        icon: Layers,
        packages: ['core'] as PackageTab[],
      },
      {
        title: 'Vue',
        href: '/docs/frameworks/vue',
        icon: Globe,
        packages: ['core'] as PackageTab[],
      },
      {
        title: 'Angular',
        href: '/docs/frameworks/angular',
        icon: Workflow,
        packages: ['core'] as PackageTab[],
      },
      {
        title: 'Solid',
        href: '/docs/frameworks/solid',
        icon: Plug,
        packages: ['core'] as PackageTab[],
      },
    ],
  },
];

const frameworkTabs: PackageTab[] = ['core', 'react'];

export function DocsSidebar() {
  const router = useRouterState();
  const navigate = useNavigate();
  const { routesByPath } = useRouter();
  const currentPath = router.location.pathname;
  const { selectedPackage, setSelectedPackage, getPackageRoutePrefix } = usePackage();
  const packagePrefix = getPackageRoutePrefix();
  const shouldReduceMotion = useReducedMotion();
  const { setOpenMobile } = useSidebar();

  // Close the mobile sheet once a link has navigated, so the new page isn't
  // left hidden behind it.
  // biome-ignore lint/correctness/useExhaustiveDependencies: currentPath is the trigger, not an input
  useEffect(() => {
    setOpenMobile(false);
  }, [currentPath, setOpenMobile]);

  const handlePackageChange = (tab: string) => {
    const newPackage = tab as typeof selectedPackage;
    setSelectedPackage(newPackage);

    const page = extractPageFromPath(currentPath);
    if (page !== null) {
      const newPrefix = newPackage === 'react' ? 'numora-react' : 'numora';
      const newPath = buildPackagePath(page, newPrefix);
      // Some pages exist for one package only (frameworks/*, react-hook-form);
      // fall back to the package index instead of navigating to a 404.
      const exists = newPath in routesByPath || `${newPath}/` in routesByPath;
      navigate({ to: exists ? newPath : buildPackagePath('', newPrefix) });
    }
  };

  return (
    <SidebarContent role="navigation" aria-label="Documentation">
      <TabsClipPath
        tabs={frameworkTabs}
        activeTab={selectedPackage}
        onChange={handlePackageChange}
      />
      <LayoutGroup>
        {navigation.map((group) => {
          // Filter items by selected package (items with no `packages` field are shown for all)
          const visibleItems = group.items.filter(
            (item) =>
              !('packages' in item) ||
              (item as { packages?: PackageTab[] }).packages?.includes(selectedPackage)
          );
          if (visibleItems.length === 0) return null;

          return (
            <SidebarGroup key={group.title}>
              <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {visibleItems.map((item) => {
                    const packageHref = getPackageHref(item.href, packagePrefix);
                    const isActive =
                      currentPath === packageHref ||
                      (packageHref !== `/docs/${packagePrefix}` &&
                        currentPath.startsWith(packageHref + '/'));
                    const Icon = item.icon;
                    return (
                      <SidebarMenuItem key={item.href}>
                        {isActive &&
                          (shouldReduceMotion ? (
                            <span
                              aria-hidden
                              className="absolute inset-0 -z-10 rounded-xl bg-sidebar-accent"
                            />
                          ) : (
                            <motion.span
                              aria-hidden
                              layoutId="docs-nav-active"
                              className="absolute inset-0 -z-10 rounded-xl bg-sidebar-accent"
                              transition={{ type: 'tween', duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                            />
                          ))}
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          className="data-[active=true]:bg-transparent max-md:h-10"
                        >
                          <Link to={packageHref}>
                            <Icon />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </LayoutGroup>
    </SidebarContent>
  );
}

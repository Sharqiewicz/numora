import { Link, useNavigate, useRouter, useRouterState } from '@tanstack/react-router';
import { LayoutGroup, motion, useReducedMotion } from 'motion/react';
import { useEffect } from 'react';
import {
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { usePackage } from '@/contexts/PackageContext';
import { buildPackagePath, extractPageFromPath, getPackageHref } from '@/utils/packageRoutes';
import { getVisibleNavigation } from './docs-nav';
import { Socials } from './socials';
import { TabsClipPath } from './TabsClipPath';

const frameworkTabs = ['core', 'react'];

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
    <>
      <SidebarHeader className="gap-3 px-4 py-3">
        <Link to="/" aria-label="Numora home">
          <span
            className="
              block text-4xl font-numora
              transition-[color,filter] duration-300
              [@media(hover:hover)]:hover:drop-shadow-[0_2px_20px_oklch(0.694_0.131_276.5_/_0.5)]
            "
          >
            numora.
          </span>
        </Link>
        <TabsClipPath
          tabs={frameworkTabs}
          activeTab={selectedPackage}
          onChange={handlePackageChange}
        />
      </SidebarHeader>
      <SidebarContent role="navigation" aria-label="Documentation" className="docs-sidebar-scroll">
        <LayoutGroup>
          {getVisibleNavigation(selectedPackage).map((group) => {
            const visibleItems = group.items;

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
                                transition={{
                                  type: 'tween',
                                  duration: 0.2,
                                  ease: [0.16, 1, 0.3, 1],
                                }}
                              />
                            ))}
                          <SidebarMenuButton
                            asChild
                            isActive={isActive}
                            className="data-[active=true]:bg-transparent max-md:h-11"
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
      <SidebarFooter className="px-4 py-4 max-md:hidden">
        <Socials />
      </SidebarFooter>
    </>
  );
}

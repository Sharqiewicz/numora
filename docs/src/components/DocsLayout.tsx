import { useEffect, useState } from 'react';
import { useLocation } from '@tanstack/react-router';
import {
  Sidebar,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { DocsSidebar } from '@/components/DocsSidebar';
import { Link } from '@tanstack/react-router';
import { Socials } from './socials';
import { useIsMobile } from '@/hooks/use-mobile';
import { PackageProvider } from '@/contexts/PackageContext';

export function DocsLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  const location = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayChildren, setDisplayChildren] = useState(children);

  // Handle page transitions
  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (prefersReducedMotion) {
      setDisplayChildren(children);
      return;
    }

    setIsTransitioning(true);

    // Short delay for exit animation
    const exitTimer = setTimeout(() => {
      setDisplayChildren(children);
      setIsTransitioning(false);
    }, 150);

    return () => clearTimeout(exitTimer);
  }, [location.pathname, children]);

  return (
    <PackageProvider>
      <SidebarProvider defaultOpen={true} open={true}>
        <Sidebar collapsible={isMobile ? 'offcanvas' : 'none'}>
          <SidebarHeader className="px-4 py-3">
            <Link to="/">
              <h2
                className="
                  text-4xl font-numora
                  transition-all duration-300
                  hover:text-secondary hover:drop-shadow-[0_0_10px_rgba(167,139,250,0.5)]
                "
              >
                numora
              </h2>
            </Link>
          </SidebarHeader>
          <DocsSidebar />
        </Sidebar>
        <SidebarInset>
          <header className="container mx-auto max-w-3xl px-4 py-8 flex items-center justify-between md:justify-end">
            <div className="md:hidden">
              <SidebarTrigger />
            </div>
            <Socials className="justify-end" />
          </header>
          <main className="flex-1 overflow-y-auto">
            <div
              className={`
                container mx-auto max-w-3xl px-4 py-8
                transition-all duration-300 ease-out
                ${isTransitioning
                  ? 'opacity-0 translate-y-2'
                  : 'opacity-100 translate-y-0'
                }
              `}
            >
              {displayChildren}
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </PackageProvider>
  );
}

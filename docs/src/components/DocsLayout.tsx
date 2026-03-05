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

    // Start exit (opacity fade-out, 120ms) - no translate to avoid layout mismatch with sidebar
    setIsTransitioning(true);

    // Wait for exit to finish before swapping content (exit duration = 120ms)
    const exitTimer = setTimeout(() => {
      setDisplayChildren(children);
      setIsTransitioning(false);
    }, 130);

    return () => clearTimeout(exitTimer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return (
    <PackageProvider>
      <SidebarProvider defaultOpen={true} open={true}>
        <Sidebar collapsible={isMobile ? 'offcanvas' : 'none'}>
          <SidebarHeader className="px-4 py-3">
            <Link to="/">
              <h2
                className="
                  text-4xl font-numora
                  transition-[color,filter] duration-300
                  [@media(hover:hover)]:hover:drop-shadow-[0_2px_20px_rgba(167,139,250,0.5)]
                "
              >
                numora.
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
          <main className="flex-1">
            <div
              className={`
                container mx-auto max-w-3xl px-4 py-8
                transition-opacity ease-out
                ${isTransitioning
                  ? 'opacity-0 duration-[120ms]'
                  : 'opacity-100 duration-200'
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

import { useEffect, useRef } from 'react';
import { Link, useLocation } from '@tanstack/react-router';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  Sidebar,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { DocsSidebar } from '@/components/DocsSidebar';
import { Socials } from './socials';
import { useIsMobile } from '@/hooks/use-mobile';
import { PackageProvider } from '@/contexts/PackageContext';

export function DocsLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  const location = useLocation();
  const prefersReducedMotion = useReducedMotion();

  // Tracks the previous pathname so we only reset scroll on real page
  // navigations, never on the first mount and never on hash-only changes
  // (hash changes don't touch location.pathname, so this effect won't fire).
  const previousPathnameRef = useRef(location.pathname);
  const shouldResetScrollRef = useRef(false);

  useEffect(() => {
    if (previousPathnameRef.current !== location.pathname) {
      shouldResetScrollRef.current = true;
      previousPathnameRef.current = location.pathname;
    }
  }, [location.pathname]);

  const handleExitComplete = () => {
    if (shouldResetScrollRef.current) {
      shouldResetScrollRef.current = false;
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    }
  };

  const pageVariants = {
    initial: prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 6 },
    animate: {
      opacity: 1,
      y: 0,
      transition: prefersReducedMotion
        ? { duration: 0.12, ease: 'easeOut' as const }
        : { duration: 0.24, ease: [0.16, 1, 0.3, 1] as const },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.12, ease: 'easeOut' as const },
    },
  } as const;

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
                  [@media(hover:hover)]:hover:drop-shadow-[0_2px_20px_oklch(0.694_0.131_276.5_/_0.5)]
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
            <AnimatePresence mode="wait" initial={false} onExitComplete={handleExitComplete}>
              <motion.div
                key={location.pathname}
                className="container mx-auto max-w-3xl px-4 py-8"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </PackageProvider>
  );
}

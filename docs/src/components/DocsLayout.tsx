import { useEffect, useRef } from 'react';
import { Link, useLocation, useRouter } from '@tanstack/react-router';
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

  const router = useRouter();

  // Tracks the previous pathname so we only reset scroll on real page
  // navigations, never on the first mount and never on hash-only changes
  // (hash changes don't touch location.pathname, so this effect won't fire).
  const previousPathnameRef = useRef(location.pathname);
  const shouldResetScrollRef = useRef(false);

  // The page swap waits for the exit fade, so the router's own scroll
  // restoration runs while the old page is still mounted. Remember each history
  // entry's scroll position ourselves and apply it once the new page is in:
  // Back/Forward return to where the reader was, link clicks start at the top.
  const scrollByEntryRef = useRef(new Map<string, number>());
  const targetScrollYRef = useRef(0);

  useEffect(() => {
    let currentKey = router.history.location.state.__TSR_key;
    return router.history.subscribe(({ location: next, action }) => {
      if (currentKey) scrollByEntryRef.current.set(currentKey, window.scrollY);
      const nextKey = next.state.__TSR_key;
      targetScrollYRef.current =
        action.type === 'PUSH' || action.type === 'REPLACE' || !nextKey
          ? 0
          : (scrollByEntryRef.current.get(nextKey) ?? 0);
      currentKey = nextKey;
    });
  }, [router]);

  useEffect(() => {
    if (previousPathnameRef.current !== location.pathname) {
      shouldResetScrollRef.current = true;
      previousPathnameRef.current = location.pathname;
    }
  }, [location.pathname]);

  const handleExitComplete = () => {
    if (shouldResetScrollRef.current) {
      shouldResetScrollRef.current = false;
      window.scrollTo({ top: targetScrollYRef.current, behavior: 'instant' as ScrollBehavior });
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
        {/* `isMobile` is false on the server, so the inline sidebar is hidden
            below md in CSS to keep phones from painting it before hydration. */}
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:text-foreground focus:shadow-border"
        >
          Skip to content
        </a>
        <Sidebar
          collapsible={isMobile ? 'offcanvas' : 'none'}
          className={isMobile ? undefined : 'hidden md:flex'}
        >
          <SidebarHeader className="px-4 py-3">
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
          {/* biome-ignore lint/correctness/useUniqueElementIds: the layout mounts once; this is the skip-link target */}
          <div id="content" className="flex-1">
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
          </div>
        </SidebarInset>
      </SidebarProvider>
    </PackageProvider>
  );
}

import { useLocation, useRouter } from '@tanstack/react-router';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { DocsSidebar } from '@/components/DocsSidebar';
import { Sidebar, SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { PackageProvider } from '@/contexts/PackageContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { ArticleHeadings } from './ArticleHeadings';
import { DocsPager } from './DocsPager';
import { DocsToc, type TocHeading } from './DocsToc';
import { Socials } from './socials';

export function DocsLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  const location = useLocation();

  const router = useRouter();
  const [headings, setHeadings] = useState<TocHeading[]>([]);
  const isFirstPageRef = useRef(true);
  useEffect(() => {
    isFirstPageRef.current = false;
  }, []);

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

  // Docs navigation is high-frequency: opacity only, short on the way out so
  // the next page isn't kept waiting.
  const pageVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.12, ease: 'easeOut' as const } },
    exit: { opacity: 0, transition: { duration: 0.08, ease: 'easeOut' as const } },
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
          <DocsSidebar />
        </Sidebar>
        <SidebarInset>
          <header className="flex items-center justify-between px-4 py-3 md:hidden">
            <SidebarTrigger />
            <Socials />
          </header>
          {/* biome-ignore lint/correctness/useUniqueElementIds: the layout mounts once; this is the skip-link target */}
          <div id="content" className="flex-1 px-4 py-8 md:py-16">
            {/* Article and table of contents read as one centred block. */}
            <div className="mx-auto grid max-w-full xl:pr-20 justify-center gap-x-16 grid-cols-[minmax(0,36rem)] xl:grid-cols-[minmax(0,36rem)_13rem]">
              <AnimatePresence mode="wait" initial={false} onExitComplete={handleExitComplete}>
                <motion.div
                  key={location.pathname}
                  className="min-w-0"
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  {children}
                  <DocsPager />
                  <ArticleHeadings
                    onHeadings={setHeadings}
                    isInitialLoad={isFirstPageRef.current}
                  />
                </motion.div>
              </AnimatePresence>
              <DocsToc headings={headings} />
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </PackageProvider>
  );
}

import { Link, useLocation } from '@tanstack/react-router';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { usePackage } from '@/contexts/PackageContext';
import { getFlatNavigation } from './docs-nav';

const linkClass =
  'group flex min-h-11 flex-col gap-0.5 rounded-xl border border-border px-4 py-3 outline-hidden ring-ring transition-[background-color,color] duration-150 ease-out-expo focus-visible:ring-2 [@media(hover:hover)]:hover:bg-surface-3';

export function DocsPager() {
  const { pathname } = useLocation();
  const { selectedPackage, getPackageRoutePrefix } = usePackage();
  const items = getFlatNavigation(selectedPackage, getPackageRoutePrefix());
  const path = pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname;
  const index = items.findIndex((item) => item.href === path);
  if (index === -1) return null;
  const prev = items[index - 1];
  const next = items[index + 1];
  if (!prev && !next) return null;

  return (
    <nav
      aria-label="Pagination"
      className="mt-16 grid grid-cols-2 gap-3 border-t border-border pt-8"
    >
      {prev ? (
        <Link to={prev.href} rel="prev" className={linkClass}>
          <span className="flex items-center gap-1.5 text-caption text-muted-foreground">
            <ArrowLeft className="size-3.5" aria-hidden /> Previous
          </span>
          <span className="text-sm text-foreground">{prev.title}</span>
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link to={next.href} rel="next" className={`${linkClass} items-end text-right`}>
          <span className="flex items-center gap-1.5 text-caption text-muted-foreground">
            Next <ArrowRight className="size-3.5" aria-hidden />
          </span>
          <span className="text-sm text-foreground">{next.title}</span>
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}

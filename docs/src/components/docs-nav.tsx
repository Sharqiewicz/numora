import {
  Binary,
  CheckCircle,
  ClipboardList,
  DecimalsArrowRight,
  Download,
  FileDigit,
  FunctionSquare,
  Globe,
  Hash,
  Layers,
  Minimize2,
  Rocket,
  Ruler,
  Shield,
  Type,
  Wand2,
  Workflow,
} from 'lucide-react';
import type { ComponentType } from 'react';
import type { PackageRoutePrefix, PackageTab } from '@/contexts/PackageContext';
import { getPackageHref } from '@/utils/packageRoutes';
import { AngularLogo, SolidLogo, SvelteLogo, VueLogo } from './FrameworkLogos';

// Framework marks are multi-colour brand art. Inside the nav they're flattened
// to one grey and sized to the 16px lucide grid so they read as part of the
// same icon family instead of four coloured stickers.
function flatten(Logo: ComponentType): ComponentType {
  const Flat = () => (
    <span
      aria-hidden
      className="inline-flex size-4 shrink-0 items-center justify-center opacity-70 grayscale [&>svg]:size-4"
    >
      <Logo />
    </span>
  );
  return Flat;
}

const Svelte = flatten(SvelteLogo);
const Vue = flatten(VueLogo);
const Angular = flatten(AngularLogo);
const Solid = flatten(SolidLogo);

export interface DocsNavItem {
  title: string;
  href: string;
  icon: ComponentType;
  packages?: PackageTab[];
}

export interface DocsNavGroup {
  title: string;
  items: DocsNavItem[];
}

export const docsNavigation: DocsNavGroup[] = [
  {
    title: 'Overview',
    items: [
      { title: 'Get started', href: '/docs', icon: Rocket },
      { title: 'Installation', href: '/docs/installation', icon: Download },
      { title: 'How it works', href: '/docs/how-it-works', icon: Workflow },
      { title: 'Anatomy', href: '/docs/anatomy', icon: Layers },
    ],
  },
  {
    title: 'Features',
    items: [
      { title: 'Sanitization', href: '/docs/features/sanitization', icon: Shield },
      { title: 'Formatting', href: '/docs/features/formatting', icon: Type },
      { title: 'Value types', href: '/docs/features/value-types', icon: FileDigit },
      { title: 'Decimals', href: '/docs/features/decimals', icon: DecimalsArrowRight },
      { title: 'Locale', href: '/docs/features/locale', icon: Globe },
      { title: 'Compact notation', href: '/docs/features/compact-notation', icon: Minimize2 },
      {
        title: 'Scientific notation',
        href: '/docs/features/scientific-notation',
        icon: FunctionSquare,
      },
      { title: 'Leading zeros', href: '/docs/features/leading-zeros', icon: Hash },
      { title: 'Max length', href: '/docs/features/max-length', icon: Ruler },
      { title: 'Validation', href: '/docs/features/validation', icon: CheckCircle },
    ],
  },
  {
    title: 'Integrations',
    items: [
      {
        title: 'React Hook Form',
        href: '/docs/integrations/react-hook-form',
        icon: ClipboardList,
        packages: ['react'],
      },
      { title: 'Torph', href: '/docs/integrations/torph', icon: Wand2 },
      { title: 'NumberFlow', href: '/docs/integrations/number-flow', icon: Binary },
    ],
  },
  {
    title: 'Frameworks',
    items: [
      { title: 'Svelte', href: '/docs/frameworks/svelte', icon: Svelte, packages: ['core'] },
      { title: 'Vue', href: '/docs/frameworks/vue', icon: Vue, packages: ['core'] },
      { title: 'Angular', href: '/docs/frameworks/angular', icon: Angular, packages: ['core'] },
      { title: 'Solid', href: '/docs/frameworks/solid', icon: Solid, packages: ['core'] },
    ],
  },
];

export function getVisibleNavigation(selectedPackage: PackageTab): DocsNavGroup[] {
  return docsNavigation
    .map((group) => ({
      ...group,
      // Items with no `packages` field are shown for every package.
      items: group.items.filter(
        (item) => !item.packages || item.packages.includes(selectedPackage)
      ),
    }))
    .filter((group) => group.items.length > 0);
}

export interface FlatNavItem {
  title: string;
  href: string;
}

export function getFlatNavigation(
  selectedPackage: PackageTab,
  packagePrefix: PackageRoutePrefix
): FlatNavItem[] {
  return getVisibleNavigation(selectedPackage).flatMap((group) =>
    group.items.map((item) => ({
      title: item.title,
      href: getPackageHref(item.href, packagePrefix),
    }))
  );
}

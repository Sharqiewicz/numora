import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import {
  Clipboard,
  MousePointer2,
  FlaskConical,
  Smartphone,
  Percent,
  Hash,
  Code,
} from 'lucide-react';

interface Section {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const SECTIONS: Section[] = [
  { id: 'paste-chaos', label: 'Paste', icon: Clipboard },
  { id: 'cursor-position', label: 'Cursor', icon: MousePointer2 },
  { id: 'scientific-notation', label: 'Scientific', icon: FlaskConical },
  { id: 'mobile-keyboard', label: 'Mobile', icon: Smartphone },
  { id: 'decimal-dilemma', label: 'Decimals', icon: Percent },
  { id: 'thousand-separators', label: 'Formatting', icon: Hash },
  { id: 'number-type-lie', label: 'type="number"', icon: Code },
];

export function SectionNav() {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -70% 0px',
      threshold: 0,
    };

    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, observerOptions);

    SECTIONS.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    const handleScroll = () => {
      const firstSection = document.getElementById(SECTIONS[0].id);
      if (firstSection) {
        const rect = firstSection.getBoundingClientRect();
        setIsVisible(rect.top < window.innerHeight * 0.8);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50',
        'bg-background/80 backdrop-blur-lg border-b border-border',
        'transition-all duration-300',
        isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <a
            href="/"
            className="font-numora text-xl text-secondary hover:opacity-80 transition-opacity hidden sm:block"
          >
            numora.
          </a>

          <div className="flex-1 sm:flex-initial overflow-x-auto scrollbar-hide">
            <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-0">
              {SECTIONS.map(({ id, label, icon: Icon }) => (
                <a
                  key={id}
                  href={`#${id}`}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium',
                    'transition-colors duration-200 whitespace-nowrap',
                    activeSection === id
                      ? 'bg-secondary text-secondary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{label}</span>
                  <span className="sm:hidden">
                    {SECTIONS.findIndex((s) => s.id === id) + 1}
                  </span>
                </a>
              ))}
            </div>
          </div>

          <div className="hidden sm:block w-[80px]" />
        </div>
      </div>
    </nav>
  );
}

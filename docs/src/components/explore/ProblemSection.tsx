import { useScrollReveal } from '@/hooks/use-scroll-reveal';
import { Badge } from '@/components/ui/badge';

interface ProblemSectionProps {
  id: string;
  problemNumber: number;
  title: string;
  subtitle: string;
  description: React.ReactNode;
  children: React.ReactNode;
}

export function ProblemSection({
  id,
  problemNumber,
  title,
  subtitle,
  description,
  children,
}: ProblemSectionProps) {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.1 });

  return (
    <section
      id={id}
      ref={ref}
      className="w-full py-16 sm:py-24 scroll-mt-20"
    >
      <div
        className={`
          max-w-5xl mx-auto px-4 sm:px-8
          scroll-reveal ${isVisible ? 'is-visible' : ''}
        `}
      >
        <div className="text-center mb-10">
          <Badge variant="orange" className="mb-4">
            Problem #{problemNumber}
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-semibold mb-2">
            {title}
          </h2>
          <p className="text-lg text-secondary font-medium mb-4">
            {subtitle}
          </p>
          <div className="text-muted-foreground max-w-2xl mx-auto">
            {description}
          </div>
        </div>

        <div
          className={`
            scroll-reveal ${isVisible ? 'is-visible' : ''}
          `}
          style={{ transitionDelay: '0.15s' }}
        >
          {children}
        </div>
      </div>
    </section>
  );
}

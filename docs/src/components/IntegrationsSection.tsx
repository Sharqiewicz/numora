import { Link } from '@tanstack/react-router';
import type { CSSProperties } from 'react';
import GlareHover from '@/components/GlareHover';
import { TorphDemo } from '@/components/TorphDemo';

const integrations = [
  {
    title: 'Torph + Numora',
    description: 'Animation library by Lochie Axon',
    href: '/docs/numora-react/integrations/torph',
  },
  {
    title: 'React Hook Form + Numora',
    description: 'Controller with validation and form state.',
    href: '/docs/numora-react/integrations/react-hook-form',
  },
];

export function IntegrationsSection({ style }: { style?: CSSProperties }) {
  return (
    <section
      className="container mx-auto px-4 sm:px-8 pt-16 pb-8 animate-fade-in opacity-0"
      style={style}
    >
      <div className="text-center mb-10">
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">Composes with your stack</h2>
        <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
          Numora is a thin layer over <code className="text-secondary">&lt;input&gt;</code>.
        </p>
        <p className="text-muted-foreground max-w-xl mx-auto">
          You can pair it with form and animation libraries.
        </p>
      </div>

      <div className="max-w-xl mx-auto">
        <TorphDemo />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 max-w-2xl mx-auto mb-16">
        {integrations.map(({ title, description, href }) => (
          <GlareHover
            key={href}
            glareColor="#ffffff"
            glareOpacity={0.2}
            glareAngle={-30}
            glareSize={200}
            transitionDuration={400}
            className="group rounded-xl border border-surface-3 bg-surface-1/60 hover:bg-surface-1 hover:border-surface-6 transition-colors p-5 flex flex-col gap-3 w-full h-full items-stretch justify-start"
          >
            <Link to={href} className="flex flex-col gap-3 w-full h-full">
              <div>
                <h3 className="font-semibold text-white">{title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{description}</p>
              </div>
              <span className="text-xs text-secondary/80 group-hover:text-secondary mt-auto">Read the guide →</span>
            </Link>
          </GlareHover>
        ))}
      </div>
    </section>
  );
}

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

const frameworks = [
  { name: 'React', href: '/docs/numora-react' },
  { name: 'Vue', href: '/docs/numora/frameworks/vue' },
  { name: 'Svelte', href: '/docs/numora/frameworks/svelte' },
  { name: 'Angular', href: '/docs/numora/frameworks/angular' },
  { name: 'Solid', href: '/docs/numora/frameworks/solid' },
  { name: 'Vanilla JS', href: '/docs/numora' },
];

export function IntegrationsSection({ style }: { style?: CSSProperties }) {
  return (
    <section
      className="container mx-auto px-4 sm:px-8 pt-16 pb-8 animate-fade-in opacity-0"
      style={style}
    >


      <div className="max-w-2xl mx-auto mb-24 text-center">
        <h3 className="text-lg sm:text-xl font-semibold tracking-tight mb-3">Works with any framework</h3>
        <p className="text-sm text-muted-foreground mb-5">
          Numora&apos;s core is vanilla TypeScript - a thin adapter is all you need. And every framework can{' '}
          <Link to="/docs/numora/integrations/torph" className="text-secondary hover:underline">animate digits with Torph</Link>.
        </p>
        <ul className="flex flex-wrap justify-center gap-2">
          {frameworks.map(({ name, href }) => (
            <li key={href}>
              <Link
                to={href}
                className="inline-flex items-center rounded-full border border-surface-3 bg-surface-1/60 hover:bg-surface-1 hover:border-surface-6 transition-colors px-3 py-1.5 text-sm text-white"
              >
                {name}
              </Link>
            </li>
          ))}
        </ul>
      </div>

            <div className="text-center mb-10">
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">Animations</h2>
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

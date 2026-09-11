import { useState } from 'react';
import { MorphCodeBlock, morphButtonClass } from '@/components/MorphCodeBlock';

const PACKAGE_MANAGERS = [
  { name: 'pnpm', command: 'pnpm add' },
  { name: 'npm', command: 'npm install' },
  { name: 'yarn', command: 'yarn add' },
  { name: 'bun', command: 'bun add' },
] as const;

interface InstallTabsProps {
  /** Package name(s) to install, e.g. `"numora"` or `"numora numora-react"`. */
  packages: string;
}

/**
 * Package-manager switcher whose install command morphs between managers
 * using the same Torph animation as the framework usage section on the home page.
 */
export function InstallTabs({ packages }: InstallTabsProps) {
  const [index, setIndex] = useState(0);
  const manager = PACKAGE_MANAGERS[index];
  const command = `${manager.command} ${packages}`;

  return (
    <div className="not-prose my-6 w-full">
      <div className="flex flex-wrap items-center gap-2 pb-4">
        {PACKAGE_MANAGERS.map((pm, i) => (
          <button
            key={pm.name}
            type="button"
            aria-pressed={index === i}
            onClick={() => setIndex(i)}
            aria-label={`Install with ${pm.name}`}
            className={morphButtonClass}
          >
            {pm.name}
          </button>
        ))}
      </div>
      <MorphCodeBlock code={command} language="bash" />
    </div>
  );
}

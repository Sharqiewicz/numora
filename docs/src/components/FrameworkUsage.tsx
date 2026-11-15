import { Link } from '@tanstack/react-router';
import { type ReactNode, useState } from 'react';
import { TextMorph } from 'torph/react';
import {
  AngularLogo,
  JavaScriptLogo,
  ReactLogo,
  SolidLogo,
  SvelteLogo,
  VueLogo,
} from '@/components/FrameworkLogos';
import { MorphCodeBlock, morphButtonClass } from '@/components/MorphCodeBlock';

// Home-page "Usage" switcher, modelled on the one at https://torph.lochie.me:
// a row of framework buttons and a single code block whose text morphs
// (via Torph) between the framework snippets instead of being swapped.

interface Framework {
  name: string;
  logo: ReactNode;
  href: string;
  example: string;
  language: string;
}

const FRAMEWORKS: Framework[] = [
  {
    name: 'React',
    language: 'tsx',
    logo: <ReactLogo />,
    href: '/docs/numora-react',
    example: `import { NumoraInput } from 'numora-react'

<NumoraInput
  decimalMaxLength={2}
  onValueChange={({ value }) => console.log(value)}
/>`,
  },
  {
    name: 'Vanilla JS',
    language: 'typescript',
    logo: <JavaScriptLogo />,
    href: '/docs/numora',
    example: `import { NumoraInput } from 'numora'

new NumoraInput(document.querySelector<HTMLInputElement>('#amount')!, {
  decimalMaxLength: 2,
})`,
  },
  {
    name: 'Vue',
    language: 'tsx',
    logo: <VueLogo />,
    href: '/docs/numora/frameworks/vue',
    example: `import { NumoraInput } from 'numora'

// v-numora directive
const instances = new WeakMap()
export const vNumora = {
  mounted: (el, { value }) => instances.set(el, new NumoraInput(el, value ?? {})),
  unmounted: (el) => instances.get(el)?.destroy(),
}

<input v-numora="{ decimalMaxLength: 2 }" />`,
  },
  {
    name: 'Svelte',
    language: 'tsx',
    logo: <SvelteLogo />,
    href: '/docs/numora/frameworks/svelte',
    example: `import { NumoraInput } from 'numora'

// use:numora action
export function numora(node, options) {
  const instance = new NumoraInput(node, options)
  return { destroy: () => instance.destroy() }
}

<input use:numora={{ decimalMaxLength: 2 }} />`,
  },
  {
    name: 'Angular',
    language: 'tsx',
    logo: <AngularLogo />,
    href: '/docs/numora/frameworks/angular',
    example: `import { NumoraInput } from 'numora'

@Directive({ selector: 'input[numora]', standalone: true })
export class NumoraDirective implements OnInit, OnDestroy {
  private el = inject(ElementRef<HTMLInputElement>)
  private instance?: NumoraInput
  ngOnInit() { this.instance = new NumoraInput(this.el.nativeElement, { decimalMaxLength: 2 }) }
  ngOnDestroy() { this.instance?.destroy() }
}

<input numora />`,
  },
  {
    name: 'Solid',
    language: 'tsx',
    logo: <SolidLogo />,
    href: '/docs/numora/frameworks/solid',
    example: `import { NumoraInput } from 'numora'
import { onCleanup } from 'solid-js'

// use:numora directive
export function numora(el, options) {
  const instance = new NumoraInput(el, options() ?? {})
  onCleanup(() => instance.destroy())
}

<input use:numora={{ decimalMaxLength: 2 }} />`,
  },
];

export function FrameworkUsage() {
  const [index, setIndex] = useState(0);
  const framework = FRAMEWORKS[index % FRAMEWORKS.length];

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center gap-2 pb-4">
        {FRAMEWORKS.map((f, i) => (
          <button
            key={f.name}
            type="button"
            // Not `disabled`: that drops the selected one from the tab order.
            aria-pressed={index === i}
            onClick={() => setIndex(i)}
            aria-label={`View example for ${f.name}`}
            className={morphButtonClass}
          >
            <span className="flex items-center">{f.logo}</span>
            <span className="max-[480px]:hidden">{f.name}</span>
          </button>
        ))}
      </div>

      <MorphCodeBlock code={framework.example} language={framework.language} />

      <p className="mt-3 text-xs text-muted-foreground">
        <Link to={framework.href} className="hover:text-white transition-colors duration-200">
          <TextMorph>{`Read the ${framework.name} guide`}</TextMorph> →
        </Link>
      </p>
    </div>
  );
}

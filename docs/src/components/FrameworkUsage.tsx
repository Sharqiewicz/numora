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
    example: `import { NumoraInput, FormatOn } from 'numora-react'

<NumoraInput
  formatOn={FormatOn.Change}
  maxDecimals={2}
  onChange={(e) => console.log(e.target.value)}
/>`,
  },
  {
    name: 'Vanilla JS',
    language: 'typescript',
    logo: <JavaScriptLogo />,
    href: '/docs/numora',
    example: `import { NumoraInput } from 'numora'

new NumoraInput(document.querySelector('#amount'), {
  maxDecimals: 2,
  thousandSeparator: ',',
})`,
  },
  {
    name: 'Vue',
    language: 'tsx',
    logo: <VueLogo />,
    href: '/docs/numora/frameworks/vue',
    example: `import { NumoraInput } from 'numora'

// v-numora directive
export const vNumora = {
  mounted: (el, { value }) => new NumoraInput(el, value ?? {}),
}

<input v-numora="{ maxDecimals: 2 }" />`,
  },
  {
    name: 'Svelte',
    language: 'tsx',
    logo: <SvelteLogo />,
    href: '/docs/numora/frameworks/svelte',
    example: `import { NumoraInput } from 'numora'

// use:numora action
export function numora(node, options) {
  new NumoraInput(node, options)
}

<input use:numora={{ maxDecimals: 2 }} />`,
  },
  {
    name: 'Angular',
    language: 'tsx',
    logo: <AngularLogo />,
    href: '/docs/numora/frameworks/angular',
    example: `import { NumoraInput } from 'numora'

@Directive({ selector: 'input[numora]', standalone: true })
export class NumoraDirective implements OnInit {
  private el = inject(ElementRef<HTMLInputElement>)
  ngOnInit() { new NumoraInput(this.el.nativeElement, { maxDecimals: 2 }) }
}

<input numora />`,
  },
  {
    name: 'Solid',
    language: 'tsx',
    logo: <SolidLogo />,
    href: '/docs/numora/frameworks/solid',
    example: `import { NumoraInput } from 'numora'

// use:numora directive
export function numora(el, options) {
  new NumoraInput(el, options() ?? {})
}

<input use:numora={{ maxDecimals: 2 }} />`,
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

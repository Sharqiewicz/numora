import { createFileRoute } from '@tanstack/react-router'
import {
  BeforeInputSection,
  CursorPreservationSection,
  DefaultVsValueSection,
  DropInUsageSection,
  EventPipelineSection,
  FloatVsStringSection,
  FormatModeSection,
  GroupingStylesSection,
  Hero,
  KeydownSection,
  NativeInputSection,
  PasteSection,
  PlainVsNumoraSection,
  ProxyTargetSection,
  RawVsFormattedSection,
  ReactSyntheticBypassSection,
  SanitizationSection,
  UserInputSection,
} from '@/components/anatomy/sections'

const TITLE =
  'Anatomy of NumoraInput - React Numeric Input Internals, beforeinput Bypass, and Proxy Targets'
const DESCRIPTION =
  "A guided dissection of the React NumoraInput component: the HTML input primitive, the four native events, IEEE 754 pitfalls, the seven-step sanitization pipeline, why beforeinput cannot use React's synthetic event delegation, defaultValue vs value, and the Proxy on e.target."

export const Route = createFileRoute('/docs/numora-react/anatomy')({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: 'description', content: DESCRIPTION },
      { property: 'og:title', content: TITLE },
      { property: 'og:description', content: DESCRIPTION },
      { property: 'og:url', content: 'https://numeric-input.com/docs/numora-react/anatomy' },
      { name: 'twitter:title', content: 'Anatomy of NumoraInput' },
      { name: 'twitter:description', content: DESCRIPTION },
    ],
    links: [
      { rel: 'canonical', href: 'https://numeric-input.com/docs/numora-react/anatomy' },
    ],
    scripts: [
      {
        type: 'application/ld+json',
        children: JSON.stringify([
          {
            '@context': 'https://schema.org',
            '@type': 'TechArticle',
            headline: TITLE,
            description: DESCRIPTION,
            url: 'https://numeric-input.com/docs/numora-react/anatomy',
            author: {
              '@type': 'Person',
              name: 'Kacper Szarkiewicz',
              url: 'https://x.com/sharqiewicz',
            },
          },
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: 'https://numeric-input.com',
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Numora React',
                item: 'https://numeric-input.com/docs/numora-react',
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: 'Anatomy',
                item: 'https://numeric-input.com/docs/numora-react/anatomy',
              },
            ],
          },
        ]),
      },
    ],
  }),
  component: Anatomy,
})

function Anatomy() {
  const pkg = 'numora-react' as const
  return (
    <div className="prose prose-invert max-w-none">
      <Hero pkg={pkg} />
      <div className="space-y-16">
        <NativeInputSection />
        <EventPipelineSection />
        <FloatVsStringSection />
        <UserInputSection />
        <SanitizationSection pkg={pkg} />
        <PlainVsNumoraSection />
        <KeydownSection />
        <BeforeInputSection />
        <ReactSyntheticBypassSection />
        <DefaultVsValueSection />
        <FormatModeSection />
        <GroupingStylesSection />
        <CursorPreservationSection />
        <PasteSection />
        <ProxyTargetSection />
        <RawVsFormattedSection pkg={pkg} />
        <DropInUsageSection pkg={pkg} />
      </div>
    </div>
  )
}

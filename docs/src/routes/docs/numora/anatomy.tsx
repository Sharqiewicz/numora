import { createFileRoute } from '@tanstack/react-router'
import {
  BeforeInputSection,
  CursorPreservationSection,
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
  RawVsFormattedSection,
  SanitizationSection,
  UserInputSection,
} from '@/components/anatomy/sections'

const TITLE =
  'Anatomy of a Numeric Input - How HTML Inputs, Float Math, and Numora Actually Work'
const DESCRIPTION =
  "A guided dissection of the HTML input element, the keydown/beforeinput/input/paste lifecycle, IEEE 754 float pitfalls, the seven-step sanitization pipeline, and how the numora JavaScript library rebuilds it all for reliable formatting, undo, and cursor preservation."

export const Route = createFileRoute('/docs/numora/anatomy')({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: 'description', content: DESCRIPTION },
      { property: 'og:title', content: TITLE },
      { property: 'og:description', content: DESCRIPTION },
      { property: 'og:url', content: 'https://numeric-input.com/docs/numora/anatomy' },
      { name: 'twitter:title', content: 'Anatomy of a Numeric Input' },
      { name: 'twitter:description', content: DESCRIPTION },
    ],
    links: [
      { rel: 'canonical', href: 'https://numeric-input.com/docs/numora/anatomy' },
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
            url: 'https://numeric-input.com/docs/numora/anatomy',
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
                name: 'Numora JS',
                item: 'https://numeric-input.com/docs/numora',
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: 'Anatomy',
                item: 'https://numeric-input.com/docs/numora/anatomy',
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
  const pkg = 'numora' as const
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
        <FormatModeSection />
        <GroupingStylesSection />
        <CursorPreservationSection />
        <PasteSection />
        <RawVsFormattedSection pkg={pkg} />
        <DropInUsageSection pkg={pkg} />
      </div>
    </div>
  )
}

import { createFileRoute } from '@tanstack/react-router';
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
} from '@/components/anatomy/sections';

const TITLE = 'Anatomy | Numora';
const DESCRIPTION =
  'How the HTML input element works and where it breaks for numbers: the keydown, beforeinput, input and paste events, IEEE 754 float errors, the ten-step sanitization pipeline, and how Numora handles formatting, undo and cursor position.';

export const Route = createFileRoute('/docs/numora/anatomy')({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: 'description', content: DESCRIPTION },
      { property: 'og:title', content: TITLE },
      { property: 'og:description', content: DESCRIPTION },
      { property: 'og:url', content: 'https://numeric-input.com/docs/numora/anatomy' },
      { name: 'twitter:title', content: TITLE },
      { name: 'twitter:description', content: DESCRIPTION },
    ],
    links: [{ rel: 'canonical', href: 'https://numeric-input.com/docs/numora/anatomy' }],
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
                name: 'Numora',
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
});

function Anatomy() {
  const pkg = 'numora' as const;
  return (
    <div className="docs-prose max-w-[36rem]">
      <Hero pkg={pkg} />
      <div className="space-y-16">
        {/* Act 1: why this exists */}
        <NativeInputSection pkg={pkg} />
        <FloatVsStringSection />
        <UserInputSection />
        <PlainVsNumoraSection />

        {/* Act 2: how Numora intercepts events */}
        <EventPipelineSection />
        <KeydownSection />
        <BeforeInputSection />
        <PasteSection />

        {/* Act 3: what Numora does with the value */}
        <SanitizationSection />
        <FormatModeSection />
        <GroupingStylesSection />
        <CursorPreservationSection />
        <RawVsFormattedSection pkg={pkg} />

        {/* Act 4: using it */}
        <DropInUsageSection pkg={pkg} />
      </div>
    </div>
  );
}

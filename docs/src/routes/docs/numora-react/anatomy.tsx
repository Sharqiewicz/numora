import { createFileRoute } from '@tanstack/react-router';
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
} from '@/components/anatomy/sections';

const TITLE = 'Anatomy | Numora React';
const DESCRIPTION =
  "How the React NumoraInput component works: the HTML input element, the four native events, IEEE 754 float errors, the ten-step sanitization pipeline, why beforeinput cannot use React's synthetic events, defaultValue vs value, and the Proxy on e.target.";

export const Route = createFileRoute('/docs/numora-react/anatomy')({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: 'description', content: DESCRIPTION },
      { property: 'og:title', content: TITLE },
      { property: 'og:description', content: DESCRIPTION },
      { property: 'og:url', content: 'https://numeric-input.com/docs/numora-react/anatomy' },
      { name: 'twitter:title', content: TITLE },
      { name: 'twitter:description', content: DESCRIPTION },
    ],
    links: [{ rel: 'canonical', href: 'https://numeric-input.com/docs/numora-react/anatomy' }],
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
});

function Anatomy() {
  const pkg = 'numora-react' as const;
  return (
    <div className="docs-prose max-w-[36rem]">
      <Hero pkg={pkg} />
      <div className="space-y-16">
        <NativeInputSection pkg={pkg} />
        <EventPipelineSection />
        <FloatVsStringSection />
        <UserInputSection />
        <SanitizationSection />
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
  );
}

// Anatomy section convention:
// Every section must render <section id="<kebab-case-id>" className="space-y-4 scroll-mt-24">
// so the how-it-works cheat-sheets (/docs/numora/how-it-works, /docs/numora-react/how-it-works)
// can deep-link to it. Adding a new section? Pick an id, set it on the wrapper, and link to it
// from the matching cheat-sheet.
export type Pkg = 'numora' | 'numora-react'

export interface SectionProps {
  pkg: Pkg
}

export const importLine = (pkg: Pkg) =>
  pkg === 'numora-react'
    ? `import { NumoraInput, FormatOn, ThousandStyle } from 'numora-react'`
    : `import { NumoraInput, FormatOn, ThousandStyle } from 'numora'`

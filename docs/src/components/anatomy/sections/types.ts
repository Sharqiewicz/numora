export type Pkg = 'numora' | 'numora-react'

export interface SectionProps {
  pkg: Pkg
}

export const importLine = (pkg: Pkg) =>
  pkg === 'numora-react'
    ? `import { NumoraInput, FormatOn, ThousandStyle } from 'numora-react'`
    : `import { NumoraInput, FormatOn, ThousandStyle } from 'numora'`

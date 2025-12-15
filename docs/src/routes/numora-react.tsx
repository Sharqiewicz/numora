import { createFileRoute, Outlet } from '@tanstack/react-router'
import { DocsLayout } from '@/components/DocsLayout'

export const Route = createFileRoute('/numora-react')({
  component: () => (
    <DocsLayout>
      <Outlet />
    </DocsLayout>
  ),
})

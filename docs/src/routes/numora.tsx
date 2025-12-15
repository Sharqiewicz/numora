import { createFileRoute, Outlet } from '@tanstack/react-router'
import { DocsLayout } from '@/components/DocsLayout'

export const Route = createFileRoute('/numora')({
  component: () => (
    <DocsLayout>
      <Outlet />
    </DocsLayout>
  ),
})

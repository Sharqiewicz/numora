import { createFileRoute, Outlet } from '@tanstack/react-router'
import { DocsLayout } from '@/components/DocsLayout'

export const Route = createFileRoute('/docs')({
  ssr: false,
  component: () => (
    <DocsLayout>
      <Outlet />
    </DocsLayout>
  ),
})

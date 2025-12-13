import {
  Sidebar,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar'
import { DocsSidebar } from '@/components/DocsSidebar'
import { Link } from '@tanstack/react-router'

export function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen={true} open={true}>
      <Sidebar collapsible="none">
        <SidebarHeader className="px-4 py-3">
          <Link to="/"><h2 className="text-4xl font-numora">numora</h2></Link>
        </SidebarHeader>
        <DocsSidebar />
      </Sidebar>
      <SidebarInset>
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto max-w-3xl px-4 py-8">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

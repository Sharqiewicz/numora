import {
  Sidebar,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { DocsSidebar } from '@/components/DocsSidebar'
import { Link } from '@tanstack/react-router'
import { Socials } from './socials'
import { useIsMobile } from '@/hooks/use-mobile'
import { PackageProvider } from '@/contexts/PackageContext'

export function DocsLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile()

  return (
    <PackageProvider>
      <SidebarProvider defaultOpen={true} open={true}>
        <Sidebar collapsible={isMobile ? "offcanvas" : "none"}>
          <SidebarHeader className="px-4 py-3">
            <Link to="/"><h2 className="text-4xl font-numora">numora</h2></Link>
          </SidebarHeader>
          <DocsSidebar />
        </Sidebar>
        <SidebarInset>
          <header className="container mx-auto max-w-3xl px-4 py-8 flex items-center justify-between md:justify-end">
            <div className="md:hidden">
              <SidebarTrigger />
            </div>
            <Socials className="justify-end"/>
          </header>
          <main className="flex-1 overflow-y-auto">
            <div className="container mx-auto max-w-3xl px-4 py-8">
              {children}
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </PackageProvider>
  )
}

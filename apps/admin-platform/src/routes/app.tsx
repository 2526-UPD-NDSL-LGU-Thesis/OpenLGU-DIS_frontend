import { Outlet, createFileRoute } from '@tanstack/react-router'
import { AppSidebar } from "#/components/Sidebar/app-sidebar"
import { SectionCards } from "#/components/section-cards"
import { SiteHeader } from "#/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@openlguid/ui/components/sidebar"


export const Route = createFileRoute('/app')({ component: App })

function App() {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {/* <SectionCards /> */}
              <Outlet /> 
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

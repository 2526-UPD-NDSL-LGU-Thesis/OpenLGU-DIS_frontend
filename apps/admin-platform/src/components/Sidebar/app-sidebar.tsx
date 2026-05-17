import * as React from "react"
import { Link, linkOptions } from "@tanstack/react-router"

import { NavDocuments } from "#/components/Sidebar/nav-documents"
import { NavMain } from "#/components/Sidebar/nav-main"
import { NavSecondary } from "#/components/Sidebar/nav-secondary"
import { NavUser } from "#/components/Sidebar/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@openlguid/ui/components/sidebar"
import { CommandIcon } from "lucide-react"


const navMainItems = linkOptions([
    {
      title: "ID Management",
      to: "/id-management",
      // icon: (
      //   <LayoutDashboardIcon />
      // ),
    },
    {
      title: "Service Claiming",
      to: "/service-claim",
      // icon: (
      //   <ListIcon
      //   />
      // ),
    },
    {
      title: "Sector Management",
      to: "/sector-management",
      // icon: <LayoutDashboardIcon />,
    }
]);

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link to="/"> {/* TODO: fix the styling here to not be block elements + autoupdating links */}
                <CommandIcon className="size-5!" />
                <span className="text-base font-semibold">OpenLGUID</span> 
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={navMainItems} />
        {/* <NavDocuments items={dummyData.documents} />
        <NavSecondary items={dummyData.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser/>
      </SidebarFooter>
    </Sidebar>
  )
}

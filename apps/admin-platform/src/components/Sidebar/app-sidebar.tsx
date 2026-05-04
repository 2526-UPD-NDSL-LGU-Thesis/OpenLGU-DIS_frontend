import * as React from "react"
import { useRouter } from "@tanstack/react-router"

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
import { LayoutDashboardIcon, ListIcon, CameraIcon, FileTextIcon, Settings2Icon, CircleHelpIcon, SearchIcon, DatabaseIcon, FileChartColumnIcon, FileIcon, CommandIcon } from "lucide-react"
import { Link, linkOptions } from "@tanstack/react-router"

import useAuthStore from "#/features/auth/auth"

const dummyData = {
  user: {
    name: "LGU Super Admin",
    email: "super@openlguid.com",
    avatar: "/avatars/shadcn.jpg",
  },


  navClouds: [
    {
      title: "Capture",
      icon: (
        <CameraIcon
        />
      ),
      isActive: true,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Proposal",
      icon: (
        <FileTextIcon
        />
      ),
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Prompts",
      icon: (
        <FileTextIcon
        />
      ),
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: (
        <Settings2Icon
        />
      ),
    },
    {
      title: "Get Help",
      url: "#",
      icon: (
        <CircleHelpIcon
        />
      ),
    },
    {
      title: "Search",
      url: "#",
      icon: (
        <SearchIcon
        />
      ),
    },
  ],
  documents: [
    {
      name: "Data Library",
      url: "#",
      icon: (
        <DatabaseIcon
        />
      ),
    },
    {
      name: "Reports",
      url: "#",
      icon: (
        <FileChartColumnIcon
        />
      ),
    },
    {
      name: "Word Assistant",
      url: "#",
      icon: (
        <FileIcon
        />
      ),
    },
  ],
}


const navMainItems = linkOptions([
    {
      title: "ID Registration",
      to: "/id-registration", // TODO how to have this auto-update?
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
    }
]);



export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter()
  const { session, logout } = useAuthStore()

  // Map IdentityProfile to NavUser user data
  const userData = session.identityProfile
    ? {
        name: session.identityProfile.username,
        email: `${session.identityProfile.username}@openlguid.local`,
        avatar: "/avatars/shadcn.jpg",
      }
    : dummyData.user

  const handleLogout = async () => {
    await logout()
    await router.navigate({ to: "/_public/login" })
  }

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
        <NavUser user={userData} onLogout={handleLogout} />
      </SidebarFooter>
    </Sidebar>
  )
}

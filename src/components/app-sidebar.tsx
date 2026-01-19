import * as React from "react";
import { IconDashboard, IconDatabase, IconSettings, IconFileText } from "@tabler/icons-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: IconDashboard,
    },
    {
      title: "Master",
      url: "#",
      icon: IconDatabase,
      isActive: true,
      items: [
        {
          title: "Perusahaan",
          url: "/master/perusahaan",
        },
        {
          title: "Departemen",
          url: "/master/departemen",
        },
        {
          title: "Jabatan",
          url: "/master/jabatan",
        },
        {
          title: "Karyawan",
          url: "/master/karyawan",
        },
        {
          title: "Jenis Pekerjaan",
          url: "/master/jenis-pekerjaan",
        },
      ],
    },
    {
      title: "Work Permit",
      url: "#",
      icon: IconFileText,
      items: [
        {
          title: "Pengajuan Izin",
          url: "/pengajuan",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: IconSettings,
      items: [
        {
          title: "User Management",
          url: "/settings/users",
        },
        {
          title: "Role Management",
          url: "/settings/roles",
        },
        {
          title: "Threshold",
          url: "/settings/thresholds",
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:p-1.5!">
              <a href="#">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground overflow-hidden">
                  <img src="/logo.jpg" alt="Logo" className="size-full object-cover" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">PPA Clinic</span>
                  <span className="truncate text-xs text-muted-foreground">Safety System</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}

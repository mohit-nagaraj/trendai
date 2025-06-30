"use client";
import * as React from "react";
import Image from "next/image";
import {
  BarChartIcon,
  ClipboardListIcon,
  DatabaseIcon,
  FolderIcon,
  HelpCircleIcon,
  LayoutDashboardIcon,
  ListIcon,
  SearchIcon,
  UsersIcon,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

import { NavDocuments } from "@/components/sidebar/nav-documents";
import { NavMain } from "@/components/sidebar/nav-main";
import { NavSecondary } from "@/components/sidebar/nav-secondary";
import { NavUser } from "@/components/sidebar/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import Link from "next/link";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboardIcon,
    },
    {
      title: "AI Analysis",
      url: "/ai-analysis",
      icon: ListIcon,
    },
    {
      title: "AI Trends",
      url: "/ai-trends",
      icon: BarChartIcon,
    },
  ],
  collaboration: [
    {
      title: "Videos",
      url: "/videos",
      icon: FolderIcon,
    },
    {
      title: "Team",
      url: "/team",
      icon: UsersIcon,
    },
  ],
  navSecondary: [
    {
      title: "Get Help",
      url: "https://www.finalroundai.com/frequently-asked-questions",
      icon: HelpCircleIcon,
    },
    {
      title: "Search",
      url: "#",
      icon: SearchIcon,
    },
  ],
  documents: [
    {
      name: "File Uploads",
      url: "/file-uploads",
      icon: DatabaseIcon,
    },
    {
      name: "Reports",
      url: "/reports",
      icon: ClipboardListIcon,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5 hover:bg-transparent focus:bg-transparent active:bg-transparent hover:text-inherit focus:text-inherit active:text-inherit"
            >
              <Link href="/" className="pb-2">
                <Image
                  src="/Final Round AI.svg"
                  alt="Final Round AI"
                  width={126}
                  height={20}
                  className="mb-[2px] ml-1"
                />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <SidebarGroup className="group-data-[collapsible=icon]:hidden mt-2">
          <SidebarGroupLabel>Collaboration</SidebarGroupLabel>
          <SidebarMenu>
            {data.collaboration.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  className={cn(
                    pathname === item.url &&
                      "bg-secondary text-secondary-foreground"
                  )}
                >
                  <a href={item.url}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
"use client";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarInset, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem, 
  SidebarProvider, 
  SidebarTrigger 
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { Separator } from "@radix-ui/react-separator";
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbSeparator 
} from "@/components/ui/breadcrumb";
import { Link as LinkIcon, Home, LogOut, Loader, List, TowerControlIcon } from "lucide-react";
import { Fragment, ReactNode } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";


interface SidebarItem {
  title: string;
  url: string;
  icon: React.ComponentType;
}

interface AdminSidebarProps {
  children: ReactNode;
}
const items = [
  {
    title: "Manajemen Akun",
    icon: List,
    url: "/dashboard/admin/manajemen-akun",
  },
  {
    title: "Manajemen Mata Kuliah",
    icon: TowerControlIcon,
    url: "/dashboard/admin/manajemen-mata-kuliah",
  },
];
export default function AdminSidebar({
  children,
}: AdminSidebarProps) {
  const pathname = usePathname();

  const pathSegments = pathname.slice(1).split("/");
  const routesList = pathSegments.map((segment, index) => {
    const url = "/" + pathSegments.slice(0, index + 1).join("/");

    return {
      title: segment[0]?.toUpperCase() + segment.slice(1),
      url: url,
    };
  });
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarContent className="dark:bg-gray-900 bg-gray-100">
          <SidebarGroup>
            <SidebarGroupLabel className="flex justify-between items-center">
              Dashboard Admin
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    className={cn(
                      "hover:bg-gray-200 dark:hover:bg-gray-800",
                      pathname === "/dashboard/admin"
                        ? "bg-gray-200 dark:bg-gray-800"
                        : ""
                    )}
                  >
                    <Link href="/dashboard/admin">
                      <Home />
                      <span>Dashboard</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                {items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        className={cn(
                          "hover:bg-gray-200 dark:hover:bg-gray-800",
                          pathname.includes(item.url)
                            ? "bg-gray-200 dark:bg-gray-800"
                            : ""
                        )}
                      >
                        <Link href={item.url}>
                          <Icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                {routesList.map((item, index) => (
                  <Fragment key={index + 1}>
                    <BreadcrumbItem className="hidden md:block">
                      <BreadcrumbLink href={item.url}>
                        {item.title}
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    {index >= routesList.length - 1 ? null : (
                      <BreadcrumbSeparator className="hidden md:block" />
                    )}
                  </Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <main className="w-full p-5 flex-1 min-h-svh">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
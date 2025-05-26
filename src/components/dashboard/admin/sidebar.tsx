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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Link as LinkIcon, Home, LogOut, Loader, List, TowerControlIcon, Loader2 } from "lucide-react";
import { Fragment, ReactNode, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

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
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const pathSegments = pathname.slice(1).split("/");
  const routesList = pathSegments.map((segment, index) => {
    const url = "/" + pathSegments.slice(0, index + 1).join("/");

    return {
      title: segment[0]?.toUpperCase() + segment.slice(1),
      url: url,
    };
  });

  // Logout handler
  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    setLogoutDialogOpen(false);
    
    try {
      toast.info("Logging out...");
      
      // Get token
      const token = getStoredToken();
      
      // Fetch logout endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Logout successful:', data.data.message);
        toast.success(data.data.message || "Logout successful!");
      } else {
        console.log('⚠️ Logout API failed, continuing with client-side logout');
        toast.success("Logged out successfully");
      }

    } catch (error) {
      console.error('❌ Logout error:', error);
      toast.success("Logged out successfully");
    } finally {
      // Always clear client-side auth
      clearClientAuth();
      setIsLoggingOut(false);
      
      // Redirect
      window.location.href = '/login';
    }
  };

  const getStoredToken = (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('authToken') || 
             sessionStorage.getItem('authToken') || 
             getCookieToken();
    }
    return null;
  };

  const getCookieToken = (): string | null => {
    if (typeof document === 'undefined') return null;
    
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'authToken' || name === 'token') {
        return value;
      }
    }
    return null;
  };

  const clearClientAuth = (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      sessionStorage.removeItem('authToken');
      localStorage.removeItem('userInfo');
      localStorage.removeItem('token');
    }
    
    if (typeof document !== 'undefined') {
      document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
  };

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

          {/* Logout Button Section */}
          <SidebarGroup className="mt-auto">
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <AlertDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
                    <AlertDialogTrigger asChild>
                      <SidebarMenuButton
                        className="hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                        disabled={isLoggingOut}
                      >
                        {isLoggingOut ? (
                          <>
                            <Loader2 className="animate-spin" />
                            <span>Logging out...</span>
                          </>
                        ) : (
                          <>
                            <LogOut />
                            <span>Logout</span>
                          </>
                        )}
                      </SidebarMenuButton>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
                        <AlertDialogDescription>
                          You will be redirected to the login page and will need to sign in again to access the admin panel.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={handleLogout}
                          disabled={isLoggingOut}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          {isLoggingOut ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Logging out...
                            </>
                          ) : (
                            "Logout"
                          )}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </SidebarMenuItem>
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
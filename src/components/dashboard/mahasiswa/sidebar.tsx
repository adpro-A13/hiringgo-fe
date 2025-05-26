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
import { Link as LinkIcon, Bell, Home, LogOut, Loader, List, BookOpen, Clock, Loader2 } from "lucide-react";
import { Fragment, ReactNode, useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { fetcher } from "@/components/lib/fetcher";

interface SidebarItem {
  title: string;
  url: string;
  icon: React.ComponentType;
}

interface MahasiswaSidebarProps {
  children: ReactNode;
}

const items = [
  {
    title: "Lowongan",
    icon: BookOpen,
    url: "/dashboard/mahasiswa/mendaftar-lowongan",
  },
  {
    title: "Log Activities",
    icon: Clock,
    url: "/dashboard/mahasiswa/log-activities",
  },
];

export default function MahasiswaSidebar({
  children,
}: MahasiswaSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoadingCount, setIsLoadingCount] = useState(false);

  const pathSegments = pathname.slice(1).split("/");
  const routesList = pathSegments.map((segment, index) => {
    const url = "/" + pathSegments.slice(0, index + 1).join("/");

    return {
      title: segment[0]?.toUpperCase() + segment.slice(1),
      url: url,
    };
  });

  // Fetch unread notification count
  const fetchUnreadCount = async () => {
    setIsLoadingCount(true);
    try {
      const count = await fetcher<number>('/api/notifikasi/unread-count');
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching notification count:', error);
    } finally {
      setIsLoadingCount(false);
    }
  };

  // Fetch notification count on load and refresh every minute
  useEffect(() => {
    fetchUnreadCount();
    const intervalId = setInterval(fetchUnreadCount, 60000); // Refresh every minute
    
    return () => clearInterval(intervalId);
  }, []);

  // Logout handler
  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    setLogoutDialogOpen(false);
    
    try {
      toast.info("Logging out...");
      
      // Using fetcher instead of direct fetch - it automatically handles auth
      await fetcher('/api/auth/logout', undefined, {
        method: 'POST'
      });
      
      toast.success("Logout successful!");
      
    } catch (error) {
      console.error('❌ Logout error:', error);
      toast.success("Logged out successfully");
    } finally {
      // Always clear client-side auth
      clearClientAuth();
      setIsLoggingOut(false);
      
      router.push('/login');
    }
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
              Dashboard Mahasiswa
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    className={cn(
                      "hover:bg-gray-200 dark:hover:bg-gray-800",
                      pathname === "/dashboard/mahasiswa"
                        ? "bg-gray-200 dark:bg-gray-800"
                        : ""
                    )}
                  >
                    <Link href="/dashboard/mahasiswa">
                      <Home />
                      <span>Dashboard</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {/* Notification Button */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    className={cn(
                      "hover:bg-gray-200 dark:hover:bg-gray-800",
                      pathname === "/dashboard/mahasiswa/notifikasi"
                        ? "bg-gray-200 dark:bg-gray-800"
                        : ""
                    )}
                  >
                    <Link href="/dashboard/mahasiswa/notifikasi" className="relative">
                      <Bell />
                      <span>Notifikasi</span>
                      {!isLoadingCount && unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      )}
                      {isLoadingCount && (
                        <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center">
                          <Loader2 className="h-3 w-3 animate-spin text-gray-500" />
                        </span>
                      )}
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
                          You will be redirected to the login page and will need to sign in again to access your account.
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
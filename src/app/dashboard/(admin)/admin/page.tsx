"use client";
import AdminPage from "@/components/dashboard/admin/adminpage";
import AdminSidebar from "@/components/dashboard/admin/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
interface DashboardData {
  userRole: string;
  username: string;
  fullName: string;
  availableFeatures: {
    profile: string;
    manajemenLowongan: string;
    manajemenAkun: string;
    manajemenMataKuliah: string;
  };
  dosenCount: number;
  mahasiswaCount: number;
  courseCount: number;
  lowonganCount: number;
}

export default function Admin(){
    const [dashboardData, setDashboardData] = useState<DashboardData>({
        userRole: "",
        username: "",
        fullName: "",
        availableFeatures: {
            profile: "",
            manajemenLowongan: "",
            manajemenAkun: "",
            manajemenMataKuliah: "",
        },
        dosenCount: 0,
        mahasiswaCount: 0,
        courseCount: 0,
        lowonganCount: 0
    });
    
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    useEffect(() => {
            const fetchLowongan = async () => {
                try {
                    setIsLoading(true);
                    const response = await fetch("/api/dashboard/admin", {
                        method: "GET", 
                        headers: { "Content-Type": "application/json" ,
                            "Authorization": `Bearer ${localStorage.getItem('token')}` // Pastikan token ada
                        },
                    });
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
    
                    const data = await response.json();
                    setDashboardData(data);
                    setError(null);
                } catch (err) {
                    console.error("API Error:", err);
                    setError(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
                } finally {
                    setIsLoading(false);
                }
            };
    
            fetchLowongan();
        }, []);
        
        if (isLoading) {
            return <Skeleton className="h-96 w-full" />;
        }
        console.log(dashboardData);
        if (error) {
            return <div className="p-8 text-red-500 text-center">{error}</div>;
        }

    return(
        <AdminSidebar>
            <AdminPage dashboardData={dashboardData} />
        </AdminSidebar>
    )
}
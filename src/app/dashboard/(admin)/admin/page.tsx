"use client";
import AdminPage from "@/components/dashboard/admin/adminpage";
import AdminSidebar from "@/components/dashboard/admin/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import router from "next/router";
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
            setError(null); // Reset error state
            
            const response = await fetch("/api/dashboard/admin", {
                method: "GET", 
            });

            if (!response.ok) {
                let errorMessage = `HTTP error! Status: ${response.status}`;
                
                switch (response.status) {
                    case 401:
                        localStorage.removeItem('authToken');
                        sessionStorage.removeItem('authToken');
    
                        router.push('/login');
                        return;
                    case 403:
                        errorMessage = "Forbidden: You don't have permission to access this resource";
                        break;
                    case 404:
                        errorMessage = "Dashboard data not found";
                        break;
                    case 500:
                        errorMessage = "Internal server error. Please try again later";
                        break;
                    default:
                        errorMessage = `Request failed with status ${response.status}`;
                }
                
                throw new Error(errorMessage);
            }

            const data = await response.json();
            
            if (!data || typeof data !== 'object') {
                throw new Error("Invalid response format received from server");
            }

            setDashboardData(data);
            setError(null);
            
        } catch (err) {
            console.error("API Error:", err);
            
            if (err instanceof TypeError && err.message.includes('fetch')) {
                setError("Network error: Please check your internet connection");
            } else if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("An unexpected error occurred. Please try again");
            }
        } finally {
            setIsLoading(false);
        }
    };

    fetchLowongan();
}, []);

    if (error) {
        return (
            <div className="p-8 text-center">
                <div className="text-red-500 mb-4">{error}</div>
                <button 
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Retry
                </button>
            </div>
        );
    }

    return(
        <AdminSidebar>
            <AdminPage dashboardData={dashboardData} />
        </AdminSidebar>
    )
}
"use client";
import AdminPage from "@/components/dashboard/admin/adminpage";
import AdminSidebar from "@/components/dashboard/admin/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import router from "next/router";
import { fetcher } from "@/components/lib/fetcher";

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

export default function Admin() {
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
        const fetchDashboardData = async () => {
            try {
                setIsLoading(true);
                setError(null); // Reset error state

                const data = await fetcher<any>("/api/dashboard/admin", undefined, {
                    method: "GET",
                });

                console.log("Dashboard response:", data);

                // Check if we received valid dashboard data
                if (data && data.userRole) {
                    setDashboardData(data);
                    setError(null);
                } else if (data.success === false) {
                    // Handle wrapped error response
                    const errorMessage = data.error ?? data.message ?? "Failed to load dashboard data";
                    setError(errorMessage);
                } else {
                    // Handle unexpected response format
                    setError("Invalid response format received from server");
                }

            } catch (err: any) {
                console.error("API Error:", err);

                let errorMessage: string;
                if (err?.status) {
                    switch (err.status) {
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
                            errorMessage = err.message || `Server error (${err.status})`;
                    }
                } else {
                    errorMessage = err?.message || "Network error: Please check your internet connection";
                }

                setError(errorMessage);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
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

    return (
        <AdminSidebar>
            <AdminPage dashboardData={dashboardData} />
        </AdminSidebar>
    )
}
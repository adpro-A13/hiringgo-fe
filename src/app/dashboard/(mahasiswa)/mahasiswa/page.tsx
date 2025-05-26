"use client";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import MahasiswaSidebar from "@/components/dashboard/mahasiswa/sidebar";
import MahasiswaPage from "@/components/dashboard/mahasiswa/mahasiswapage";
import { useRouter } from "next/navigation";
import { fetcher } from "@/components/lib/fetcher";

interface Lowongan {
  lowonganId: string;
  idMataKuliah: string;
  namaMataKuliah: string;
  deskripsiMataKuliah: string;
  tahunAjaran: string;
  semester: string;
  statusLowongan: string;
  jumlahAsdosDibutuhkan: number;
  jumlahAsdosDiterima: number;
  jumlahAsdosPendaftar: number;
  idDaftarPendaftaran: string[];
}

interface MahasiswaDashboardData {
  userRole: string;
  username: string;
  fullName: string;
  availableFeatures: {
    pendaftaran: string;
    lowongan: string;
    profile: string;
    logActivities: string;
  };
  openLowonganCount: number;
  totalLowonganCount: number;
  totalApplicationsCount: number;
  pendingApplicationsCount: number;
  acceptedApplicationsCount: number;
  rejectedApplicationsCount: number;
  totalLoggedHours: number;
  totalIncentive: number;
  acceptedLowongan: Lowongan[];
}

export default function MahasiswaDashboard() {
    const router = useRouter();
    const [dashboardData, setDashboardData] = useState<MahasiswaDashboardData>({
        userRole: "",
        username: "",
        fullName: "",
        availableFeatures: {
            pendaftaran: "",
            lowongan: "",
            profile: "",
            logActivities: "",
        },
        openLowonganCount: 0,
        totalLowonganCount: 0,
        totalApplicationsCount: 0,
        pendingApplicationsCount: 0,
        acceptedApplicationsCount: 0,
        rejectedApplicationsCount: 0,
        totalLoggedHours: 0,
        totalIncentive: 0,
        acceptedLowongan: []
    });
    
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    useEffect(() => {
        const fetchMahasiswaData = async () => {
            try {
                setIsLoading(true);
                setError(null); // Reset error state
                
                const data = await fetcher<any>("/api/dashboard/mahasiswa", undefined, {
                    method: "GET",
                });

                console.log("Mahasiswa dashboard response:", data);

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

        fetchMahasiswaData();
    }, []);
    
    
    if (isLoading) {
        return <Skeleton className="h-screen w-full" />;
    }
    
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
        <MahasiswaSidebar>
            <MahasiswaPage dashboardData={dashboardData} />
        </MahasiswaSidebar>
    );
}
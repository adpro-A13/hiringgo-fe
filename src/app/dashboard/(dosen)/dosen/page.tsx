"use client";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import DosenSidebar from "@/components/dashboard/dosen/sidebar";
import DosenPage from "@/components/dashboard/dosen/dosenpage";
import { fetcher } from "@/components/lib/fetcher";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Course {
  kode: string;
  nama: string;
  deskripsi: string;
  dosenPengampuEmails: string[];
}

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

interface DosenDashboardData {
  userRole: string;
  username: string;
  fullName: string;
  availableFeatures: {
    manajemenlowongan: string;
    profile: string;
    periksaLog: string;
    manajemenAsdos: string;
  };
  courseCount: number;
  acceptedAssistantCount: number;
  openPositionCount: number;
  courses: any[] | null;
  openPositions: any[] | null;
  coursesTaught: Course[] | null;
  lowonganPerCourse: Record<string, Lowongan[]> | null;
  acceptedAssistantsPerCourse: Record<string, number> | null;
}

export default function DosenDashboard() {
    const [dashboardData, setDashboardData] = useState<DosenDashboardData>({
        userRole: "",
        username: "",
        fullName: "",
        availableFeatures: {
            manajemenlowongan: "",
            profile: "",
            periksaLog: "",
            manajemenAsdos: "",
        },
        courseCount: 0,
        acceptedAssistantCount: 0,
        openPositionCount: 0,
        courses: null,
        openPositions: null,
        coursesTaught: null,
        lowonganPerCourse: null,
        acceptedAssistantsPerCourse: null
    });
    
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    
    useEffect(() => {
        fetchDosenData();
    }, []);

    async function fetchDosenData() {
        setIsLoading(true);
        try {
            console.log("Fetching dosen dashboard data...");
            const data = await fetcher<DosenDashboardData>("/api/dashboard/dosen");
            console.log("Dosen dashboard data fetched:", data);
            
            setDashboardData(data);
            setError(null);
        } catch (err: any) {
            console.error("API Error:", err);
            
            if (err.status === 401) {
                toast.error("Session expired. Please login again.");
                router.push('/login');
                return;
            } else if (err.status === 403) {
                toast.error("You don't have permission to access this dashboard.");
                router.push('/login');
                return;
            }
            
            const errorMsg = err.message || "Failed to load dashboard data";
            setError(errorMsg);
            toast.error(errorMsg);
            
            // Provide fallback data for development/testing if needed
            // setDashboardData({...});
        } finally {
            setIsLoading(false);
        }
    }
    
    if (isLoading) {
        return <Skeleton className="h-96 w-full" />;
    }
    
    if (error) {
        return (
            <div className="p-8 text-center">
                <div className="text-red-500 mb-4">{error}</div>
                <button 
                    onClick={() => fetchDosenData()} 
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Retry
                </button>
            </div>
        );
    }

    return(
        <DosenSidebar>
            <DosenPage dashboardData={dashboardData} />
        </DosenSidebar>
    );
}
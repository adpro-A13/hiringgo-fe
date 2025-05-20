"use client";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import MahasiswaSidebar from "@/components/dashboard/mahasiswa/sidebar";
import MahasiswaPage from "@/components/dashboard/mahasiswa/mahasiswapage";

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
  acceptedLowongan: any[];
  recentLowongan: any[];
}

export default function MahasiswaDashboard() {
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
        acceptedLowongan: [],
        recentLowongan: []
    });
    
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    useEffect(() => {
        const fetchMahasiswaData = async () => {
            try {
                setIsLoading(true);
                const response = await fetch("/api/dashboard/mahasiswa", {
                    method: "GET", 
                    headers: {
                        "Authorization": `Bearer eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiTUFIQVNJU1dBIiwibmltIjoiMTIzMzIxMiIsImZ1bGxOYW1lIjoibWhzMSIsImlkIjoiY2QwMGIwMDctYTAzMC00NDI1LTk0ODgtZGZhODMwYzE0OTBhIiwiZW1haWwiOiJhYWEyMTIyMUBnbWFpbC5jb20iLCJzdWIiOiJhYWEyMTIyMUBnbWFpbC5jb20iLCJpYXQiOjE3NDc3MTgzMzgsImV4cCI6MTc0NzcyMTkzOH0.E7H7P188CJ3Jl2efNXTSBSnF1qMsNvZVEmK_eOmTaXc`,
                        "Content-Type": "application/json"
                    }
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

        fetchMahasiswaData();
    }, []);
    
    
    if (isLoading) {
        return <Skeleton className="h-screen w-full" />;
    }
    
    if (error) {
        return <div className="p-8 text-red-500 text-center">{error}</div>;
    }

    return(
        <MahasiswaSidebar>
            <MahasiswaPage dashboardData={dashboardData} />
        </MahasiswaSidebar>
    );
}
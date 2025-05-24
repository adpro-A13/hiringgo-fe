"use client";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import DosenSidebar from "@/components/dashboard/dosen/sidebar";
import DosenPage from "@/components/dashboard/dosen/dosenpage";
import router from "next/router";

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
    
    useEffect(() => {
        const fetchDosenData = async () => {
            try {
                setIsLoading(true);
                setError(null); 
                
                const response = await fetch("/api/dashboard/dosen", {
                    method: "GET", 
                    headers: {
                        "Authorization": `Bearer eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiTUFIQVNJU1dBIiwibmltIjoiMTIzMzIxMiIsImZ1bGxOYW1lIjoibWhzMSIsImlkIjoiY2QwMGIwMDctYTAzMC00NDI1LTk0ODgtZGZhODMwYzE0OTBhIiwiZW1haWwiOiJhYWEyMTIyMUBnbWFpbC5jb20iLCJzdWIiOiJhYWEyMTIyMUBnbWFpbC5jb20iLCJpYXQiOjE3NDc5MzIwNjYsImV4cCI6MTc0NzkzNTY2Nn0.AGWj1nlgtklwSGeca-xmSzwngeFOaYWbIkVyt33fCos`,
                        "Content-Type": "application/json"
                    }
                });

                // Enhanced error handling based on status codes
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

                if (!data.userRole || !data.username) {
                    throw new Error("Incomplete dashboard data received");
                }

                setDashboardData(data);
                setError(null);
                
            } catch (err) {
                console.error("API Error:", err);
                
                // More specific error handling
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

        fetchDosenData();
    }, []);
    
    if (isLoading) {
        return <Skeleton className="h-96 w-full" />;
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
        <DosenSidebar>
            <DosenPage dashboardData={dashboardData} />
        </DosenSidebar>
    );
}
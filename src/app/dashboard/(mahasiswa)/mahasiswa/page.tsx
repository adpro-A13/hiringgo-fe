"use client";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import MahasiswaSidebar from "@/components/dashboard/mahasiswa/sidebar";
import MahasiswaPage from "@/components/dashboard/mahasiswa/mahasiswapage";
import router from "next/router";

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
                
                const response = await fetch("/api/dashboard/mahasiswa", {
                    method: "GET", 
                    headers: {
                        "Authorization": `Bearer eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiTUFIQVNJU1dBIiwibmltIjoiMTIzMzIxMiIsImZ1bGxOYW1lIjoibWhzMSIsImlkIjoiY2QwMGIwMDctYTAzMC00NDI1LTk0ODgtZGZhODMwYzE0OTBhIiwiZW1haWwiOiJhYWEyMTIyMUBnbWFpbC5jb20iLCJzdWIiOiJhYWEyMTIyMUBnbWFpbC5jb20iLCJpYXQiOjE3NDgxNDMxMjIsImV4cCI6MTc0ODE0NjcyMn0.dTpi0lVrmmog8zK7WTbZP9dn37_pwlEv2aFjst2Ep1s`,
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
                
                // Validate response data structure
                if (!data || typeof data !== 'object') {
                    throw new Error("Invalid response format received from server");
                }

                // Additional validation for required fields
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
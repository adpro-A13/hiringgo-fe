"use client";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import DosenSidebar from "@/components/dashboard/dosen/sidebar";
import DosenPage from "@/components/dashboard/dosen/dosenpage";

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
                const response = await fetch("/api/dashboard/dosen", {
                    method: "GET", 
                    headers: { "Content-Type": "application/json" ,
                        "Authorization": `Bearer eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiRE9TRU4iLCJuaXAiOiIyMzA2MjE0OTkwIiwiZnVsbE5hbWUiOiJkb3NlbiIsImlkIjoiMzdlNGRjOWEtMmZlYy00MWE1LWFlOTgtMmRkNjcxODdjMTFjIiwiZW1haWwiOiJkb3NlbkBleGFtcGxlLmNvbSIsInN1YiI6ImRvc2VuQGV4YW1wbGUuY29tIiwiaWF0IjoxNzQ4MTUwNzk0LCJleHAiOjE3NDgxNTQzOTR9.gs3HqM1dOjQUhGgFbT-Qi7-oBFJOuDVUDX729MS7WFg`
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

        fetchDosenData();
    }, []);
    
    if (isLoading) {
        return <Skeleton className="h-96 w-full" />;
    }
    
    if (error) {
        return <div className="p-8 text-red-500 text-center">{error}</div>;
    }

    return(
        <DosenSidebar>
            <DosenPage dashboardData={dashboardData} />
        </DosenSidebar>
    );
}
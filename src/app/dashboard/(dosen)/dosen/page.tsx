"use client";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import DosenSidebar from "@/components/dashboard/dosen/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, Clock, BookCheck } from "lucide-react";
import DosenPage from "@/components/dashboard/dosen/dosenpage";

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
  courses: any[];
  openPositions: any[];
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
        courses: [],
        openPositions: []
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
    )

}


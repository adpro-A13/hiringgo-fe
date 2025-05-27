"use client";

import MahasiswaSidebar from "@/components/dashboard/mahasiswa/sidebar";
import ListLowongan from "@/components/manajemenlowongan/list-lowongan";
import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import { fetcher } from "@/components/lib/fetcher";

interface ApplicationStatus {
    hasApplied: boolean;
    status: string;
    pendaftaranId?: string;
}

export default function Mahasiswa(){
    const [lowonganData, setLowonganData] = useState<any>();
    const [applicationStatuses, setApplicationStatuses] = useState<{[key: string]: ApplicationStatus}>({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    
    useEffect(() => {
        const fetchLowonganAndStatuses = async () => {
            try {
                setIsLoading(true);
                setError(null);

                // Fetch lowongan data
                const data = await fetcher<any>("/api/lowongandaftar/list", undefined, {
                    method: "GET",
                });

                setLowonganData(data);
                console.log("Lowongan data fetched successfully:", data);

                // Extract lowongan list from the nested structure
                const lowonganList = data?.data?.lowongan_list || data?.lowongan_list || [];
                
                // Fetch application statuses for each lowongan
                if (lowonganList.length > 0) {
                    const statusPromises = lowonganList.map(async (lowongan: any) => {
                        try {
                            const status = await fetcher<ApplicationStatus>(
                                `/api/lowongandaftar/${lowongan.lowonganId}/status`,
                                undefined,
                                { method: "GET" }
                            );
                            return { lowonganId: lowongan.lowonganId, status };
                        } catch (error) {
                            console.warn(`Failed to fetch status for lowongan ${lowongan.lowonganId}:`, error);
                            return { 
                                lowonganId: lowongan.lowonganId, 
                                status: { hasApplied: false, status: "BELUM_MENDAFTAR" } 
                            };
                        }
                    });
                    
                    const statusResults = await Promise.all(statusPromises);
                    const statusMap: {[key: string]: ApplicationStatus} = {};
                    
                    statusResults.forEach(result => {
                        statusMap[result.lowonganId] = result.status;
                    });
                    
                    setApplicationStatuses(statusMap);
                    console.log("Application statuses fetched:", statusMap);
                }

                setError(null);
            } catch (err: any) {
                console.error("API Error:", err);
                
                if (err?.status === 401) {
                    localStorage.removeItem('authToken');
                    sessionStorage.removeItem('authToken');
                    router.push('/login');
                    return;
                } else if (err?.status === 403) {
                    // Decode token untuk dapat role dan redirect ke dashboard yang sesuai
                    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
                    if (token) {
                        try {
                            const payload = JSON.parse(atob(token.split('.')[1]));
                            const userRole = payload.role;
                            
                            if (userRole === 'DOSEN') {
                                router.push('/dashboard/dosen');
                            } else if (userRole === 'ADMIN') {
                                router.push('/dashboard/admin');
                            } else if (userRole === 'MAHASISWA') {
                                router.push('/dashboard/mahasiswa');
                            } else {
                                router.push('/login');
                            }
                        } catch (e) {
                            router.push('/login');
                        }
                    } else {
                        router.push('/login');
                    }
                    return;
                }
                
                let errorMessage: string;
                switch (err?.status) {
                    case 404:
                        errorMessage = "Lowongan data not found";
                        break;
                    case 500:
                        errorMessage = "Internal server error. Please try again later";
                        break;
                    default:
                        errorMessage = err?.message || "An unexpected error occurred. Please try again";
                }
                
                setError(errorMessage);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLowonganAndStatuses();
    }, [router]);

    // Handler to update application status when user applies
    const handleApplicationUpdate = (lowonganId: string, newApplication: any) => {
        const newStatus: ApplicationStatus = {
            hasApplied: true,
            status: "BELUM_DIPROSES",
            pendaftaranId: newApplication?.pendaftaranId
        };
        
        setApplicationStatuses(prev => ({
            ...prev,
            [lowonganId]: newStatus
        }));
        
        console.log(`Updated status for lowongan ${lowonganId}:`, newStatus);
    };
    
    if (isLoading) {
        return <div className="p-8 text-center">Loading lowongan data...</div>;
    }
    
    if (error) {
        return <div className="p-8 text-red-500 text-center">{error}</div>;
    }
    
    return(
        <MahasiswaSidebar>
            <ListLowongan 
                data={lowonganData?.data?.lowongan_list || lowonganData?.lowongan_list || []}
                applicationStatuses={applicationStatuses}
                onApplicationUpdate={handleApplicationUpdate}
            />
        </MahasiswaSidebar>
    )
}
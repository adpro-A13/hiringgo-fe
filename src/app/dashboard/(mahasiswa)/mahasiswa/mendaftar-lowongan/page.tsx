"use client";

import MahasiswaSidebar from "@/components/dashboard/mahasiswa/sidebar";
import ListLowongan from "@/components/manajemenlowongan/list-lowongan";
import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import { fetcher } from "@/components/lib/fetcher";


export default function Mahasiswa(){
    const [lowonganData, setLowonganData] = useState<any>();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    
    useEffect(() => {
        const fetchLowongan = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const data = await fetcher<any>("/api/lowongandaftar/list", undefined, {
                    method: "GET",
                });

                setLowonganData(data);
                setError(null);
                console.log("Lowongan data fetched successfully:", data);
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
                                router.push('/login'); // fallback jika role tidak dikenali
                            }
                        } catch (e) {
                            router.push('/login'); // fallback jika token decode gagal
                        }
                    } else {
                        router.push('/login'); // fallback jika tidak ada token
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

        fetchLowongan();
    }, [router]);
    
    const lowonganList = lowonganData?.lowongan_list || [];
    console.log("Lowongan List:", lowonganList);
        if (isLoading) {
            return <div className="p-8 text-center">Loading lowongan data...</div>;
        }
        console.log(lowonganData);
        if (error) {
            return <div className="p-8 text-red-500 text-center">{error}</div>;
        }
    
    return(
        <MahasiswaSidebar><ListLowongan data={lowonganData.data.lowongan_list}/></MahasiswaSidebar>
    )
}
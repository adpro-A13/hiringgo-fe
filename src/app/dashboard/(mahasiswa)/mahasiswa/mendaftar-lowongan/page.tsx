"use client";

import MahasiswaSidebar from "@/components/dashboard/mahasiswa/sidebar";
import ListLowongan from "@/components/manajemenlowongan/list-lowongan";
import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';


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
                const response = await fetch("/api/lowongandaftar/list",
                    {
                        method: "GET", 
                    }
                );

                if (!response.ok) {
                    let errorMessage = `HTTP error! Status: ${response.status}`;
                    
                    switch (response.status) {
                        case 401:
                            localStorage.removeItem('authToken');
                            sessionStorage.removeItem('authToken');
                            router.push('/login');
                            return;
                        case 403:
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
                        case 404:
                            errorMessage = "Lowongan data not found";
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
                setLowonganData(data);
                setError(null);
                console.log("Lowongan data fetched successfully:", lowonganData);
            } catch (err) {
                console.error("API Error:", err);
                
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
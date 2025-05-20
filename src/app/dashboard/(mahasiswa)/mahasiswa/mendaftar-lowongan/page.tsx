"use client";

import MahasiswaSidebar from "@/components/dashboard/mahasiswa/sidebar";
import ListLowongan from "@/components/manajemenlowongan/list-lowongan";
import { useEffect, useState } from "react";


export default function Mahasiswa(){
    const [lowonganData, setLowonganData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
        useEffect(() => {
            const fetchLowongan = async () => {
                try {
                    setIsLoading(true);
                    const response = await fetch("/api/lowongandaftar/list",
                        {
                            method: "GET", 
                            headers: {"Authorization": `Bearer eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiTUFIQVNJU1dBIiwibmltIjoiMTIzMzIxMiIsImZ1bGxOYW1lIjoibWhzMSIsImlkIjoiY2QwMGIwMDctYTAzMC00NDI1LTk0ODgtZGZhODMwYzE0OTBhIiwiZW1haWwiOiJhYWEyMTIyMUBnbWFpbC5jb20iLCJzdWIiOiJhYWEyMTIyMUBnbWFpbC5jb20iLCJpYXQiOjE3NDc3MTgzMzgsImV4cCI6MTc0NzcyMTkzOH0.E7H7P188CJ3Jl2efNXTSBSnF1qMsNvZVEmK_eOmTaXc`,}
                        }
                    );
    
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
    
                    const data = await response.json();
                    setLowonganData(data);
                    setError(null);
                } catch (err) {
                    console.error("API Error:", err);
                    setError(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
                } finally {
                    setIsLoading(false);
                }
            };
    
            fetchLowongan();
        }, []);
    
        if (isLoading) {
            return <div className="p-8 text-center">Loading lowongan data...</div>;
        }
        console.log(lowonganData);
        if (error) {
            return <div className="p-8 text-red-500 text-center">{error}</div>;
        }
    
    return(
        <MahasiswaSidebar><ListLowongan data={lowonganData}/></MahasiswaSidebar>
    )
}
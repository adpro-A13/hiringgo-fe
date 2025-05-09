"use client";

import { useState, useEffect } from "react";
import ListLowongan from "@/components/manajemenlowongan/list-lowongan";
import { API_BASE_URL } from "@/libs/constants";

export default function ManajemenLowonganPage() {
    const [lowonganData, setLowonganData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchLowongan = async () => {
            try {
                setIsLoading(true);
                const response = await fetch("/api/lowongan");

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

    if (error) {
        return <div className="p-8 text-red-500 text-center">{error}</div>;
    }

    return (
        <div className="container mx-auto">
            <h1 className="text-2xl font-bold mt-6 mb-2">Manajemen Lowongan</h1>
            <p className="mb-6">Halaman ini digunakan untuk mengelola lowongan asisten dosen.</p>
            <ListLowongan data={lowonganData} />
        </div>
    );
}
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { API_BASE_URL } from "@/libs/constants";
import Link from "next/link";

interface LowonganDetail {
    lowonganId: string;
    judul: string;
    mataKuliah: string;
    deskripsi: string;
    persyaratan: string;
    jumlahAsdosDibutuhkan: number;
    jumlahAsdosPendaftar: number;
}

interface FormData {
    ipk: string;
    sks: string;
}

export default function DaftarLowonganPage() {
    const router = useRouter();
    const params = useParams();
    const lowonganId = params?.id as string;

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [lowongan, setLowongan] = useState<LowonganDetail | null>(null);
    const [formData, setFormData] = useState<FormData>({
        ipk: "",
        sks: ""
    });

    useEffect(() => {
        if (lowonganId) {
            fetchLowonganDetail();
        }
    }, [lowonganId]);

    const fetchLowonganDetail = async (): Promise<void> => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/lowongandaftar/${lowonganId}`);

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            setLowongan(data);
        } catch (err) {
            console.error("API Error:", err);
            setError(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const { name, value } = e.target;
        setFormData(prevState => ({ ...prevState, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        setLoading(true);
        resetMessages();

        try {
            await submitApplication();
            handleSubmitSuccess();
        } catch (error) {
            handleSubmitError(error);
        } finally {
            setLoading(false);
        }
    };

    const resetMessages = (): void => {
        setError(null);
        setSuccess(null);
    };

    const submitApplication = async (): Promise<Response> => {

        const response = await fetch(`${API_BASE_URL}/api/lowongandaftar/${lowonganId}/daftar`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                ipk: parseFloat(formData.ipk),
                sks: parseInt(formData.sks)
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Failed to submit application");
        }

        return response;
    };

    const handleSubmitSuccess = (): void => {
        setSuccess("Pendaftaran berhasil disubmit!");
        setFormData({ ipk: "", sks: "" });

        setTimeout(() => {
            router.push(`/lowongan/${lowonganId}`);
        }, 2000);
    };

    const handleSubmitError = (error: unknown): void => {
        console.error("Application submission failed:", error);
        setError(error instanceof Error ? error.message : "Network error. Please try again.");
    };

    if (!lowongan) {
        return (
            <div className="container mx-auto p-4">
                <div className="text-center py-8">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2">Loading vacancy details...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 max-w-3xl">
            <h1 className="text-2xl font-bold mb-4">Pendaftaran Asisten Dosen</h1>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                    {success}
                </div>
            )}

            <div className="bg-white shadow-md rounded p-6 mb-6">
                <h2 className="text-xl font-semibold mb-2">{lowongan.judul}</h2>
                <p className="text-gray-600 mb-4">Mata Kuliah: {lowongan.mataKuliah}</p>

                <div className="mb-4">
                    <h3 className="font-semibold">Deskripsi:</h3>
                    <p className="text-gray-700">{lowongan.deskripsi}</p>
                </div>

                <div className="mb-4">
                    <h3 className="font-semibold">Persyaratan:</h3>
                    <p className="text-gray-700">{lowongan.persyaratan}</p>
                </div>

                <div className="mb-4">
                    <h3 className="font-semibold">Posisi tersedia:</h3>
                    <p className="text-gray-700">
                        {lowongan.jumlahAsdosPendaftar} dari {lowongan.jumlahAsdosDibutuhkan} posisi terisi
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white shadow-md rounded p-6">
                <h2 className="text-lg font-semibold mb-4">Form Pendaftaran</h2>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="ipk">
                        IPK Anda
                    </label>
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="ipk"
                        name="ipk"
                        type="number"
                        step="0.01"
                        min="0"
                        max="4.0"
                        placeholder="Contoh: 3.50"
                        value={formData.ipk}
                        onChange={handleChange}
                        required
                    />
                    <p className="text-xs text-gray-500 mt-1">Masukkan IPK dengan format angka (maksimal 4.0)</p>
                </div>

                <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="sks">
                        Jumlah SKS yang Sudah Diambil
                    </label>
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="sks"
                        name="sks"
                        type="number"
                        min="0"
                        placeholder="Contoh: 100"
                        value={formData.sks}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="flex items-center justify-between">
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? "Mengirim..." : "Submit Pendaftaran"}
                    </button>
                    <Link href={`/lowongan/${lowonganId}`}
                          className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800">
                        Kembali ke Detail Lowongan
                    </Link>
                </div>
            </form>
        </div>
    );
}
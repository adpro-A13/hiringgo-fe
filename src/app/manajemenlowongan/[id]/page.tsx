"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface LowonganDetail {
    lowonganId: string;
    idMataKuliah: string;
    mataKuliah: string;
    tahunAjaran: string;
    semester: string;
    statusLowongan: string;
    judul: string;
    deskripsi: string;
    persyaratan: string;
    jumlahAsdosDibutuhkan: number;
    jumlahAsdosDiterima: number;
    jumlahAsdosPendaftar: number;
}

interface FormData {
    ipk: string;
    sks: string;
}

export default function DetailLowonganPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const { id } = params;

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [lowongan, setLowongan] = useState<LowonganDetail | null>(null);
    const [formData, setFormData] = useState<FormData>({
        ipk: "",
        sks: ""
    });

    useEffect(() => {
        fetchLowonganDetail();
    }, [id]);

    const fetchLowonganDetail = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/lowongandaftar/${id}`);

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            setLowongan(data);
        } catch (err) {
            console.error("Failed to fetch lowongan details:", err);
            setError(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prevState => ({ ...prevState, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        setSuccess(null);

        try {
            const response = await fetch(`/api/lowongandaftar/${id}/daftar`, {
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
                throw new Error(errorText || `Error ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            setSuccess("Pendaftaran berhasil disubmit!");
            setFormData({ ipk: "", sks: "" });

            // Redirect after successful submission
            setTimeout(() => {
                router.push(`/manajemenlowongan`);
            }, 2000);
        } catch (err) {
            console.error("Failed to submit application:", err);
            setError(`${err instanceof Error ? err.message : "Unknown error"}`);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4">Loading lowongan details...</p>
            </div>
        );
    }

    if (error && !lowongan) {
        return (
            <div className="container mx-auto p-8">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <p className="font-bold">Error</p>
                    <p>{error}</p>
                    <Link href="/manajemenlowongan" className="text-blue-500 underline mt-4 inline-block">
                        Return to listing
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <Link href="/manajemenlowongan" className="text-blue-500 hover:underline mb-6 inline-block">
                &larr; Back to Lowongan List
            </Link>

            <h1 className="text-3xl font-bold mb-4">Pendaftaran Asisten Dosen</h1>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
                    {success}
                </div>
            )}

            {lowongan && (
                <>
                    <div className="bg-white shadow-md rounded p-6 mb-8">
                        <h2 className="text-2xl font-semibold mb-2">{lowongan.judul || lowongan.mataKuliah}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <p className="text-sm text-gray-600">Mata Kuliah</p>
                                <p className="font-medium">{lowongan.idMataKuliah} - {lowongan.mataKuliah}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Tahun Ajaran / Semester</p>
                                <p className="font-medium">{lowongan.tahunAjaran} ({lowongan.semester})</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Status</p>
                                <p className="font-medium">{lowongan.statusLowongan}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Kuota</p>
                                <p className="font-medium">
                                    {lowongan.jumlahAsdosPendaftar} pendaftar / {lowongan.jumlahAsdosDiterima} diterima / {lowongan.jumlahAsdosDibutuhkan} dibutuhkan
                                </p>
                            </div>
                        </div>

                        {lowongan.deskripsi && (
                            <div className="mb-4">
                                <h3 className="font-semibold text-lg">Deskripsi:</h3>
                                <p className="text-gray-700">{lowongan.deskripsi}</p>
                            </div>
                        )}

                        {lowongan.persyaratan && (
                            <div className="mb-4">
                                <h3 className="font-semibold text-lg">Persyaratan:</h3>
                                <p className="text-gray-700">{lowongan.persyaratan}</p>
                            </div>
                        )}
                    </div>

                    <div className="bg-white shadow-md rounded p-6">
                        <h2 className="text-xl font-semibold mb-4">Form Pendaftaran</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-6">
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
                                    max="24"
                                    placeholder="Contoh: 100"
                                    value={formData.sks}
                                    onChange={handleChange}
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">Masukkan jumlah SKS yang sudah Anda ambil (maksimal 24)</p>
                            </div>

                            <div className="flex items-center justify-between">
                                <button
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                    type="submit"
                                    disabled={submitting}
                                >
                                    {submitting ? "Mengirim..." : "Submit Pendaftaran"}
                                </button>
                            </div>
                        </form>
                    </div>
                </>
            )}
        </div>
    );
}
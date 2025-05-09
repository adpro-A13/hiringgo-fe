"use client"

import { useState, useEffect } from "react";
import Link from "next/link";

interface Lowongan {
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
    idAsdosDiterima: string[];
}

export default function ListLowongan({ data }: { data: Lowongan[] }) {
    const [lowonganBySemester, setLowonganBySemester] = useState<{
        [key: string]: Lowongan[];
    }>({});

    useEffect(() => {
        // Group lowongan by tahunAjaran and semester
        const grouped = data.reduce((acc, lowongan) => {
            const key = `${lowongan.semester} ${lowongan.tahunAjaran}`;
            if (!acc[key]) {
                acc[key] = [];
            }
            acc[key].push(lowongan);
            return acc;
        }, {} as { [key: string]: Lowongan[] });

        setLowonganBySemester(grouped);
    }, [data]);

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-4">Daftar Lowongan</h1>
            <p className="mb-6">List lowongan yang tersedia untuk pendaftaran</p>

            {Object.entries(lowonganBySemester).map(([semester, lowongans]) => (
                <div key={semester} className="mb-10">
                    <h2 className="text-xl font-semibold mb-4">{semester}</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                            <tr className="bg-blue-900 text-white">
                                <th className="border px-4 py-2 text-center">No</th>
                                <th className="border px-4 py-2">Mata Kuliah / Nama Lowongan</th>
                                <th className="border px-4 py-2">Status Lowongan</th>
                                <th className="border px-4 py-2">Jumlah Lowongan</th>
                                <th className="border px-4 py-2">Jumlah Pelamar</th>
                                <th className="border px-4 py-2">Jumlah Pelamar Diterima</th>
                                <th className="border px-4 py-2">Status Lamaran</th>
                                <th className="border px-4 py-2">Daftar/Detail</th>
                            </tr>
                            </thead>
                            <tbody>
                            {lowongans.map((lowongan, index) => (
                                <tr key={lowongan.lowonganId} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                    <td className="border px-4 py-2 text-center">{index + 1}</td>
                                    <td className="border px-4 py-2">
                                        {lowongan.idMataKuliah} - {lowongan.mataKuliah}
                                    </td>
                                    <td className="border px-4 py-2">{lowongan.statusLowongan}</td>
                                    <td className="border px-4 py-2">{lowongan.jumlahAsdosDibutuhkan} asisten</td>
                                    <td className="border px-4 py-2">{lowongan.jumlahAsdosPendaftar} mahasiswa</td>
                                    <td className="border px-4 py-2">{lowongan.jumlahAsdosDiterima} mahasiswa</td>
                                    <td className="border px-4 py-2">
                                        {/* This would need to be replaced with actual status if you have user-specific data */}
                                        {lowongan.statusLowongan}
                                    </td>
                                    <td className="border px-4 py-2 text-center">
                                        {lowongan.statusLowongan === "DIBUKA" ? (
                                            <Link
                                                href={`/manajemenlowongan/${lowongan.lowonganId}`}
                                                className="bg-blue-100 text-blue-800 px-3 py-1 rounded hover:bg-blue-200"
                                            >
                                                Daftar
                                            </Link>
                                        ) : (
                                            <Link
                                                href={`/manajemenlowongan/${lowongan.lowonganId}`}
                                                className="bg-gray-100 text-gray-800 px-3 py-1 rounded hover:bg-gray-200"
                                            >
                                                Detail
                                            </Link>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ))}
        </div>
    );
}
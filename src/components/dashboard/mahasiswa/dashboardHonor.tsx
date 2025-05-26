'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Calendar, Clock, DollarSign } from 'lucide-react';

// Types based on actual API response
interface User {
    id: string;
    password: string;
    nim: string;
    fullName: string;
    authorities: Array<{ authority: string }>;
    username: string;
    enabled: boolean;
    accountNonExpired: boolean;
    credentialsNonExpired: boolean;
    accountNonLocked: boolean;
}

interface Pendaftaran {
    pendaftaranId: string;
    kandidat: User;
    ipk: number;
    sks: number;
    waktuDaftar: string;
    status: string;
}

interface Log {
    id: string;
    pendaftaran: Pendaftaran;
    user: User;
    judul: string;
    keterangan: string;
    kategori: 'ASISTENSI' | 'MENGOREKSI' | 'MENGAWAS' | 'LAIN_LAIN';
    waktuMulai: string;
    waktuSelesai: string;
    tanggalLog: string;
    pesanUntukDosen: string;
    status: 'MENUNGGU' | 'DITERIMA' | 'DITOLAK';
}

interface HonorData {
    bulan: string;
    tahun: number;
    lowongan: string;
    totalJam: number;
    totalHonor: number;
    jumlahLog: number;
}

const TotalHonorMahasiswa = () => {
    const [logs, setLogs] = useState<Log[]>([]);
    const [honorData, setHonorData] = useState<HonorData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);

    const token = "eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiTUFIQVNJU1dBIiwibmltIjoiMSIsImZ1bGxOYW1lIjoidXNlcjEiLCJpZCI6IjVmMzlmYzUyLTExOGQtNDMxNi05ODExLWM3NTJkYzNmYWM1MCIsImVtYWlsIjoidGVzdDFAZW1haWwuY29tIiwic3ViIjoidGVzdDFAZW1haWwuY29tIiwiaWF0IjoxNzQ4MjQzMDg1LCJleHAiOjE3NDgyNDY2ODV9.-A8PSXw_F-0XQjqbp8Eq4ZHPkf94TmamK4v9r2SSLWQ";
    const mahasiswaId = "5f39fc52-118d-4316-9811-c752dc3fac50";

    const HONOR_PER_JAM = 27500;

    useEffect(() => {
        fetchLogs();
    }, [selectedMonth, selectedYear]);

    useEffect(() => {
        if (logs.length > 0) {
            processHonorData();
        }
    }, [logs]);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`http://localhost:8080/api/logs/month?id=${mahasiswaId}&bulan=${selectedMonth}&tahun=${selectedYear}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error('Gagal mengambil data log');
            }

            const data = await response.json();
            // Filter hanya log yang diterima
            const acceptedLogs = data.filter((log: Log) => log.status === 'DITERIMA');
            setLogs(acceptedLogs);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
        } finally {
            setLoading(false);
        }
    };

    const calculateDuration = (startTime: string, endTime: string): number => {
        // Handle format "HH:MM:SS"
        const parseTime = (timeString: string) => {
            const parts = timeString.split(':');
            const hours = parseInt(parts[0]);
            const minutes = parseInt(parts[1]);
            return hours * 60 + minutes;
        };

        const startMinutes = parseTime(startTime);
        const endMinutes = parseTime(endTime);

        return (endMinutes - startMinutes) / 60; // Return in hours
    };

    const processHonorData = () => {
        const honorMap = new Map<string, HonorData>();

        logs.forEach(log => {
            const logDate = new Date(log.tanggalLog);
            const bulan = logDate.toLocaleDateString('id-ID', { month: 'long' });
            const lowongan = `${log.kategori} - ${log.judul}`;
            const key = `${bulan}-${selectedYear}-${lowongan}`;

            const duration = calculateDuration(log.waktuMulai, log.waktuSelesai);

            if (honorMap.has(key)) {
                const existing = honorMap.get(key)!;
                existing.totalJam += duration;
                existing.jumlahLog += 1;
                existing.totalHonor = existing.totalJam * HONOR_PER_JAM;
            } else {
                honorMap.set(key, {
                    bulan,
                    tahun: selectedYear,
                    lowongan,
                    totalJam: duration,
                    totalHonor: duration * HONOR_PER_JAM,
                    jumlahLog: 1
                });
            }
        });

        const sortedData = Array.from(honorMap.values());
        setHonorData(sortedData);
    };

    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const getTotalHonorByMonth = (): number => {
        return honorData.reduce((total, data) => total + data.totalHonor, 0);
    };

    const months = [
        { value: 1, label: 'Januari' },
        { value: 2, label: 'Februari' },
        { value: 3, label: 'Maret' },
        { value: 4, label: 'April' },
        { value: 5, label: 'Mei' },
        { value: 6, label: 'Juni' },
        { value: 7, label: 'Juli' },
        { value: 8, label: 'Agustus' },
        { value: 9, label: 'September' },
        { value: 10, label: 'Oktober' },
        { value: 11, label: 'November' },
        { value: 12, label: 'Desember' }
    ];

    const years = [2023, 2024, 2025, 2026]; // You can make this dynamic based on your needs

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="text-red-600 mb-4">{error}</div>
                <Button onClick={fetchLogs}>Coba Lagi</Button>
            </div>
        );
    }

    const monthlyTotal = getTotalHonorByMonth();
    const selectedMonthName = months.find(m => m.value === selectedMonth)?.label || '';

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Total Honor Asisten</h1>
                <div className="flex gap-2">
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(Number(e.target.value))}
                        className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {months.map(month => (
                            <option key={month.value} value={month.value}>
                                {month.label}
                            </option>
                        ))}
                    </select>
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                        className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {years.map(year => (
                            <option key={year} value={year}>
                                {year}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {honorData.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-600">
                        Tidak ada data honor untuk {selectedMonthName} {selectedYear}
                    </p>
                </div>
            ) : (
                <>
                    {/* Summary Card */}
                    <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <DollarSign className="w-5 h-5" />
                                Total Honor {selectedMonthName} {selectedYear}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">
                                {formatCurrency(monthlyTotal)}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                                Total dari {honorData.reduce((sum, data) => sum + data.jumlahLog, 0)} log yang diterima
                            </p>
                        </CardContent>
                    </Card>

                    {/* Detail per Lowongan */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-3">
                            <Calendar className="w-4 h-4" />
                            <h2 className="text-lg font-semibold">Detail Lowongan - {selectedMonthName} {selectedYear}</h2>
                        </div>

                        <div className="grid gap-4">
                            {honorData.map((data, index) => (
                                <Card key={index}>
                                    <CardContent className="pt-4">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <h3 className="font-medium text-gray-900">
                                                    {data.lowongan}
                                                </h3>
                                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {data.totalJam.toFixed(1)} jam
                                                    </div>
                                                    <div>
                                                        {data.jumlahLog} log
                                                    </div>
                                                    <div>
                                                        {formatCurrency(HONOR_PER_JAM)}/jam
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-lg font-semibold text-green-600">
                                                    {formatCurrency(data.totalHonor)}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default TotalHonorMahasiswa;
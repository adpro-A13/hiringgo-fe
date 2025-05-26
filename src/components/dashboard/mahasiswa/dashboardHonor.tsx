'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Calendar, Clock, DollarSign } from 'lucide-react';
import { fetcher } from '@/components/lib/fetcher'; // Adjust path as needed

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

interface CurrentUser {
    id: string;
    fullName: string;
    email: string;
    role: string;
    nim?: string;
}

interface JWTPayload {
    id: string;
    email: string;
    role: string;
    fullName?: string;
    sub: string;
    exp: number;
    iat: number;
}

const TotalHonorMahasiswa = () => {
    const [logs, setLogs] = useState<Log[]>([]);
    const [honorData, setHonorData] = useState<HonorData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
    const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

    const HONOR_PER_JAM = 27500;

    useEffect(() => {
        initializeComponent();
    }, []);

    useEffect(() => {
        if (currentUser && (selectedMonth || selectedYear)) {
            fetchLogs();
        }
    }, [selectedMonth, selectedYear, currentUser]);

    useEffect(() => {
        if (logs.length > 0) {
            processHonorData();
        } else {
            setHonorData([]);
        }
    }, [logs]);

    const initializeComponent = async () => {
        try {
            setLoading(true);
            setError(null);

            // Get current user info first
            await getCurrentUser();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Gagal memuat data pengguna');
            setLoading(false);
        }
    };

    const getCurrentUser = async () => {
        try {
            const userData = getUserFromJWT();
            setCurrentUser(userData);
        } catch (err) {
            throw new Error('Gagal mendapatkan informasi pengguna');
        }
    };

    const getUserFromJWT = (): CurrentUser => {
        try {
            // Get JWT token from cookies
            const cookies = document.cookie.split(';');
            const tokenCookie = cookies.find(cookie =>
                cookie.trim().startsWith('authToken=')
            );

            if (!tokenCookie) {
                throw new Error('Token tidak ditemukan. Silakan login kembali.');
            }

            const token = tokenCookie.split('=')[1]?.trim();
            if (!token) {
                throw new Error('Token tidak valid. Silakan login kembali.');
            }

            // Decode JWT payload (this is just decoding, not verifying)
            const payload = JSON.parse(atob(token.split('.')[1])) as JWTPayload;

            // Check if token is expired
            const currentTime = Math.floor(Date.now() / 1000);
            if (payload.exp < currentTime) {
                throw new Error('Token telah kedaluwarsa. Silakan login kembali.');
            }

            return {
                id: payload.id,
                fullName: payload.fullName || 'Unknown User',
                email: payload.email,
                role: payload.role
            };
        } catch (err) {
            throw new Error(err instanceof Error ? err.message : 'Gagal mendapatkan informasi pengguna dari token');
        }
    };

    const fetchLogs = async () => {
        try {
            if (!currentUser?.id) {
                throw new Error('ID pengguna tidak ditemukan');
            }

            setLoading(true);
            setError(null);

            const data = await fetcher<Log[]>(
                `/api/logs/month?id=${currentUser.id}&bulan=${selectedMonth}&tahun=${selectedYear}`
            );

            // Filter hanya log yang diterima
            const acceptedLogs = data.filter((log: Log) => log.status === 'DITERIMA');
            setLogs(acceptedLogs);
        } catch (err: any) {
            setError(err.message || 'Gagal mengambil data log');
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

    const handleRetry = () => {
        if (currentUser) {
            fetchLogs();
        } else {
            initializeComponent();
        }
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
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
                    <p className="text-gray-600">Memuat data honor...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="text-center">
                    <div className="text-red-600 mb-4">{error}</div>
                    <Button onClick={handleRetry}>Coba Lagi</Button>
                </div>
            </div>
        );
    }

    const monthlyTotal = getTotalHonorByMonth();
    const selectedMonthName = months.find(m => m.value === selectedMonth)?.label || '';

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Total Honor Asisten</h1>
                    {currentUser && (
                        <p className="text-gray-600 mt-1">
                            {currentUser.fullName} {currentUser.nim && `(${currentUser.nim})`}
                        </p>
                    )}
                </div>
                <div className="flex gap-2">
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(Number(e.target.value))}
                        className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={loading}
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
                        disabled={loading}
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
                    <Button onClick={handleRetry} className="mt-4" variant="outline">
                        Refresh
                    </Button>
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
                            <p className="text-xs text-gray-500 mt-1">
                                Rate: {formatCurrency(HONOR_PER_JAM)} per jam
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
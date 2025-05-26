'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { fetcher } from '@/components/lib/fetcher'; // Adjust path as needed

// Updated Types to match the actual JSON structure
interface User {
    id: string;
    nim: string;
    fullName: string;
    username: string;
}

interface Pendaftaran {
    pendaftaranId: string;
    kandidat: User;
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

interface CurrentUser {
    id: string;
    fullName: string;
    email: string;
    role: string;
}

const ManajemenLog = () => {
    const [logs, setLogs] = useState<Log[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updating, setUpdating] = useState<string | null>(null);
    const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

    useEffect(() => {
        initializeComponent();
    }, []);

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
            const userData = await fetcher<CurrentUser>('/api/auth/me');
            setCurrentUser(userData);

            // Once we have user data, fetch logs
            await fetchLogs(userData.id);
        } catch (err) {
            throw new Error('Gagal mendapatkan informasi pengguna');
        }
    };

    const fetchLogs = async (dosenId?: string) => {
        try {
            const userId = dosenId || currentUser?.id;
            if (!userId) {
                throw new Error('ID pengguna tidak ditemukan');
            }

            const data = await fetcher<Log[]>(`/api/logs/dosen/${userId}`);
            setLogs(data);
        } catch (err) {
            throw new Error(err instanceof Error ? err.message : 'Gagal mengambil data log');
        } finally {
            setLoading(false);
        }
    };

    const updateLogStatus = async (logId: string, status: 'DITERIMA' | 'DITOLAK') => {
        try {
            setUpdating(logId);
            setError(null);

            await fetcher(`/api/logs/${logId}/status`, undefined, {
                method: 'PATCH',
                body: JSON.stringify(status)
            });

            // Update local state
            setLogs(prevLogs =>
                prevLogs.map(log =>
                    log.id === logId ? { ...log, status } : log
                )
            );

        } catch (err: any) {
            setError(err.message || 'Gagal mengupdate status');
        } finally {
            setUpdating(null);
        }
    };

    const getStatusBadge = (status: string) => {
        if (status === 'MENUNGGU') {
            return <Badge variant="secondary" className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Menunggu
            </Badge>;
        }
        if (status === 'DITERIMA') {
            return <Badge variant="default" className="flex items-center gap-1 bg-green-600">
                <CheckCircle2 className="w-3 h-3" />
                Diterima
            </Badge>;
        }
        return <Badge variant="destructive" className="flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            Ditolak
        </Badge>;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID');
    };

    const formatTime = (timeString: string) => {
        return timeString.substring(0, 5);
    };

    const handleRetry = () => {
        initializeComponent();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
                    <p className="text-gray-600">Memuat data...</p>
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

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Manajemen Log Asisten</h1>
                {currentUser && (
                    <p className="text-gray-600 mt-1">
                        Selamat datang, {currentUser.fullName}
                    </p>
                )}
            </div>

            {logs.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-600">Tidak ada log yang tersedia</p>
                    <Button onClick={handleRetry} className="mt-4" variant="outline">
                        Refresh
                    </Button>
                </div>
            ) : (
                <div className="space-y-4">
                    {logs.map((log) => (
                        <Card key={log.id}>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-lg">{log.judul}</CardTitle>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {log.user.fullName} ({log.user.nim}) - {formatDate(log.tanggalLog)}
                                        </p>
                                    </div>
                                    {getStatusBadge(log.status)}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div>
                                        <p className="font-medium">Kategori:</p>
                                        <p className="text-sm">{log.kategori}</p>
                                    </div>

                                    <div>
                                        <p className="font-medium">Waktu:</p>
                                        <p className="text-sm">{formatTime(log.waktuMulai)} - {formatTime(log.waktuSelesai)}</p>
                                    </div>

                                    <div>
                                        <p className="font-medium">Keterangan:</p>
                                        <p className="text-sm bg-gray-50 p-2 rounded">{log.keterangan}</p>
                                    </div>

                                    {log.pesanUntukDosen && (
                                        <div>
                                            <p className="font-medium">Pesan untuk Dosen:</p>
                                            <p className="text-sm bg-blue-50 p-2 rounded">{log.pesanUntukDosen}</p>
                                        </div>
                                    )}

                                    {log.status === 'MENUNGGU' && (
                                        <div className="flex gap-2 pt-2">
                                            <Button
                                                onClick={() => updateLogStatus(log.id, 'DITERIMA')}
                                                disabled={updating === log.id}
                                                className="bg-green-600 hover:bg-green-700 text-white"
                                                size="sm"
                                            >
                                                {updating === log.id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    'Terima'
                                                )}
                                            </Button>
                                            <Button
                                                onClick={() => updateLogStatus(log.id, 'DITOLAK')}
                                                disabled={updating === log.id}
                                                variant="destructive"
                                                size="sm"
                                            >
                                                {updating === log.id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    'Tolak'
                                                )}
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ManajemenLog;
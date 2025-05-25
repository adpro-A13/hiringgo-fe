'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, XCircle, Clock } from 'lucide-react';

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

const ManajemenLog = () => {
    const [logs, setLogs] = useState<Log[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updating, setUpdating] = useState<string | null>(null);

    const token = "eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiRE9TRU4iLCJuaXAiOiIxIiwiZnVsbE5hbWUiOiJkb3NlbjEiLCJpZCI6ImIyOTE0ZDhmLWVmOGYtNDFlMi1iNjgzLTYwMmI1NGM2OGY4ZCIsImVtYWlsIjoiZG9zZW4xQGVtYWlsLmNvbSIsInN1YiI6ImRvc2VuMUBlbWFpbC5jb20iLCJpYXQiOjE3NDgxNzEzNzgsImV4cCI6MTc0ODE3NDk3OH0.8Y7w1u8X1HioBKGbQK9xwF_uFh-ru5qenMoOcmuRa2Q";
    const dosenId = "b2914d8f-ef8f-41e2-b683-602b54c68f8d";

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`http://localhost:8080/api/logs/dosen/${dosenId}`, {
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
            setLogs(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
        } finally {
            setLoading(false);
        }
    };

    const updateLogStatus = async (logId: string, status: 'DITERIMA' | 'DITOLAK') => {
        try {
            setUpdating(logId);
            setError(null);

            const response = await fetch(`http://localhost:8080/api/logs/${logId}/status`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(status)
            });

            if (!response.ok) {
                throw new Error('Gagal mengupdate status');
            }

            setLogs(prevLogs =>
                prevLogs.map(log =>
                    log.id === logId ? { ...log, status } : log
                )
            );

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Gagal mengupdate status');
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

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Manajemen Log Asisten</h1>

            {logs.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-600">Tidak ada log yang tersedia</p>
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
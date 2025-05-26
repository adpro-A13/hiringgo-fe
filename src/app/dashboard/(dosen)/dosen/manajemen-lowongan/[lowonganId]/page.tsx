'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminSidebar from "@/components/dashboard/dosen/sidebar";
import { fetcher } from "@/components/lib/fetcher";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface LowonganDTO {
  lowonganId: string;
  idMataKuliah: string;
  namaMataKuliah: string;
  deskripsiMataKuliah: string;
  tahunAjaran: string;
  semester: string;
  statusLowongan: string;
  jumlahAsdosDibutuhkan: number;
  jumlahAsdosDiterima: number;
  jumlahAsdosPendaftar: number;
  idDaftarPendaftaran: string[];
}

const LowonganDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const lowonganId = params?.lowonganId as string;

  const [lowongan, setLowongan] = useState<LowonganDTO | null>(null);
  const [editLowongan, setEditLowongan] = useState<Partial<LowonganDTO>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    if (!lowonganId) return;
    fetchLowongan();
  }, [lowonganId]);

  const fetchLowongan = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await fetcher<LowonganDTO>(`/api/lowongan/${lowonganId}`);
      setLowongan(data);
    } catch (err: any) {
  console.error("Raw error:", err);
  console.error("Error accepting applicant:", JSON.stringify(err, null, 2));

  toast.error(`Gagal menerima pendaftar: ${
    err.message || err.toString() || "Unknown error"
  }`);
}
 finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditLowongan(prev => ({
      ...prev,
      [name]: name.includes("jumlah") ? parseInt(value) : value,
    }));
  };

  const handleUpdate = async () => {
    if (!lowongan) return;
    setIsSubmitting(true);
    
    try {
      const updatedData = {
        ...lowongan,
        ...editLowongan,
        lowonganId: lowongan.lowonganId,
      };
      
      const updated = await fetcher<LowonganDTO>(`/api/lowongan/${lowonganId}`, undefined, {
        method: 'PUT',
        body: JSON.stringify(updatedData),
      });
      
      setLowongan(updated);
      toast.success("Lowongan berhasil diupdate!");
    } catch (err: any) {
      console.error("Error updating lowongan:", err);
      toast.error(`Gagal update: ${err.message || "Unknown error"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTerimaPendaftar = async (id: string) => {
    setActionLoading(prev => ({ ...prev, [id]: true }));
    
    try {
      await fetcher(`/api/lowongan/${lowonganId}/terima/${id}`, undefined, {
        method: 'POST'
      });
      
      toast.success('Pendaftar berhasil diterima.');
      fetchLowongan(); // Refresh data
    } catch (err: any) {
      console.error("Error accepting applicant:", err);
      toast.error(`Gagal menerima pendaftar: ${err.message || "Unknown error"}`);
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleTolakPendaftar = async (id: string) => {
    setActionLoading(prev => ({ ...prev, [id]: true }));
    
    try {
      await fetcher(`/api/lowongan/${lowonganId}/tolak/${id}`, undefined, {
        method: 'POST'
      });
      
      toast.success('Pendaftar berhasil ditolak.');
      fetchLowongan(); // Refresh data
    } catch (err: any) {
      console.error("Error rejecting applicant:", err);
      toast.error(`Gagal menolak pendaftar: ${err.message || "Unknown error"}`);
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  return (
    <AdminSidebar>
      <div className="p-6">
        <button
          className="mb-4 px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
          onClick={() => router.push('/dashboard/dosen/manajemen-lowongan')}
        >
          ← Kembali ke Daftar Lowongan
        </button>

        {loading ? (
          <div className="flex items-center justify-center p-10">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2">Loading...</span>
          </div>
        ) : error ? (
          <div className="p-6 text-red-600 bg-red-50 rounded-lg border border-red-200">
            <h3 className="font-semibold mb-2">Error</h3>
            <p>{error}</p>
            <button 
              onClick={fetchLowongan}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        ) : !lowongan ? (
          <p>Data lowongan tidak ditemukan.</p>
        ) : (
          <div className="space-y-4">
            <h1 className="text-2xl font-bold">Detail Lowongan</h1>

            <div className="space-y-2 border p-4 rounded-lg bg-white shadow-sm">
              <label className="block font-semibold">Tahun Ajaran</label>
              <input
                className="border px-2 py-1 rounded w-full"
                type="text"
                name="tahunAjaran"
                defaultValue={lowongan.tahunAjaran}
                onChange={handleChange}
                disabled={isSubmitting}
              />

              <label className="block font-semibold">Semester</label>
              <select
                className="border px-2 py-1 rounded w-full"
                name="semester"
                defaultValue={lowongan.semester}
                onChange={handleChange}
                disabled={isSubmitting}
              >
                <option value="GANJIL">GANJIL</option>
                <option value="GENAP">GENAP</option>
              </select>

              <label className="block font-semibold">Status Lowongan</label>
              <select
                className="border px-2 py-1 rounded w-full"
                name="statusLowongan"
                defaultValue={lowongan.statusLowongan}
                onChange={handleChange}
                disabled={isSubmitting}
              >
                <option value="DIBUKA">DIBUKA</option>
                <option value="DITUTUP">DITUTUP</option>
              </select>

              <label className="block font-semibold">Jumlah Asdos Dibutuhkan</label>
              <input
                className="border px-2 py-1 rounded w-full"
                type="number"
                name="jumlahAsdosDibutuhkan"
                defaultValue={lowongan.jumlahAsdosDibutuhkan}
                onChange={handleChange}
                disabled={isSubmitting}
              />

              <button
                className={`mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center justify-center min-w-[150px] ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                onClick={handleUpdate}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Lowongan"
                )}
              </button>
            </div>

            <div className="mt-6 space-y-1 border p-4 rounded-lg bg-white shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Informasi Lowongan</h2>
              <p><strong>ID Lowongan:</strong> {lowongan.lowonganId}</p>
              <p><strong>Mata Kuliah:</strong> {lowongan.namaMataKuliah} ({lowongan.idMataKuliah})</p>
              <p><strong>Deskripsi:</strong> {lowongan.deskripsiMataKuliah}</p>
              <p><strong>Tahun Ajaran:</strong> {lowongan.tahunAjaran}</p>
              <p><strong>Semester:</strong> {lowongan.semester}</p>
              <p><strong>Status Lowongan:</strong> {lowongan.statusLowongan}</p>
              <p><strong>Jumlah Asdos Dibutuhkan:</strong> {lowongan.jumlahAsdosDibutuhkan}</p>
              <p><strong>Jumlah Asdos Diterima:</strong> {lowongan.jumlahAsdosDiterima}</p>
              <p><strong>Jumlah Asdos Pendaftar:</strong> {lowongan.jumlahAsdosPendaftar}</p>
            </div>

            <div className="mt-6 border p-4 rounded-lg bg-white shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Daftar Pendaftaran</h2>
              {lowongan.idDaftarPendaftaran?.length > 0 ? (
                <ul className="list-none space-y-2">
                  {lowongan.idDaftarPendaftaran.map((id) => (
                    <li key={id} className="flex items-center justify-between border p-2 rounded">
                      <span className="break-all">{id}</span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleTerimaPendaftar(id)}
                          className={`bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded flex items-center ${actionLoading[id] ? 'opacity-70 cursor-not-allowed' : ''}`}
                          disabled={actionLoading[id]}
                        >
                          {actionLoading[id] ? (
                            <>
                              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            "Terima"
                          )}
                        </button>

                        <button
                          onClick={() => handleTolakPendaftar(id)}
                          className={`bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded flex items-center ${actionLoading[id] ? 'opacity-70 cursor-not-allowed' : ''}`}
                          disabled={actionLoading[id]}
                        >
                          {actionLoading[id] ? (
                            <>
                              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            "Tolak"
                          )}
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Tidak ada pendaftaran.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminSidebar>
  );
};

export default LowonganDetailPage;
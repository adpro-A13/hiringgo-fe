'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminSidebar from "@/components/dashboard/dosen/sidebar";

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
  const lowonganId = params?.lowonganId;

  const [lowongan, setLowongan] = useState<LowonganDTO | null>(null);
  const [editLowongan, setEditLowongan] = useState<Partial<LowonganDTO>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!lowonganId) return;

    const fetchLowongan = async () => {
      try {
        const response = await fetch(`/api/lowongan/${lowonganId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
        });

        if (!response.ok) {
          throw new Error(`Gagal mengambil data lowongan dengan ID ${lowonganId}`);
        }

        const data: LowonganDTO = await response.json();
        setLowongan(data);
      } catch (err: any) {
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchLowongan();
  }, [lowonganId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditLowongan(prev => ({
      ...prev,
      [name]: name.includes("jumlah") ? parseInt(value) : value,
    }));
  };

  const handleUpdate = async () => {
    if (!lowongan) return;
    try {
      const response = await fetch(`/api/lowongan/${lowonganId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          ...lowongan,
          ...editLowongan,
          lowonganId: lowongan.lowonganId,
        }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const updated = await response.json();
      setLowongan(updated);
      alert("Lowongan berhasil diupdate!");
    } catch (err: any) {
      alert("Gagal update: " + err.message);
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
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-600">Error: {error}</p>
        ) : !lowongan ? (
          <p>Data lowongan tidak ditemukan.</p>
        ) : (
          <div className="space-y-4">
            <h1 className="text-2xl font-bold">Detail Lowongan</h1>

            <div className="space-y-2">
              <label className="block font-semibold">Tahun Ajaran</label>
              <input
                className="border px-2 py-1 rounded w-full"
                type="text"
                name="tahunAjaran"
                defaultValue={lowongan.tahunAjaran}
                onChange={handleChange}
              />

              <label className="block font-semibold">Semester</label>
              <select
                className="border px-2 py-1 rounded w-full"
                name="semester"
                defaultValue={lowongan.semester}
                onChange={handleChange}
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
              />
            </div>

            <button
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              onClick={handleUpdate}
            >
              Update Lowongan
            </button>

            <div className="mt-6 space-y-1">
              <p><strong>ID Lowongan:</strong> {lowongan.lowonganId}</p>
              <p><strong>Mata Kuliah:</strong> {lowongan.namaMataKuliah} ({lowongan.idMataKuliah})</p>
              <p><strong>Deskripsi:</strong> {lowongan.deskripsiMataKuliah}</p>
              <p><strong>Tahun Ajaran:</strong> {lowongan.tahunAjaran}</p>
              <p><strong>Semester:</strong> {lowongan.semester}</p>
              <p><strong>Status Lowongan:</strong> {lowongan.statusLowongan}</p>
              <p><strong>Jumlah Asdos Dibutuhkan:</strong> {lowongan.jumlahAsdosDibutuhkan}</p>
              <p><strong>Jumlah Asdos Diterima:</strong> {lowongan.jumlahAsdosDiterima}</p>
              <p><strong>Jumlah Asdos Pendaftar:</strong> {lowongan.jumlahAsdosPendaftar}</p>

              <h2 className="font-semibold mt-4">Daftar Pendaftaran (ID UUID):</h2>
              {lowongan.idDaftarPendaftaran?.length > 0 ? (
                <ul className="list-disc list-inside">
                  {lowongan.idDaftarPendaftaran.map((id) => (
                    <li key={id}>{id}</li>
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

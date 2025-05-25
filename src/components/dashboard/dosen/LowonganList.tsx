'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Semester = 'GENAP' | 'GANJIL';
type StatusLowongan = 'TERSEDIA' | 'TIDAK_TERSEDIA';

interface LowonganDTO {
  lowonganId: string;
  idMataKuliah: string;
  tahunAjaran: string;
  semester: Semester;
  statusLowongan: StatusLowongan;
  jumlahAsdosDibutuhkan: number;
  jumlahAsdosDiterima: number;
  jumlahAsdosPendaftar: number;
  idDaftarPendaftaran: string[];
}

export default function LowonganList() {
  const [lowonganList, setLowonganList] = useState<LowonganDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [sortStrategy, setSortStrategy] = useState<string>('');
  const [filterStrategy, setFilterStrategy] = useState('');
  const [filterValue, setFilterValue] = useState('');

  
  useEffect(() => {
    const token = "eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiRE9TRU4iLCJuaXAiOiIyMzA2MjE0OTkwIiwiZnVsbE5hbWUiOiJkb3NlbiIsImlkIjoiMzdlNGRjOWEtMmZlYy00MWE1LWFlOTgtMmRkNjcxODdjMTFjIiwiZW1haWwiOiJkb3NlbkBleGFtcGxlLmNvbSIsInN1YiI6ImRvc2VuQGV4YW1wbGUuY29tIiwiaWF0IjoxNzQ4MTUwNzk0LCJleHAiOjE3NDgxNTQzOTR9.gs3HqM1dOjQUhGgFbT-Qi7-oBFJOuDVUDX729MS7WFg";
    if (!token) {
      alert('Tidak ada token, silakan login dulu');
      router.push('/login');
      return;
    }

    const fetchLowongan = async () => {
      try {
        const queryParams = new URLSearchParams();
        if (sortStrategy) queryParams.append('sortStrategy', sortStrategy);
        if (filterStrategy && filterValue) {
          queryParams.append('filterStrategy', filterStrategy);
          queryParams.append('filterValue', filterValue);
        }


        const res = await fetch(`http://localhost:8080/api/lowongan?${queryParams.toString()}`, {
          headers: {
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiRE9TRU4iLCJuaXAiOiIyMzA2MjE0OTkwIiwiZnVsbE5hbWUiOiJkb3NlbiIsImlkIjoiMzdlNGRjOWEtMmZlYy00MWE1LWFlOTgtMmRkNjcxODdjMTFjIiwiZW1haWwiOiJkb3NlbkBleGFtcGxlLmNvbSIsInN1YiI6ImRvc2VuQGV4YW1wbGUuY29tIiwiaWF0IjoxNzQ4MTUwNzk0LCJleHAiOjE3NDgxNTQzOTR9.gs3HqM1dOjQUhGgFbT-Qi7-oBFJOuDVUDX729MS7WFg`,
          },
        });

        if (!res.ok) throw new Error('Gagal mengambil data lowongan');
        const data = await res.json();
        setLowonganList(data);
      } catch (error) {
        console.error('Error fetching lowongan:', error);
        alert('Gagal mengambil data lowongan');
      } finally {
        setLoading(false);
      }
    };

    fetchLowongan();
  }, [router, sortStrategy, filterStrategy, filterValue]);


  const handleDelete = async (id: string) => {
    if (!confirm('Apakah kamu yakin ingin menghapus lowongan ini?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:8080/api/lowongan/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiRE9TRU4iLCJuaXAiOiIyMzA2MjE0OTkwIiwiZnVsbE5hbWUiOiJkb3NlbiIsImlkIjoiMzdlNGRjOWEtMmZlYy00MWE1LWFlOTgtMmRkNjcxODdjMTFjIiwiZW1haWwiOiJkb3NlbkBleGFtcGxlLmNvbSIsInN1YiI6ImRvc2VuQGV4YW1wbGUuY29tIiwiaWF0IjoxNzQ4MTUwNzk0LCJleHAiOjE3NDgxNTQzOTR9.gs3HqM1dOjQUhGgFbT-Qi7-oBFJOuDVUDX729MS7WFg`,
        },
      });
      if (res.ok) {
        setLowonganList(prev => prev.filter(item => item.lowonganId !== id));
      } else {
        const msg = await res.text();
        alert('Gagal menghapus lowongan: ' + msg);
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat menghapus lowongan');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Daftar Lowongan</h1>
        <button
          onClick={() => router.push('/dashboard/dosen/manajemen-lowongan/create')}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Buat Lowongan
        </button>
      </div>

      {loading ? (
        <p>Memuat data...</p>
      ) : lowonganList.length === 0 ? (
        <p>Tidak ada lowongan.</p>
      ) : (
        <>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
          <div>
            <label htmlFor="sort" className="mr-2 font-medium">Urutkan berdasarkan:</label>
            <select
              id="sort"
              value={sortStrategy}
              onChange={(e) => setSortStrategy(e.target.value)}
              className="border px-2 py-1 rounded"
            >
              <option value="">-- Pilih --</option>
              <option value="SortByJumlahAsdosDibutuhkan">Jumlah Asdos Dibutuhkan</option>
              <option value="SortByJumlahAsdosDiterima">Jumlah Asdos Diterima</option>
              <option value="SortByJumlahAsdosPendaftar">Jumlah Asdos Pendaftar</option>
            </select>
          </div>

          <div>
            <label htmlFor="filterStrategy" className="mr-2 font-medium">Filter:</label>
            <select
              id="filterStrategy"
              value={filterStrategy}
              onChange={(e) => {
                setFilterStrategy(e.target.value);
                setFilterValue(''); // reset value jika strategi berubah
              }}
              className="border px-2 py-1 rounded mr-2"
            >
              <option value="">-- Pilih Kategori --</option>
              <option value="FilterBySemester">Semester</option>
              <option value="FilterByStatus">Status</option>
            </select>

            {filterStrategy === 'FilterBySemester' && (
              <select
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                className="border px-2 py-1 rounded"
              >
                <option value="">-- Pilih Semester --</option>
                <option value="GANJIL">GANJIL</option>
                <option value="GENAP">GENAP</option>
              </select>
            )}

            {filterStrategy === 'FilterByStatus' && (
              <select
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                className="border px-2 py-1 rounded"
              >
                <option value="">-- Pilih Status --</option>
                <option value="TERSEDIA">TERSEDIA</option>
                <option value="TIDAK_TERSEDIA">TIDAK TERSEDIA</option>
              </select>
            )}
          </div>
        </div>


          <table className="min-w-full border">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-4 py-2">Mata Kuliah</th>
                <th className="border px-4 py-2">Tahun Ajaran</th>
                <th className="border px-4 py-2">Semester</th>
                <th className="border px-4 py-2">Status</th>
                <th className="border px-4 py-2">Dibutuhkan</th>
                <th className="border px-4 py-2">Diterima</th>
                <th className="border px-4 py-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {lowonganList.map((lowongan) => (
                <tr key={lowongan.lowonganId}>
                  <td className="border px-4 py-2">{lowongan.idMataKuliah}</td>
                  <td className="border px-4 py-2">{lowongan.tahunAjaran}</td>
                  <td className="border px-4 py-2">{lowongan.semester}</td>
                  <td className="border px-4 py-2">{lowongan.statusLowongan}</td>
                  <td className="border px-4 py-2">{lowongan.jumlahAsdosDibutuhkan}</td>
                  <td className="border px-4 py-2">{lowongan.jumlahAsdosDiterima}</td>
                  <td className="border px-4 py-2 flex gap-2">
                    <button
                      onClick={() => router.push(`/dashboard/dosen/manajemen-lowongan/${lowongan.lowonganId}`)}
                      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                    >
                      Detail
                    </button>
                    <button
                      onClick={() => handleDelete(lowongan.lowonganId)}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

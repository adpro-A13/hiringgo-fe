'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { fetcher } from "@/components/lib/fetcher";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

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
  const [deleteLoading, setDeleteLoading] = useState<{[key: string]: boolean}>({});
  const [reloadCounter, setReloadCounter] = useState(0);
  
  // Prevent overlapping requests
  const isLoadingRef = useRef(false);

  // Simple fetch function
  async function loadData() {
    // Check if we're already loading
    if (isLoadingRef.current) return;
    
    // Lock the loading state
    isLoadingRef.current = true;
    setLoading(true);
    
    try {
      // Build query string manually
      let url = '/api/lowongan';
      let params = [];
      
      if (sortStrategy) {
        params.push(`sortStrategy=${encodeURIComponent(sortStrategy)}`);
      }
      
      if (filterStrategy && filterValue) {
        params.push(`filterStrategy=${encodeURIComponent(filterStrategy)}`);
        params.push(`filterValue=${encodeURIComponent(filterValue)}`);
      }
      
      // Add query params to URL if we have any
      if (params.length > 0) {
        url += '?' + params.join('&');
      }
      
      console.log("Fetching from:", url);
      
      // Make the request
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Use cookies automatically
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Sesi anda telah berakhir');
          router.push('/login');
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Success! Update the data state
      console.log("Data received:", data);
      if (Array.isArray(data)) {
        setLowonganList(data);
      } else if (data.data && Array.isArray(data.data)) {
        setLowonganList(data.data);
      } else {
        console.error("Unexpected data format:", data);
        toast.error("Format data tidak valid");
      }
    } catch (error) {
      console.error("Failed to load data:", error);
      toast.error("Gagal mengambil data");
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }
  
  // Load data on first render
  useEffect(() => {
    loadData();
  }, []);
  
  // Reload data when sortStrategy, filterStrategy, or filterValue changes
  useEffect(() => {
    loadData();
  }, [sortStrategy, filterStrategy, filterValue, reloadCounter]);
  
  // Handle sort change
  function handleSortChange(value: string) {
    setSortStrategy(value);
  }
  
  // Handle filter strategy change
  function handleFilterStrategyChange(value: string) {
    setFilterStrategy(value);
    setFilterValue('');
  }
  
  // Handle filter value change
  function handleFilterValueChange(value: string) {
    setFilterValue(value);
  }
  
  // Handle delete
  async function handleDelete(id: string) {
    if (!confirm('Apakah kamu yakin ingin menghapus lowongan ini?')) return;
    
    setDeleteLoading(prev => ({ ...prev, [id]: true }));
    
    try {
      await fetcher(`/api/lowongan/${id}`, undefined, {
        method: 'DELETE',
      });
      
      // Force reload data after successful delete
      setReloadCounter(prev => prev + 1);
      toast.success('Lowongan berhasil dihapus');
    } catch (err: any) {
      console.error("Error deleting lowongan:", err);
      toast.error(err.message || 'Terjadi kesalahan saat menghapus lowongan');
    } finally {
      setDeleteLoading(prev => ({ ...prev, [id]: false }));
    }
  }

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

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <div>
          <label htmlFor="sort" className="mr-2 font-medium">Urutkan berdasarkan:</label>
          <select
            id="sort"
            value={sortStrategy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="border px-2 py-1 rounded"
            disabled={loading}
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
            onChange={(e) => handleFilterStrategyChange(e.target.value)}
            className="border px-2 py-1 rounded mr-2"
            disabled={loading}
          >
            <option value="">-- Pilih Kategori --</option>
            <option value="FilterBySemester">Semester</option>
            <option value="FilterByStatus">Status</option>
          </select>

          {filterStrategy === 'FilterBySemester' && (
            <select
              value={filterValue}
              onChange={(e) => handleFilterValueChange(e.target.value)}
              className="border px-2 py-1 rounded"
              disabled={loading}
            >
              <option value="">-- Pilih Semester --</option>
              <option value="GANJIL">GANJIL</option>
              <option value="GENAP">GENAP</option>
            </select>
          )}

          {filterStrategy === 'FilterByStatus' && (
            <select
              value={filterValue}
              onChange={(e) => handleFilterValueChange(e.target.value)}
              className="border px-2 py-1 rounded"
              disabled={loading}
            >
              <option value="">-- Pilih Status --</option>
              <option value="TERSEDIA">TERSEDIA</option>
              <option value="TIDAK_TERSEDIA">TIDAK_TERSEDIA</option>
            </select>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-10">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2">Memuat data...</span>
        </div>
      ) : lowonganList.length === 0 ? (
        <div className="text-center p-10">
          <p className="text-gray-500">Tidak ada lowongan ditemukan.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-4 py-2 text-left">No</th>
                <th className="border px-4 py-2 text-left">Mata Kuliah</th>
                <th className="border px-4 py-2 text-left">Tahun Ajaran</th>
                <th className="border px-4 py-2 text-left">Semester</th>
                <th className="border px-4 py-2 text-left">Status</th>
                <th className="border px-4 py-2 text-left">Dibutuhkan</th>
                <th className="border px-4 py-2 text-left">Diterima</th>
                <th className="border px-4 py-2 text-left">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {lowonganList.map((lowongan, index) => (
                <tr key={`${lowongan.lowonganId}-${reloadCounter}`} className="hover:bg-gray-50">
                  <td className="border px-4 py-2 font-mono text-sm">{index + 1}</td>
                  <td className="border px-4 py-2 font-medium">{lowongan.idMataKuliah}</td>
                  <td className="border px-4 py-2">{lowongan.tahunAjaran}</td>
                  <td className="border px-4 py-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      lowongan.semester === 'GANJIL' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {lowongan.semester}
                    </span>
                  </td>
                  <td className="border px-4 py-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      lowongan.statusLowongan === 'TERSEDIA' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {lowongan.statusLowongan}
                    </span>
                  </td>
                  <td className="border px-4 py-2">
                    <span className="font-bold text-lg text-blue-600">
                      {lowongan.jumlahAsdosDibutuhkan}
                    </span>
                  </td>
                  <td className="border px-4 py-2">{lowongan.jumlahAsdosDiterima}</td>
                  <td className="border px-4 py-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => router.push(`/dashboard/dosen/manajemen-lowongan/${lowongan.lowonganId}`)}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                      >
                        Detail
                      </button>
                      <button
                        onClick={() => handleDelete(lowongan.lowonganId)}
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 flex items-center"
                        disabled={deleteLoading[lowongan.lowonganId]}
                      >
                        {deleteLoading[lowongan.lowonganId] ? (
                          <>
                            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                            Menghapus...
                          </>
                        ) : (
                          "Hapus"
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      <button 
        onClick={() => setReloadCounter(prev => prev + 1)}
        className="mt-4 px-4 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300"
      >
        Refresh Data
      </button>
    </div>
  );
}
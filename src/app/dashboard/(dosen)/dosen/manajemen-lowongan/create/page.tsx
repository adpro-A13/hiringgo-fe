'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from "@/components/dashboard/dosen/sidebar"; 
import { fetcher } from "@/components/lib/fetcher";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function CreateLowonganPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    idMataKuliah: "",
    tahunAjaran: "",
    semester: "GANJIL",
    jumlahAsdosDibutuhkan: 1,
    statusLowongan: "DIBUKA",
  });

  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "jumlahAsdosDibutuhkan" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Using fetcher instead of direct fetch with hardcoded token
      await fetcher('/api/lowongan', undefined, {
        method: "POST",
        body: JSON.stringify(form),
      });
      
      toast.success("Lowongan berhasil dibuat!");
      router.push("/dashboard/dosen/manajemen-lowongan");
    } catch (err: any) {
      console.error("Error creating lowongan:", err);
      
      const errorMsg = err.message || "Terjadi kesalahan saat membuat lowongan.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminSidebar>
      <div className="max-w-xl mx-auto mt-10 p-4 border rounded shadow">
        <h1 className="text-2xl font-bold mb-4">Buat Lowongan Baru</h1>
        {error && (
          <p className="text-red-500 text-sm mb-4 bg-red-100 p-2 rounded">{error}</p>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="idMataKuliah" className="block font-semibold">ID Mata Kuliah</label>
            <input
              type="text"
              name="idMataKuliah"
              value={form.idMataKuliah}
              onChange={handleChange}
              required
              className="w-full border p-2 rounded"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="tahunAjaran" className="block font-semibold">Tahun Ajaran</label>
            <input
              type="text"
              name="tahunAjaran"
              value={form.tahunAjaran}
              onChange={handleChange}
              placeholder="Contoh: 2024/2025"
              required
              className="w-full border p-2 rounded"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="semester" className="block font-semibold">Semester</label>
            <select
              name="semester"
              value={form.semester}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              disabled={isSubmitting}
            >
              <option value="GANJIL">Ganjil</option>
              <option value="GENAP">Genap</option>
            </select>
          </div>

          <div>
            <label htmlFor="jumlahAsdosDibutuhkan" className="block font-semibold">Jumlah Asdos Dibutuhkan</label>
            <input
              type="number"
              name="jumlahAsdosDibutuhkan"
              min={1}
              value={form.jumlahAsdosDibutuhkan}
              onChange={handleChange}
              required
              className="w-full border p-2 rounded"
              disabled={isSubmitting}
            />
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
              onClick={() => router.push("/dashboard/dosen/manajemen-lowongan")}
              disabled={isSubmitting}
            >
              Batal
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center justify-center min-w-[100px]"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Buat Lowongan"
              )}
            </button>
          </div>
        </form>
      </div>
    </AdminSidebar>
  );
}
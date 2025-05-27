"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X, Plus, AlertCircle } from "lucide-react";
import { fetcher } from "@/components/lib/fetcher";
import { toast } from "sonner";

interface MataKuliah {
  kode: string;
  nama: string;
  deskripsi: string;
  dosenPengampuEmails: string[];
}

interface MataKuliahFormProps {
  MataKuliah?: MataKuliah;
  onSuccess: () => void;
}

interface ApiResponse {
  success?: boolean;
  message?: string;
  error?: string;
  data?: any;
}

export default function MataKuliahForm({
  MataKuliah,
  onSuccess,
}: MataKuliahFormProps) {
  const [formData, setFormData] = useState({
    kode: MataKuliah?.kode || "",
    nama: MataKuliah?.nama || "",
    deskripsi: MataKuliah?.deskripsi || "",
    dosenPengampuEmails: MataKuliah?.dosenPengampuEmails || [],
  });
  const [newEmail, setNewEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = !!MataKuliah;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const url = isEdit
        ? `/api/matakuliah/update/${formData.kode}`
        : "/api/matakuliah/create";
      const method = isEdit ? "PUT" : "POST";

      // Using fetcher instead of direct fetch with token
      await fetcher<ApiResponse>(url, undefined, {
        method,
        body: JSON.stringify(formData),
      });
      
      toast.success(`Mata kuliah berhasil ${isEdit ? "diperbarui" : "dibuat"}`);
      setError("");
      onSuccess();
    } catch (err: any) {
      console.error("Error submitting form:", err);
      
      // Check for specific error statuses
      if (err.status === 401) {
        toast.error("Sesi Anda telah berakhir. Silakan login kembali");
        setError("Sesi Anda telah berakhir. Silakan login kembali");
        return;
      }
      
      let errorMessage = `Gagal ${isEdit ? "memperbarui" : "membuat"} mata kuliah`;
      
      if (err.message) {
        errorMessage = err.message;
      }
      
      if (err.status === 404) {
        errorMessage = errorMessage.includes("tidak ditemukan") || 
                      errorMessage.includes("not found")
          ? errorMessage
          : "Email dosen tidak ditemukan di database";
      } else if (err.status === 409) {
        errorMessage = errorMessage.includes("kode sudah digunakan") || 
                      errorMessage.includes("already exists")
          ? "Mata kuliah dengan kode ini sudah ada"
          : errorMessage;
      }
      
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const addEmail = () => {
    if (newEmail && !formData.dosenPengampuEmails.includes(newEmail)) {
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newEmail)) {
        setError("Format email tidak valid");
        return;
      }

      setFormData({
        ...formData,
        dosenPengampuEmails: [...formData.dosenPengampuEmails, newEmail],
      });
      setNewEmail("");
      setError(null); // Clear any previous errors
    }
  };

  const removeEmail = (emailToRemove: string) => {
    setFormData({
      ...formData,
      dosenPengampuEmails: formData.dosenPengampuEmails.filter(
        (email) => email !== emailToRemove
      ),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-red-800 mb-1">
                Terjadi Kesalahan
              </h4>
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setError(null)}
              className="ml-auto h-6 w-6 p-0 text-red-500 hover:text-red-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="kode">Kode Mata Kuliah</Label>
          <Input
            id="kode"
            value={formData.kode}
            onChange={(e) => setFormData({ ...formData, kode: e.target.value })}
            placeholder="CS1234"
            required
            disabled={isEdit}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="nama">Nama Mata Kuliah</Label>
          <Input
            id="nama"
            value={formData.nama}
            onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
            placeholder="Pemrograman Lanjut"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="deskripsi">Deskripsi</Label>
        <Textarea
          id="deskripsi"
          value={formData.deskripsi}
          onChange={(e) =>
            setFormData({ ...formData, deskripsi: e.target.value })
          }
          placeholder="Deskripsi mata kuliah..."
          rows={4}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Dosen Pengampu</Label>
        <div className="flex gap-2">
          <Input
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="email@example.com"
            type="email"
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addEmail();
              }
            }}
          />
          <Button type="button" onClick={addEmail} variant="outline">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {formData.dosenPengampuEmails.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Minimal satu email dosen pengampu harus ditambahkan
          </p>
        )}

        <div className="flex flex-wrap gap-2 mt-2">
          {formData.dosenPengampuEmails.map((email) => (
            <Badge
              key={email}
              variant="secondary"
              className="flex items-center gap-1"
            >
              {email}
              <button
                type="button"
                onClick={() => removeEmail(email)}
                className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="submit"
          disabled={loading || formData.dosenPengampuEmails.length === 0}
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {isEdit ? "Memperbarui..." : "Membuat..."}
            </>
          ) : (
            `${isEdit ? "Perbarui" : "Buat"} Mata Kuliah`
          )}
        </Button>
      </div>
    </form>
  );
}
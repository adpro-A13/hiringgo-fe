"use client";

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, Users, BookOpen, FileText, CheckCircle, ClipboardList, Loader, AlertCircle } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react";

interface Lowongan {
  lowonganId: string;
  idMataKuliah: string;
  namaMataKuliah: string;
  tahunAjaran: string;
  semester: string;
  statusLowongan: string;
  judul: string;
  deskripsi: string;
  persyaratan: string;
  jumlahAsdosDibutuhkan: number;
  jumlahAsdosDiterima: number;
  jumlahAsdosPendaftar: number;
  idAsdosDiterima: string[];
}

interface ApplicationStatus {
  hasApplied: boolean;
  status: string;
  pendaftaranId?: string;
}

// Define a custom interface for form data
interface ApplicationFormData {
  ipk: string;
  sks: string;
}

interface DialogDetailLowonganProps {
  lowongan: Lowongan;
  onApply?: () => void;
  applicationStatus?: ApplicationStatus;
}

export function DialogDetailLowongan({ lowongan, onApply, applicationStatus }: DialogDetailLowonganProps) {
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [formData, setFormData] = useState<ApplicationFormData>({
        ipk: "",
        sks: ""
    });
    const [localStatus, setLocalStatus] = useState<ApplicationStatus | null>(null);
    
    // If applicationStatus not provided, fetch it
    useEffect(() => {
        if (applicationStatus) {
            setLocalStatus(applicationStatus);
            return;
        }
        
        // Only fetch if not provided
        const fetchStatus = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('authToken');
                const response = await fetch(`/api/lowongandaftar/${lowongan.lowonganId}/status`, {
                    method: "GET"
                  });
                
                if (response.ok) {
                    const statusData = await response.json();
                    setLocalStatus(statusData);
                }
            } catch (error) {
                console.error("Error fetching application status:", error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchStatus();
    }, [lowongan.lowonganId, applicationStatus]);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Additional check to prevent submission if already applied
        if (localStatus?.hasApplied) {
            setError("Anda sudah mendaftar untuk lowongan ini");
            return;
        }
        
        setSubmitting(true);
        setError(null);
        setSuccess(null);

        // Client-side validation
        if (parseFloat(formData.ipk) > 4.0) {
            setError("IPK maksimal 4.0");
            setSubmitting(false);
            return;
        }
        
        if (parseInt(formData.sks) > 24) {
            setError("SKS maksimal 24");
            setSubmitting(false);
            return;
        }

        try {
            const token = localStorage.getItem('authToken');
            
            const response = await fetch(`/api/lowongandaftar/${lowongan.lowonganId}/daftar`, {
                method: "POST",
                body: JSON.stringify({
                    ipk: parseFloat(formData.ipk),
                    sks: parseInt(formData.sks)
                })
            });

            if (!response.ok) {
                // Try to parse response as JSON
                let errorMessage;
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) {
                    const data = await response.json();
                    errorMessage = data.message || `Error ${response.status}`;
                } else {
                    const errorText = await response.text();
                    errorMessage = errorText || `Error ${response.status}: ${response.statusText}`;
                }
                throw new Error(errorMessage);
            }

            // Success! Update status
            setSuccess("Pendaftaran berhasil disubmit!");
            setFormData({ ipk: "", sks: "" });
            
            // Update local status
            setLocalStatus({
                hasApplied: true,
                status: "MENUNGGU"
            });
            
            if (onApply) onApply();

        } catch (err) {
            console.error("Failed to submit application:", err);
            setError(`${err instanceof Error ? err.message : "Unknown error"}`);
        } finally {
            setSubmitting(false);
        }
    };
    
    // Get button label based on status
    const getButtonLabel = () => {
        if (loading) {
            return <><Loader className="mr-2 h-4 w-4 animate-spin" /> Loading...</>;
        }
        
        if (localStatus?.hasApplied) {
            return "Lihat Status";
        }
        
        if (lowongan.statusLowongan !== "DIBUKA") {
            return "Detail";
        }
        
        return "Daftar";
    };
  
    return (
    <Dialog>
      <DialogTrigger asChild>
         <Button 
            variant={localStatus?.hasApplied ? "outline" : "default"}
            disabled={loading}
            className={
                localStatus?.hasApplied 
                    ? "bg-gray-200 text-gray-700 hover:bg-gray-300" 
                    : lowongan.statusLowongan !== "DIBUKA" 
                        ? "bg-gray-100 text-gray-700" 
                        : ""
            }
         >
            {getButtonLabel()}
         </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        {loading ? (
            <div className="flex justify-center items-center py-12">
                <Loader className="h-8 w-8 animate-spin text-gray-400" />
                <span className="ml-3 text-gray-500">Memuat informasi...</span>
            </div>
        ) : (
            <>
                <DialogHeader>
                  <DialogTitle className="text-xl">
                    {lowongan.judul || `${lowongan.idMataKuliah} - ${lowongan.namaMataKuliah}`}
                  </DialogTitle>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant={lowongan.statusLowongan === "DIBUKA" ? "default" : "secondary"}>
                      {lowongan.statusLowongan}
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <CalendarIcon size={14} />
                      {lowongan.semester} {lowongan.tahunAjaran}
                    </Badge>
                    
                    {/* Show application status badge if applied */}
                    {localStatus?.hasApplied && (
                        <Badge className={
                            localStatus.status === "DITERIMA" 
                                ? "bg-green-100 text-green-800"
                                : localStatus.status === "DITOLAK" 
                                    ? "bg-red-100 text-red-800"
                                    : "bg-yellow-100 text-yellow-800"
                        }>
                            {localStatus.status}
                        </Badge>
                    )}
                  </div>
                  <DialogDescription className="mt-2">
                    Detail informasi lowongan asisten dosen
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-gray-500" />
                    <span className="font-medium">Mata Kuliah:</span> 
                    <span>{lowongan.idMataKuliah} - {lowongan.namaMataKuliah}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-gray-500" />
                    <span className="font-medium">Kuota:</span> 
                    <span>{lowongan.jumlahAsdosDibutuhkan} asisten</span>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <ClipboardList className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <span className="font-medium">Status Pendaftaran:</span> 
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-1 text-sm">
                        <div>Jumlah Pelamar:</div>
                        <div>{lowongan.jumlahAsdosPendaftar} mahasiswa</div>
                        <div>Jumlah Diterima:</div>
                        <div>{lowongan.jumlahAsdosDiterima} mahasiswa</div>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {lowongan.deskripsi && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-5 w-5 text-gray-500" />
                        <span className="font-medium">Deskripsi:</span>
                      </div>
                      <p className="text-sm pl-7 whitespace-pre-line">{lowongan.deskripsi}</p>
                    </div>
                  )}
                  
                  {lowongan.persyaratan && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-5 w-5 text-gray-500" />
                        <span className="font-medium">Persyaratan:</span>
                      </div>
                      <p className="text-sm pl-7 whitespace-pre-line">{lowongan.persyaratan}</p>
                    </div>
                  )}
                </div>
                
                {/* Show application status message if already applied */}
                {localStatus?.hasApplied && (
                  <div className={`mb-4 p-3 rounded-md ${
                    localStatus.status === "DITERIMA" 
                      ? "bg-green-50 border border-green-200" 
                      : localStatus.status === "DITOLAK"
                        ? "bg-red-50 border border-red-200"
                        : "bg-yellow-50 border border-yellow-200"
                  }`}>
                    <div className="flex items-start">
                      <AlertCircle className={`h-5 w-5 mr-2 ${
                        localStatus.status === "DITERIMA"
                          ? "text-green-500"
                          : localStatus.status === "DITOLAK"
                            ? "text-red-500"
                            : "text-yellow-500"
                      }`} />
                      <div>
                        <p className="font-medium">
                          {localStatus.status === "DITERIMA"
                            ? "Anda diterima pada lowongan ini!"
                            : localStatus.status === "DITOLAK"
                              ? "Aplikasi anda tidak diterima"
                              : "Aplikasi anda sedang diproses"
                          }
                        </p>
                        <p className="text-sm mt-1">
                          {localStatus.status === "DITERIMA"
                            ? "Selamat! Anda telah diterima sebagai asisten dosen untuk mata kuliah ini."
                            : localStatus.status === "DITOLAK"
                              ? "Maaf, aplikasi anda tidak diterima. Silakan coba lowongan lain."
                              : "Aplikasi anda sedang dalam proses review. Harap menunggu kabar selanjutnya."
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Only show form if lowongan is open AND user hasn't applied yet */}
                {lowongan.statusLowongan === "DIBUKA" && !localStatus?.hasApplied && (
                  <form onSubmit={handleSubmit}>
                      {error && (
                        <div className="mb-4 p-2 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
                          {error}
                        </div>
                      )}
                      
                      {success && (
                        <div className="mb-4 p-2 bg-green-50 border border-green-200 text-green-600 rounded-md text-sm">
                          {success}
                        </div>
                      )}
                      
                      <div className="grid gap-4 py-2">
                          <div>
                          <Label className="block text-sm font-medium text-gray-700" htmlFor="ipk">
                              IPK Anda
                          </Label>
                          <Input
                              type="number"
                              id="ipk"
                              name="ipk"
                              placeholder="Contoh: 3.50"
                              value={formData.ipk}
                              onChange={handleInputChange}
                              min="0"
                              max="4"
                              step="0.01"
                              required
                          />
                          <p className="text-xs text-gray-500 mt-1">
                              Format: X.XX (nilai antara 0.00 - 4.00)
                          </p>
                          </div>
                          <div>
                          <Label className="block text-sm font-medium text-gray-700" htmlFor="sks">
                              Jumlah SKS yang Sudah Diambil
                          </Label>
                          <Input
                              type="number"
                              id="sks"
                              name="sks"
                              placeholder="Contoh: 20"
                              value={formData.sks}
                              onChange={handleInputChange}
                              min="0"
                              max="24"
                              required
                          />
                          <p className="text-xs text-gray-500 mt-1">
                              Angka bulat antara 0 - 24
                          </p>
                          </div>
                      </div>
                      <DialogFooter className="mt-4">
                          <Button type="submit" disabled={submitting}>
                              {submitting ? <><Loader className="mr-2 h-4 w-4 animate-spin" /> Mengirim...</> : 'Daftar Sekarang'}
                          </Button>
                      </DialogFooter>
                  </form>
                )}
                
                {/* Show message if lowongan is closed */}
                {lowongan.statusLowongan !== "DIBUKA" && !localStatus?.hasApplied && (
                  <DialogFooter>
                    <Badge variant="outline">Lowongan Ditutup</Badge>
                  </DialogFooter>
                )}
            </>
        )}
      </DialogContent>
    </Dialog>
  )
}
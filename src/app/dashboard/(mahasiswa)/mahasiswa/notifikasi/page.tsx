"use client";

import { useState, useEffect } from "react";
import { fetcher } from "@/components/lib/fetcher";
import MahasiswaSidebar from "@/components/dashboard/mahasiswa/sidebar";
import { Loader2, Bell, CheckCheck, BookOpen, Calendar, Tag } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { id } from "date-fns/locale";

// Updated NotifikasiDTO interface to match the backend
interface NotifikasiDTO {
  id: string;
  mataKuliahNama: string;
  tahunAjaran: string;
  semester: string;
  status: string;
  read: boolean;
  createdAt: string; // Will be parsed from LocalDateTime
}

export default function NotifikasiPage() {
  const [notifikasi, setNotifikasi] = useState<NotifikasiDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingRead, setMarkingRead] = useState<{[key: string]: boolean}>({});
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Fetch notifications
  const fetchNotifikasi = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await fetcher<NotifikasiDTO[]>("/api/notifikasi");
      
      // Sort by createdAt (newest first)
      const sortedData = [...data].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      setNotifikasi(sortedData);
    } catch (err: any) {
      console.error("Error fetching notifications:", err);
      
      if (err.status === 401) {
        toast.error("Sesi anda telah berakhir, silakan login kembali");
        router.push('/login');
        return;
      }
      
      setError(err.message || "Gagal memuat notifikasi");
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const handleMarkAsRead = async (id: string) => {
    // Prevent duplicate requests
    if (markingRead[id]) return;
    
    try {
      setMarkingRead(prev => ({...prev, [id]: true}));
      
      await fetcher(`/api/notifikasi/${id}/read`, undefined, {
        method: "POST"
      });
      
      // Update local state
      setNotifikasi(prev => prev.map(item => 
        item.id === id ? { ...item, read: true } : item
      ));
      
      toast.success("Notifikasi ditandai sudah dibaca");
    } catch (err) {
      console.error("Error marking notification as read:", err);
      toast.error("Gagal menandai notifikasi sebagai dibaca");
    } finally {
      setMarkingRead(prev => ({...prev, [id]: false}));
    }
  };

  // Fetch notifications on component mount
  useEffect(() => {
    fetchNotifikasi();
  }, []);

  // Format date to a human-readable format
  const formatDateTime = (dateTimeStr: string) => {
    try {
      const date = new Date(dateTimeStr);
      return format(date, 'dd MMMM yyyy, HH:mm', { locale: id });
    } catch (error) {
      return "Tanggal tidak valid";
    }
  };

  // Get appropriate badge color based on status
  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('diterima')) return "bg-green-100 text-green-800";
    if (statusLower.includes('ditolak')) return "bg-red-100 text-red-800";
    if (statusLower.includes('menunggu')) return "bg-yellow-100 text-yellow-800";
    if (statusLower.includes('buka')) return "bg-blue-100 text-blue-800";
    if (statusLower.includes('tutup')) return "bg-gray-100 text-gray-800";
    return "bg-gray-100 text-gray-800";
  };

  // Get all unread notifications count
  const unreadCount = notifikasi.filter(item => !item.read).length;

  return (
    <MahasiswaSidebar>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Notifikasi
              {unreadCount > 0 && (
                <span className="ml-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {unreadCount} baru
                </span>
              )}
            </h1>
            <p className="text-gray-500 mt-1">
              Informasi terkait lowongan dan pendaftaran asisten dosen
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={fetchNotifikasi}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm flex items-center hover:bg-gray-50"
              disabled={loading}
            >
              <Loader2 className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            
            {unreadCount > 0 && (
              <button
                onClick={() => toast.info("Fungsi mark all as read belum tersedia")}
                className="px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-md text-sm flex items-center hover:bg-blue-100"
              >
                <CheckCheck className="h-4 w-4 mr-2" />
                Tandai Semua Dibaca
              </button>
            )}
          </div>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center p-10">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2">Memuat notifikasi...</span>
          </div>
        ) : error ? (
          <div className="text-center p-10 border rounded-lg bg-red-50 text-red-700">
            <p>{error}</p>
            <button 
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" 
              onClick={() => fetchNotifikasi()}
            >
              Coba Lagi
            </button>
          </div>
        ) : notifikasi.length === 0 ? (
          <div className="text-center p-10 border rounded-lg bg-gray-50">
            <Bell className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500 font-medium text-lg">Tidak ada notifikasi untuk ditampilkan.</p>
            <p className="text-gray-400 mt-1">Notifikasi akan muncul ketika ada pembaruan terkait lowongan asisten dosen</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifikasi.map((item) => (
              <div 
                key={item.id} 
                className={`p-4 border rounded-lg ${
                  item.read 
                    ? 'bg-white' 
                    : 'bg-blue-50 border-l-4 border-l-blue-500'
                } transition-all hover:shadow-sm`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <BookOpen className={`h-5 w-5 mr-2 ${item.read ? 'text-gray-400' : 'text-blue-500'}`} />
                    <h3 className={`text-lg ${!item.read ? 'font-bold' : 'font-medium'}`}>
                      {item.mataKuliahNama}
                    </h3>
                  </div>
                  
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {formatDateTime(item.createdAt)}
                  </span>
                </div>
                
                <div className="mt-2 flex flex-wrap gap-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                    <span>{item.tahunAjaran} - {item.semester}</span>
                  </div>
                  
                  <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                </div>
                
                {!item.read && (
                  <div className="mt-3 flex justify-between items-center">
                    <div className="text-xs text-blue-600 px-2 py-1 bg-blue-50 rounded-full">
                      Belum dibaca
                    </div>
                    
                    <button 
                      className="text-sm text-blue-600 hover:text-blue-800 hover:underline flex items-center"
                      onClick={() => handleMarkAsRead(item.id)}
                      disabled={markingRead[item.id]}
                    >
                      {markingRead[item.id] ? (
                        <>
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          Memproses...
                        </>
                      ) : (
                        <>
                          <CheckCheck className="h-3 w-3 mr-1" />
                          Tandai sudah dibaca
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </MahasiswaSidebar>
  );
}
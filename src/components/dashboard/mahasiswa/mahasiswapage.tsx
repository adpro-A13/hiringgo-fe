"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BookOpen, 
  Briefcase, 
  ClipboardCheck, 
  Clock, 
  Info, 
  Mail,
  CheckCircle,
  XCircle,
  HourglassIcon, 
  Calendar,
  DollarSign
} from "lucide-react";
import { useEffect, useState } from "react";

interface MahasiswaDashboardData {
  userRole: string;
  username: string;
  fullName: string;
  availableFeatures: {
    pendaftaran: string;
    lowongan: string;
    profile: string;
    logActivities: string;
  };
  openLowonganCount: number;
  totalLowonganCount: number;
  totalApplicationsCount: number;
  pendingApplicationsCount: number;
  acceptedApplicationsCount: number;
  rejectedApplicationsCount: number;
  totalLoggedHours: number;
  totalIncentive: number;
  acceptedLowongan: any[];
  recentLowongan: any[];
}

export default function MahasiswaPage({ dashboardData }: { dashboardData: MahasiswaDashboardData }) {
  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold">Dashboard Mahasiswa</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Welcome back, {dashboardData.fullName}</p>
        </div>
      </div>
      
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Open Positions Card */}
        <Card className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Lowongan Terbuka
            </CardTitle>
            <Briefcase className="h-5 w-5 text-blue-500 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.openLowonganCount}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Lowongan yang tersedia
            </p>
          </CardContent>
        </Card>
        
        {/* Applications Card */}
        <Card className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Aplikasi
            </CardTitle>
            <ClipboardCheck className="h-5 w-5 text-purple-500 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.totalApplicationsCount}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Aplikasi yang telah dikirim
            </p>
          </CardContent>
        </Card>
        
        {/* Hours Logged Card */}
        <Card className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Jam
            </CardTitle>
            <Clock className="h-5 w-5 text-green-500 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.totalLoggedHours}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Jam kerja tercatat
            </p>
          </CardContent>
        </Card>
        
        {/* Incentive Card */}
        <Card className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Insentif
            </CardTitle>
            <DollarSign className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp {dashboardData.totalIncentive.toLocaleString()}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Insentif yang diterima
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Application Status */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Status Aplikasi</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Pending Applications */}
          <Card className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Menunggu
              </CardTitle>
              <HourglassIcon className="h-5 w-5 text-amber-500 dark:text-amber-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.pendingApplicationsCount}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Aplikasi dalam proses
              </p>
            </CardContent>
          </Card>
          
          {/* Accepted Applications */}
          <Card className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Diterima
              </CardTitle>
              <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.acceptedApplicationsCount}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Aplikasi yang diterima
              </p>
            </CardContent>
          </Card>
          
          {/* Rejected Applications */}
          <Card className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Ditolak
              </CardTitle>
              <XCircle className="h-5 w-5 text-red-500 dark:text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.rejectedApplicationsCount}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Aplikasi yang ditolak
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Accepted Positions */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Posisi Asisten Diterima</h3>
        {dashboardData.acceptedLowongan.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dashboardData.acceptedLowongan.map((position, index) => (
              <Card key={index} className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-md">{position.title || "Unnamed Position"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <BookOpen className="mr-2 h-4 w-4" />
                    {position.courseName || "No course specified"}
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <Mail className="mr-2 h-4 w-4" />
                    {position.dosenEmail || "No email specified"}
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="mr-2 h-4 w-4" />
                    {position.semester || "No semester information"}
                  </div>
                  {position.description && (
                    <p className="text-xs text-gray-500 mt-3 line-clamp-2">
                      {position.description}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center">
            <Info className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <h4 className="text-lg font-medium mb-1">Belum ada posisi diterima</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Anda belum diterima pada posisi asisten dosen manapun.
            </p>
          </div>
        )}
      </div>

      {/* Recent Positions */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Lowongan Terbaru</h3>
        {dashboardData.recentLowongan.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dashboardData.recentLowongan.map((position, index) => (
              <Card key={index} className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-md">{position.title || "Unnamed Position"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <BookOpen className="mr-2 h-4 w-4" />
                    {position.courseName || "No course specified"}
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <Mail className="mr-2 h-4 w-4" />
                    {position.dosenEmail || "No contact information"}
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Clock className="mr-2 h-4 w-4" />
                    {position.deadline 
                      ? `Deadline: ${new Date(position.deadline).toLocaleDateString()}`
                      : "No deadline specified"}
                  </div>
                  {position.description && (
                    <p className="text-xs text-gray-500 mt-3 line-clamp-2">
                      {position.description}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center">
            <Info className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <h4 className="text-lg font-medium mb-1">Tidak ada lowongan terbaru</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Belum ada lowongan asisten dosen yang tersedia saat ini.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
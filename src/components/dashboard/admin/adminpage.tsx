"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, Briefcase, GraduationCap } from "lucide-react";
import { useEffect, useState } from "react";

interface DashboardData {
  userRole: string;
  username: string;
  fullName: string;
  availableFeatures: {
    profile: string;
    manajemenLowongan: string;
    manajemenAkun: string;
    manajemenMataKuliah: string;
  };
  dosenCount: number;
  mahasiswaCount: number;
  courseCount: number;
  lowonganCount: number;
}

export default function AdminPage({dashboardData}: {dashboardData: DashboardData}) {
  
  return (
    <div className="w-full">
      <h2 className="text-3xl font-bold mb-6">Dashboard Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Dosen Count Card */}
        <Card className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Dosen
            </CardTitle>
            <GraduationCap className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.dosenCount}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Active teaching staff
            </p>
          </CardContent>
        </Card>
        
        {/* Mahasiswa Count Card */}
        <Card className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Mahasiswa
            </CardTitle>
            <Users className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.mahasiswaCount}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Registered students
            </p>
          </CardContent>
        </Card>
        
        {/* Course Count Card */}
        <Card className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Mata Kuliah
            </CardTitle>
            <BookOpen className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.courseCount}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Available courses
            </p>
          </CardContent>
        </Card>
        
        {/* Lowongan Count Card */}
        <Card className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Lowongan
            </CardTitle>
            <Briefcase className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.lowonganCount}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Open positions
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
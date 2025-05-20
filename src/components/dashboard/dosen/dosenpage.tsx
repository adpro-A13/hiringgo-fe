"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, Clock, BookCheck, Info } from "lucide-react";
import { useEffect, useState } from "react";

interface DosenDashboardData {
  userRole: string;
  username: string;
  fullName: string;
  availableFeatures: {
    manajemenlowongan: string;
    profile: string;
    periksaLog: string;
    manajemenAsdos: string;
  };
  courseCount: number;
  acceptedAssistantCount: number;
  openPositionCount: number;
  courses: any[];
  openPositions: any[];
}

export default function DosenPage({ dashboardData }: { dashboardData: DosenDashboardData }) {
  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold">Dashboard Dosen</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Welcome back, {dashboardData.fullName}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {/* Course Count Card */}
        <Card className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Mata Kuliah
            </CardTitle>
            <BookOpen className="h-5 w-5 text-blue-500 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.courseCount}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Total mata kuliah yang diampu
            </p>
          </CardContent>
        </Card>
        
        {/* Accepted Assistant Count Card */}
        <Card className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Asisten Dosen
            </CardTitle>
            <Users className="h-5 w-5 text-green-500 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.acceptedAssistantCount}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Asisten yang telah diterima
            </p>
          </CardContent>
        </Card>
        
        {/* Open Positions Card */}
        <Card className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Lowongan Terbuka
            </CardTitle>
            <Clock className="h-5 w-5 text-orange-500 dark:text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.openPositionCount}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Lowongan asisten yang dibuka
            </p>
          </CardContent>
        </Card>
      </div>

      </div>
  );
}
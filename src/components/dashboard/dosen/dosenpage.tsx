import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Users, Clock, BookCheck, FileText, Calendar, School } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface Course {
  kode: string;
  nama: string;
  deskripsi: string;
  dosenPengampuEmails: string[];
}

interface Lowongan {
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
  courses: any[] | null;
  openPositions: any[] | null;
  coursesTaught: Course[] | null;
  lowonganPerCourse: Record<string, Lowongan[]> | null;
  acceptedAssistantsPerCourse: Record<string, number> | null;
}

export default function DosenPage({ dashboardData }: { dashboardData: DosenDashboardData }) {
  const totalLowongan = Object.values(dashboardData.lowonganPerCourse || {})
    .flat()
    .length;

  const totalAcceptedAssistants = Object.values(dashboardData.acceptedAssistantsPerCourse || {})
    .reduce((sum, count) => sum + count, 0);

  const totalOpenPositions = Object.values(dashboardData.lowonganPerCourse || {})
    .flat()
    .filter(lowongan => lowongan.statusLowongan === "DIBUKA")
    .length;

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm font-medium">
            {dashboardData.userRole}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {dashboardData.fullName}
          </span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mata Kuliah</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.coursesTaught?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Total mata kuliah yang diampu
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lowongan</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLowongan}</div>
            <p className="text-xs text-muted-foreground">
              Total lowongan yang dibuka
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Asdos Diterima</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAcceptedAssistants}</div>
            <p className="text-xs text-muted-foreground">
              Total asisten dosen diterima
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Posisi Terbuka</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOpenPositions}</div>
            <p className="text-xs text-muted-foreground">
              Lowongan yang masih dibuka
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Courses Section */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold tracking-tight">Mata Kuliah</h2>
        
        {dashboardData.coursesTaught && dashboardData.coursesTaught.length > 0 ? (
          <Tabs defaultValue={dashboardData.coursesTaught[0].kode} className="w-full">
            <TabsList className="mb-4 flex flex-wrap h-auto">
              {dashboardData.coursesTaught.map((course) => (
                <TabsTrigger key={course.kode} value={course.kode}>
                  {course.nama} ({course.kode})
                </TabsTrigger>
              ))}
            </TabsList>
            
            {dashboardData.coursesTaught.map((course) => (
              <TabsContent key={course.kode} value={course.kode} className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" /> 
                      {course.nama} ({course.kode})
                    </CardTitle>
                    <CardDescription>{course.deskripsi}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Asdos Diterima</span>
                        <span className="text-sm font-medium">
                          {dashboardData.acceptedAssistantsPerCourse?.[course.kode] || 0}
                        </span>
                      </div>
                    </div>
                    
                    {/* Lowongan for this course */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">Lowongan ({dashboardData.lowonganPerCourse?.[course.kode]?.length || 0})</h3>
                      
                      {(dashboardData.lowonganPerCourse?.[course.kode] || []).length > 0 ? (
                        <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
                          {(dashboardData.lowonganPerCourse?.[course.kode] || []).map((lowongan) => (
                            <Card key={lowongan.lowonganId} className="overflow-hidden">
                              <CardHeader className="pb-2">
                                <div className="flex justify-between items-center">
                                  <CardTitle className="text-base">{lowongan.tahunAjaran} - {lowongan.semester}</CardTitle>
                                  <Badge variant={lowongan.statusLowongan === "DIBUKA" ? "default" : "secondary"}>
                                    {lowongan.statusLowongan}
                                  </Badge>
                                </div>
                              </CardHeader>
                              <CardContent className="pb-3 space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Asdos diterima:</span>
                                  <span>{lowongan.jumlahAsdosDiterima}/{lowongan.jumlahAsdosDibutuhkan}</span>
                                </div>
                                <Progress value={(lowongan.jumlahAsdosDiterima / lowongan.jumlahAsdosDibutuhkan) * 100} className="h-2" />
                                
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Pendaftar:</span>
                                  <span>{lowongan.jumlahAsdosPendaftar}</span>
                                </div>
                              </CardContent>
                              <CardFooter className="bg-muted/50 pt-2 pb-2">
                                <div className="text-xs text-muted-foreground w-full flex justify-between">
                                  <span>ID: {lowongan.lowonganId.substring(0, 8)}...</span>
                                  <span>{lowongan.idDaftarPendaftaran.length} pendaftaran aktif</span>
                                </div>
                              </CardFooter>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center p-4 text-muted-foreground">
                          Tidak ada lowongan untuk mata kuliah ini.
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              Belum ada mata kuliah yang diampu.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Search, Edit, Trash2, Eye, BookOpen, AlertTriangle, CheckCircle, XCircle } from "lucide-react"
import AdminSidebar from "@/components/dashboard/admin/sidebar"
import MataKuliahForm from "@/components/matakuliah/matakuliah-form"
import MataKuliahDetail from "@/components/matakuliah/matakuliah-detail"
import { fetcher } from "@/components/lib/fetcher"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface MataKuliah {
  kode: string
  nama: string
  deskripsi: string
  dosenPengampuEmails: string[]
}

export default function ManajemenMataKuliah() {
  const [MataKuliahs, setMataKuliahs] = useState<MataKuliah[]>([])
  const [filteredMataKuliahs, setFilteredMataKuliahs] = useState<MataKuliah[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMataKuliah, setSelectedMataKuliah] = useState<MataKuliah | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [MataKuliahToDelete, setMataKuliahToDelete] = useState<MataKuliah | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null)
  const router = useRouter()

  const showMessage = (type: "success" | "error" | "info", text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 5000) // Hide after 5 seconds
  }

  const fetchMataKuliahs = async () => {
    try {
      setLoading(true)
      // Use fetcher instead of direct fetch with token
      const data = await fetcher<MataKuliah[]>("/api/matakuliah/getAll")
      setMataKuliahs(data)
      setFilteredMataKuliahs(data)
    } catch (err: any) {
      console.error("Error fetching MataKuliahs:", err)
      
      // Check for authentication error
      if (err.status === 401) {
        toast.error("Sesi Anda telah berakhir. Silakan login kembali")
        router.push("/login")
        return
      }

      // For demo purposes, using mock data
      const mockData: MataKuliah[] = [
        {
          kode: "CS1234",
          nama: "Pemrograman Lanjut",
          deskripsi: "Mata kuliah lanjutan tentang pemrograman Java dan Spring Boot",
          dosenPengampuEmails: ["dosen@example.com", "pengampu@ui.ac.id"],
        },
        {
          kode: "CS123",
          nama: "Algoritma dan Struktur Data",
          deskripsi: "Pembelajaran tentang algoritma dan struktur data fundamental",
          dosenPengampuEmails: ["joko@gmail.com"],
        },
        {
          kode: "MK1",
          nama: "Mobile Development",
          deskripsi: "Pengembangan aplikasi mobile dengan React Native",
          dosenPengampuEmails: ["mobile@example.com"],
        },
        {
          kode: "MK2",
          nama: "Web Development",
          deskripsi: "Pengembangan aplikasi web modern",
          dosenPengampuEmails: ["web@example.com", "frontend@ui.ac.id"],
        },
        {
          kode: "CS102",
          nama: "Dasar Pemrograman",
          deskripsi: "Dasar-dasar pemrograman untuk pemula",
          dosenPengampuEmails: ["basic@example.com"],
        },
        {
          kode: "CS103",
          nama: "Pemrograman Berorientasi Objek",
          deskripsi: "Konsep dan implementasi OOP",
          dosenPengampuEmails: ["oop@example.com", "java@ui.ac.id"],
        },
      ]
      setMataKuliahs(mockData)
      setFilteredMataKuliahs(mockData)
      showMessage("info", "Menggunakan data contoh (API tidak tersedia)")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMataKuliahs()
  }, [])

  useEffect(() => {
    const filtered = MataKuliahs.filter(
      (MataKuliah) =>
        MataKuliah.kode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        MataKuliah.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        MataKuliah.deskripsi.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredMataKuliahs(filtered)
  }, [searchTerm, MataKuliahs])

  const handleDeleteClick = (MataKuliah: MataKuliah) => {
    setMataKuliahToDelete(MataKuliah)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!MataKuliahToDelete) return

    setIsDeleting(true)
    try {
      // Use fetcher instead of direct fetch with token
      await fetcher(`/api/matakuliah/${MataKuliahToDelete.kode}`, undefined, {
        method: "DELETE",
      })

      // Update local state after successful API call
      const updatedMataKuliahs = MataKuliahs.filter((MataKuliah) => MataKuliah.kode !== MataKuliahToDelete.kode)
      setMataKuliahs(updatedMataKuliahs)
      setFilteredMataKuliahs(updatedMataKuliahs)

      showMessage("success", "Mata kuliah berhasil dihapus")
      setIsDeleteDialogOpen(false)
      setMataKuliahToDelete(null)
    } catch (err: any) {
      console.error("Error deleting MataKuliah:", err)
      
      if (err.status === 401) {
        toast.error("Sesi Anda telah berakhir. Silakan login kembali")
        router.push("/login")
        return
      }

      // For demo purposes, still remove from local state
      const updatedMataKuliahs = MataKuliahs.filter((MataKuliah) => MataKuliah.kode !== MataKuliahToDelete?.kode)
      setMataKuliahs(updatedMataKuliahs)
      setFilteredMataKuliahs(updatedMataKuliahs)

      showMessage("info", "Mata kuliah dihapus (mode demo)")
      setIsDeleteDialogOpen(false)
      setMataKuliahToDelete(null)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false)
    setMataKuliahToDelete(null)
  }

  const handleCreateSuccess = () => {
    setIsCreateDialogOpen(false)
    fetchMataKuliahs()
    showMessage("success", "Mata kuliah berhasil dibuat")
  }

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false)
    setSelectedMataKuliah(null)
    fetchMataKuliahs()
    showMessage("success", "Mata kuliah berhasil diperbarui")
  }

  if (loading) {
    return (
      <AdminSidebar>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
            <p className="text-muted-foreground">Memuat data mata kuliah...</p>
          </div>
        </div>
      </AdminSidebar>
    )
  }

  return (
    <AdminSidebar>
      <div className="space-y-6">
        {message && (
          <div
            className={`p-4 rounded-lg border flex items-center gap-3 ${
              message.type === "success"
                ? "bg-green-50 border-green-200 text-green-800"
                : message.type === "error"
                  ? "bg-red-50 border-red-200 text-red-800"
                  : "bg-blue-50 border-blue-200 text-blue-800"
            }`}
          >
            {message.type === "success" && <CheckCircle className="h-5 w-5" />}
            {message.type === "error" && <XCircle className="h-5 w-5" />}
            {message.type === "info" && <AlertTriangle className="h-5 w-5" />}
            <span>{message.text}</span>
            <Button variant="ghost" size="sm" onClick={() => setMessage(null)} className="ml-auto h-6 w-6 p-0">
              <XCircle className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Manajemen Mata Kuliah</h1>
            <p className="text-muted-foreground">Kelola mata kuliah yang tersedia di sistem</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Mata Kuliah
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Tambah Mata Kuliah Baru</DialogTitle>
                <DialogDescription>Isi form di bawah untuk menambah mata kuliah baru</DialogDescription>
              </DialogHeader>
              <MataKuliahForm onSuccess={handleCreateSuccess} />
            </DialogContent>
          </Dialog>
        </div>

        <Card className="bg-white dark:bg-gray-800 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Daftar Mata Kuliah
            </CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari mata kuliah..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Badge variant="secondary">{filteredMataKuliahs.length} mata kuliah</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kode</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>Deskripsi</TableHead>
                    <TableHead>Dosen Pengampu</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMataKuliahs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <div className="text-muted-foreground">
                          {searchTerm ? "Tidak ada mata kuliah yang sesuai dengan pencarian" : "Belum ada mata kuliah"}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredMataKuliahs.map((MataKuliah) => (
                      <TableRow key={MataKuliah.kode}>
                        <TableCell className="font-mono font-medium">{MataKuliah.kode}</TableCell>
                        <TableCell className="font-medium">{MataKuliah.nama}</TableCell>
                        <TableCell className="max-w-xs truncate">{MataKuliah.deskripsi}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {MataKuliah.dosenPengampuEmails.slice(0, 2).map((email) => (
                              <Badge key={email} variant="outline" className="text-xs">
                                {email}
                              </Badge>
                            ))}
                            {MataKuliah.dosenPengampuEmails.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{MataKuliah.dosenPengampuEmails.length - 2} lainnya
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Dialog
                              open={isDetailDialogOpen && selectedMataKuliah?.kode === MataKuliah.kode}
                              onOpenChange={(open) => {
                                setIsDetailDialogOpen(open)
                                if (!open) setSelectedMataKuliah(null)
                              }}
                            >
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="sm" onClick={() => setSelectedMataKuliah(MataKuliah)}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Detail Mata Kuliah</DialogTitle>
                                </DialogHeader>
                                {selectedMataKuliah && <MataKuliahDetail MataKuliah={selectedMataKuliah} />}
                              </DialogContent>
                            </Dialog>

                            <Dialog
                              open={isEditDialogOpen && selectedMataKuliah?.kode === MataKuliah.kode}
                              onOpenChange={(open) => {
                                setIsEditDialogOpen(open)
                                if (!open) setSelectedMataKuliah(null)
                              }}
                            >
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="sm" onClick={() => setSelectedMataKuliah(MataKuliah)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Edit Mata Kuliah</DialogTitle>
                                  <DialogDescription>Perbarui informasi mata kuliah</DialogDescription>
                                </DialogHeader>
                                {selectedMataKuliah && <MataKuliahForm MataKuliah={selectedMataKuliah} onSuccess={handleEditSuccess} />}
                              </DialogContent>
                            </Dialog>

                            <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(MataKuliah)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Konfirmasi Penghapusan
              </DialogTitle>
              <DialogDescription>
                Apakah Anda yakin ingin menghapus mata kuliah{" "}
                <span className="font-semibold text-foreground">
                  {MataKuliahToDelete?.nama} ({MataKuliahToDelete?.kode})
                </span>
                ?
              </DialogDescription>
            </DialogHeader>
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mt-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-destructive mb-1">Peringatan!</p>
                  <p className="text-muted-foreground">
                    Tindakan ini tidak dapat dibatalkan. Semua data yang terkait dengan mata kuliah ini akan hilang
                    secara permanen.
                  </p>
                </div>
              </div>
            </div>
            <DialogFooter className="gap-2 mt-6">
              <Button variant="outline" onClick={handleDeleteCancel} disabled={isDeleting}>
                Batal
              </Button>
              <Button variant="destructive" onClick={handleDeleteConfirm} disabled={isDeleting}>
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Menghapus...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Hapus Mata Kuliah
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminSidebar>
  )
}
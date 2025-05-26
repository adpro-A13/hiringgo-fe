"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { BookOpen, User, Mail } from "lucide-react"

interface MataKuliah {
  kode: string
  nama: string
  deskripsi: string
  dosenPengampuEmails: string[]
}

interface MataKuliahDetailProps {
  MataKuliah: MataKuliah
}

export default function MataKuliahDetail({ MataKuliah }: MataKuliahDetailProps) {
  return (
    <div className="space-y-6">
      <Card className="bg-white dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            {MataKuliah.nama}
          </CardTitle>
          <Badge variant="outline" className="w-fit">
            {MataKuliah.kode}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Deskripsi</h4>
            <p className="text-muted-foreground leading-relaxed">{MataKuliah.deskripsi}</p>
          </div>

          <Separator />

          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <User className="h-4 w-4" />
              Dosen Pengampu ({MataKuliah.dosenPengampuEmails.length})
            </h4>
            <div className="space-y-2">
              {MataKuliah.dosenPengampuEmails.map((email, index) => (
                <div key={email} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{email}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

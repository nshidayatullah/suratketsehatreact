import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { IconPlus, IconTrash, IconPencil } from "@tabler/icons-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

// Interfaces
interface MasterData {
  id: number;
  nama: string;
  kode?: string;
  perusahaan?: MasterData;
}
interface Karyawan extends MasterData {
  nrp: string;
  jabatanId?: number;
  departemenId?: number;
  jabatan?: MasterData;
  departemen?: MasterData & { perusahaan?: MasterData }; // Nested relation support
}
interface Pengajuan {
  id: number;
  tanggal: string;
  waktu: string;
  lokasiKerja: string;
  judulPekerjaan: string;
  nomorIzinKerja: string;
  keterangan: string;
  departemen: MasterData;
  jabatan: MasterData;
  perusahaan: MasterData;
  jenisPekerjaan: MasterData;
  pemegangIjin: Karyawan;
  petugasPemeriksa: Karyawan;
  pengawasPekerjaan: Karyawan;
}

export default function PengajuanPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<Pengajuan[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Master Data State
  const [karyawanList, setKaryawanList] = useState<Karyawan[]>([]);
  const [deptList, setDeptList] = useState<MasterData[]>([]);
  const [jabatanList, setJabatanList] = useState<MasterData[]>([]);
  const [perusahaanList, setPerusahaanList] = useState<MasterData[]>([]);
  const [jenisPekerjaanList, setJenisPekerjaanList] = useState<MasterData[]>([]);

  // Form State
  const [formData, setFormData] = useState({
    tanggal: new Date().toISOString().split("T")[0],
    waktu: "08:00",
    lokasiKerja: "",
    departemenId: "",
    judulPekerjaan: "",
    nomorIzinKerja: "",
    pemegangIjinId: "",
    jabatanId: "",
    perusahaanId: "",
    jenisPekerjaanId: "",
    keterangan: "",
    petugasPemeriksaId: "",
    pengawasPekerjaanId: "",
  });

  // Fetch All Data
  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [resPengajuan, resKaryawan, resDept, resJab, resPerusahaan, resJenis] = await Promise.all([
        fetch("http://localhost:3000/api/pengajuan"),
        fetch("http://localhost:3000/api/karyawan"),
        fetch("http://localhost:3000/api/departemen"),
        fetch("http://localhost:3000/api/jabatan"),
        fetch("http://localhost:3000/api/perusahaan"),
        fetch("http://localhost:3000/api/jenis-pekerjaan"),
      ]);

      const [dPengajuan, dKaryawan, dDept, dJab, dPerusahaan, dJenis] = await Promise.all([resPengajuan.json(), resKaryawan.json(), resDept.json(), resJab.json(), resPerusahaan.json(), resJenis.json()]);

      if (Array.isArray(dPengajuan)) setData(dPengajuan);
      if (Array.isArray(dKaryawan)) setKaryawanList(dKaryawan);
      if (Array.isArray(dDept)) setDeptList(dDept);
      if (Array.isArray(dJab)) setJabatanList(dJab);
      if (Array.isArray(dPerusahaan)) setPerusahaanList(dPerusahaan);
      if (Array.isArray(dJenis)) setJenisPekerjaanList(dJenis);
    } catch (error) {
      console.error(error);
      toast.error("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Handle Add
  const handleAdd = () => {
    setEditingId(null);
    setFormData({
      tanggal: new Date().toISOString().split("T")[0],
      waktu: "08:00",
      lokasiKerja: "",
      departemenId: "",
      judulPekerjaan: "",
      nomorIzinKerja: "",
      pemegangIjinId: "",
      jabatanId: "",
      perusahaanId: "",
      jenisPekerjaanId: "",
      keterangan: "",
      petugasPemeriksaId: "",
      pengawasPekerjaanId: "",
    });
    setOpen(true);
  };

  // Handle Edit
  const handleEdit = (item: Pengajuan) => {
    setEditingId(item.id);
    setFormData({
      tanggal: item.tanggal ? new Date(item.tanggal).toISOString().split("T")[0] : "",
      waktu: item.waktu || "",
      lokasiKerja: item.lokasiKerja || "",
      departemenId: item.departemen?.id.toString() || "",
      judulPekerjaan: item.judulPekerjaan || "",
      nomorIzinKerja: item.nomorIzinKerja || "",
      pemegangIjinId: item.pemegangIjin?.id.toString() || "",
      jabatanId: item.jabatan?.id.toString() || "",
      perusahaanId: item.perusahaan?.id.toString() || "",
      jenisPekerjaanId: item.jenisPekerjaan?.id.toString() || "",
      keterangan: item.keterangan || "",
      petugasPemeriksaId: item.petugasPemeriksa?.id.toString() || "",
      pengawasPekerjaanId: item.pengawasPekerjaan?.id.toString() || "",
    });
    setOpen(true);
  };

  // Handle Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate required fields
    const required = ["pemegangIjinId", "jabatanId", "departemenId", "perusahaanId", "jenisPekerjaanId", "judulPekerjaan"];
    const missing = required.find((k) => !formData[k as keyof typeof formData]);
    if (missing) {
      toast.error(`Mohon lengkapi semua field: ${missing}`);
      setIsSubmitting(false);
      return;
    }

    try {
      const url = editingId ? `http://localhost:3000/api/pengajuan/${editingId}` : "http://localhost:3000/api/pengajuan";

      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success(editingId ? "Pengajuan berhasil diperbarui" : "Pengajuan berhasil dibuat");
        setOpen(false);
        fetchAllData(); // Refresh list
      } else {
        const err = await res.json();
        toast.error("Gagal: " + err.error);
      }
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan sistem");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus data pengajuan ini?")) return;
    try {
      await fetch(`http://localhost:3000/api/pengajuan/${id}`, { method: "DELETE" });
      toast.success("Data dihapus");
      fetchAllData();
    } catch {
      toast.error("Gagal menghapus");
    }
  };

  const handlePemegangIzinChange = (val: string) => {
    const kId = parseInt(val);
    const selected = karyawanList.find((k) => k.id === kId);

    if (selected) {
      setFormData((prev) => ({
        ...prev,
        pemegangIjinId: val,
        jabatanId: selected.jabatanId ? selected.jabatanId.toString() : prev.jabatanId,
        // Auto-select Perusahaan if available in Departemen relation
        perusahaanId: selected.departemen?.perusahaan?.id ? selected.departemen.perusahaan.id.toString() : prev.perusahaanId,
      }));
    } else {
      setFormData((prev) => ({ ...prev, pemegangIjinId: val }));
    }
  };

  const handleDepartemenChange = (val: string) => {
    setFormData((prev) => ({ ...prev, departemenId: val }));
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pengajuan Izin Kerja</h1>
          <p className="text-muted-foreground mt-2">Daftar permohonan izin kerja karyawan.</p>
        </div>
        <Button onClick={handleAdd} className="cursor-pointer">
          <IconPlus className="mr-2 h-4 w-4" /> Tambah Pengajuan
        </Button>
      </div>

      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No. Izin</TableHead>
              <TableHead>Waktu</TableHead>
              <TableHead>Pemegang Izin</TableHead>
              <TableHead>Lokasi & Dept</TableHead>
              <TableHead>Pekerjaan</TableHead>
              <TableHead>Pengawas & Petugas</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center h-24">
                  Memuat...
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center h-24">
                  Tidak ada data pengajuan.
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => (
                <TableRow key={item.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/pengajuan/${item.id}`)}>
                  <TableCell className="font-medium font-mono">{item.nomorIzinKerja}</TableCell>
                  <TableCell>
                    <div className="flex flex-col text-sm">
                      <span className="font-medium">{new Date(item.tanggal).toLocaleDateString()}</span>
                      <span className="text-muted-foreground text-xs">{item.waktu}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col text-sm">
                      <span className="font-medium">{item.pemegangIjin?.nama}</span>
                      <div className="text-xs text-muted-foreground flex flex-col">
                        <span>{item.jabatan?.nama}</span>
                        <span>{item.perusahaan?.nama}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col text-sm">
                      <span className="font-medium">{item.lokasiKerja}</span>
                      <span className="text-muted-foreground text-xs">{item.departemen?.nama}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col text-sm max-w-[200px]">
                      <span className="font-medium truncate" title={item.judulPekerjaan}>
                        {item.judulPekerjaan}
                      </span>
                      <Badge variant="outline" className="w-fit mt-1 text-[10px]">
                        {item.jenisPekerjaan?.nama}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col text-xs gap-1">
                      <div className="flex items-center gap-1" title="Pengawas">
                        <Badge variant="secondary" className="px-1 py-0 text-[10px]">
                          Pengawas
                        </Badge>
                        <span className="truncate max-w-[100px]">{item.pengawasPekerjaan?.nama}</span>
                      </div>
                      <div className="flex items-center gap-1" title="Pemeriksa">
                        <Badge variant="outline" className="px-1 py-0 text-[10px]">
                          Pemeriksa
                        </Badge>
                        <span className="truncate max-w-[100px]">{item.petugasPemeriksa?.nama}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(item);
                      }}
                    >
                      <IconPencil className="size-4 text-primary" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item.id);
                      }}
                    >
                      <IconTrash className="size-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal Dialog Form */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[700px] h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Pengajuan Izin Kerja" : "Buat Pengajuan Izin Kerja"}</DialogTitle>
            <DialogDescription>{editingId ? "Perbarui informasi pengajuan izin kerja." : "Lengkapi formulir pengajuan izin kerja di bawah ini."}</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto py-4 px-2">
            <form id="pengajuan-form" onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 py-4">
              <div className="col-span-2">
                <h3 className="text-sm font-medium text-muted-foreground mb-4 border-b pb-2">I. Data Umum & Pekerjaan</h3>
              </div>

              {/* Row 1: Tanggal | Nomor Izin */}
              <div className="space-y-2">
                <Label>Tanggal</Label>
                <Input type="date" value={formData.tanggal} onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Nomor Izin Kerja</Label>
                <Input placeholder="No. Dokumen" value={formData.nomorIzinKerja} onChange={(e) => setFormData({ ...formData, nomorIzinKerja: e.target.value })} />
              </div>

              {/* Row 2: Waktu | Pemegang Izin */}
              <div className="space-y-2">
                <Label>Waktu</Label>
                <Input type="time" value={formData.waktu} onChange={(e) => setFormData({ ...formData, waktu: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Pemegang Izin</Label>
                <Select onValueChange={handlePemegangIzinChange} value={formData.pemegangIjinId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Karyawan" />
                  </SelectTrigger>
                  <SelectContent>
                    {karyawanList.map((i) => (
                      <SelectItem key={i.id} value={i.id.toString()}>
                        {i.nama} - {i.nrp}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Row 3: Lokasi Kerja | Jabatan */}
              <div className="space-y-2">
                <Label>Lokasi Kerja</Label>
                <Input placeholder="Area / Gedung / Ruangan" value={formData.lokasiKerja} onChange={(e) => setFormData({ ...formData, lokasiKerja: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Jabatan</Label>
                <Select onValueChange={(v) => setFormData({ ...formData, jabatanId: v })} disabled={!!formData.pemegangIjinId} value={formData.jabatanId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Jabatan" />
                  </SelectTrigger>
                  <SelectContent>
                    {jabatanList.map((i) => (
                      <SelectItem key={i.id} value={i.id.toString()}>
                        {i.nama}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Row 4: Departemen | Perusahaan */}
              <div className="space-y-2">
                <Label>Departemen</Label>
                <Select onValueChange={handleDepartemenChange} value={formData.departemenId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Departemen" />
                  </SelectTrigger>
                  <SelectContent>
                    {deptList.map((i) => (
                      <SelectItem key={i.id} value={i.id.toString()}>
                        {i.nama}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Perusahaan</Label>
                <Select onValueChange={(v) => setFormData({ ...formData, perusahaanId: v })} disabled={!!formData.pemegangIjinId} value={formData.perusahaanId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Perusahaan" />
                  </SelectTrigger>
                  <SelectContent>
                    {perusahaanList.map((i) => (
                      <SelectItem key={i.id} value={i.id.toString()}>
                        {i.nama}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Row 5: Judul Pekerjaan */}
              <div className="space-y-2 col-span-2">
                <Label>Judul Pekerjaan</Label>
                <Input placeholder="Uraian singkat pekerjaan" value={formData.judulPekerjaan} onChange={(e) => setFormData({ ...formData, judulPekerjaan: e.target.value })} />
              </div>

              {/* Row 6: Jenis Pekerjaan */}
              <div className="space-y-2 col-span-2">
                <Label>Jenis Pekerjaan</Label>
                <Select onValueChange={(v) => setFormData({ ...formData, jenisPekerjaanId: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Jenis" />
                  </SelectTrigger>
                  <SelectContent>
                    {jenisPekerjaanList.map((i) => (
                      <SelectItem key={i.id} value={i.id.toString()}>
                        {i.nama}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-2 mt-4">
                <h3 className="text-sm font-medium text-muted-foreground mb-4 border-b pb-2">II. Pengesahan & Keterangan</h3>
              </div>

              <div className="space-y-2">
                <Label>Petugas Pemeriksa</Label>
                <Select onValueChange={(v) => setFormData({ ...formData, petugasPemeriksaId: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Petugas" />
                  </SelectTrigger>
                  <SelectContent>
                    {karyawanList.map((i) => (
                      <SelectItem key={i.id} value={i.id.toString()}>
                        {i.nama}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Pengawas Pekerjaan</Label>
                <Select onValueChange={(v) => setFormData({ ...formData, pengawasPekerjaanId: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Pengawas" />
                  </SelectTrigger>
                  <SelectContent>
                    {karyawanList.map((i) => (
                      <SelectItem key={i.id} value={i.id.toString()}>
                        {i.nama}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 col-span-2">
                <Label>Keterangan Tambahan</Label>
                <Textarea placeholder="Catatan khusus..." value={formData.keterangan} onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })} />
              </div>
            </form>
          </div>
          <DialogFooter className="pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button type="submit" form="pengajuan-form" disabled={isSubmitting}>
              Simpan Pengajuan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

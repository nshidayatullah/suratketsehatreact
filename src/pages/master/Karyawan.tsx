import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IconPencil, IconPlus, IconTrash, IconBuilding, IconSitemap, IconBriefcase } from "@tabler/icons-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface Perusahaan {
  id: number;
  nama: string;
}

interface Departemen {
  id: number;
  nama: string;
  perusahaanId: number;
}

interface Jabatan {
  id: number;
  nama: string;
  departemenId: number;
}

interface Karyawan {
  id: number;
  nrp: string;
  nrpBib: string | null;
  nama: string;
  telepon: string | null;
  status: string;
  tanggalLahir: string | null;
  tanggalMasuk: string | null;
  tinggiBadan: number | null;
  beratBadan: number | null;
  departemenId: number;
  jabatanId: number;
  jabatan: {
    nama: string;
  };
  departemen: {
    nama: string;
    perusahaan: {
      nama: string;
    };
  };
}

export default function MasterKaryawan() {
  const [data, setData] = useState<Karyawan[]>([]);
  const [perusahaanList, setPerusahaanList] = useState<Perusahaan[]>([]);
  const [departemenList, setDepartemenList] = useState<Departemen[]>([]);
  const [jabatanList, setJabatanList] = useState<Jabatan[]>([]);

  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    nrp: "",
    nrpBib: "",
    nama: "",
    telepon: "",
    status: "ACTIVE",
    perusahaanId: "",
    departemenId: "",
    jabatanId: "",
    tanggalLahir: "",
    tanggalMasuk: "",
    tinggiBadan: "",
    beratBadan: "",
  });

  // Derived Lists
  const filteredDepartemen = departemenList.filter((d) => d.perusahaanId.toString() === formData.perusahaanId);

  const filteredJabatan = jabatanList.filter((j) => j.departemenId.toString() === formData.departemenId);

  // Fetch Data
  const fetchData = async (retry = false) => {
    try {
      if (!retry) setLoading(true);
      const [resKaryawan, resJab, resDept, resPer] = await Promise.all([
        fetch("http://localhost:3000/api/karyawan"),
        fetch("http://localhost:3000/api/jabatan"),
        fetch("http://localhost:3000/api/departemen"),
        fetch("http://localhost:3000/api/perusahaan"),
      ]);

      const dataKaryawan = await resKaryawan.json();
      const dataJab = await resJab.json();
      const dataDept = await resDept.json();
      const dataPer = await resPer.json();

      if (Array.isArray(dataKaryawan)) setData(dataKaryawan);
      if (Array.isArray(dataJab)) setJabatanList(dataJab);
      if (Array.isArray(dataDept)) setDepartemenList(dataDept);
      if (Array.isArray(dataPer)) setPerusahaanList(dataPer);
    } catch (error) {
      console.error("Error fetching data:", error);
      if (!retry) toast.error("Gagal mengambil data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const onFocus = () => fetchData(true);
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  // Handle Add
  const handleAdd = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({
      nrp: "",
      nrpBib: "",
      nama: "",
      telepon: "",
      status: "ACTIVE",
      perusahaanId: "",
      departemenId: "",
      jabatanId: "",
      tanggalLahir: "",
      tanggalMasuk: "",
      tinggiBadan: "",
      beratBadan: "",
    });
    setOpen(true);
  };

  // Handle Edit
  const handleEdit = (item: Karyawan) => {
    setIsEditing(true);
    setCurrentId(item.id);

    // Cari Perusahaan ID dari departemen item
    const dept = departemenList.find((d) => d.id === item.departemenId);
    const perusahaanId = dept ? dept.perusahaanId.toString() : "";

    // Format Date untuk Input Date (YYYY-MM-DD)
    const formatDate = (isoString: string | null) => {
      if (!isoString) return "";
      return isoString.split("T")[0];
    };

    setFormData({
      nrp: item.nrp,
      nrpBib: item.nrpBib || "",
      nama: item.nama,
      telepon: item.telepon || "",
      status: item.status,
      perusahaanId: perusahaanId,
      departemenId: item.departemenId.toString(),
      jabatanId: item.jabatanId.toString(),
      tanggalLahir: formatDate(item.tanggalLahir),
      tanggalMasuk: formatDate(item.tanggalMasuk),
      tinggiBadan: item.tinggiBadan ? item.tinggiBadan.toString() : "",
      beratBadan: item.beratBadan ? item.beratBadan.toString() : "",
    });
    setOpen(true);
  };

  // Handle Delete
  const handleDelete = async (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus data karyawan ini?")) {
      try {
        const res = await fetch(`http://localhost:3000/api/karyawan/${id}`, {
          method: "DELETE",
        });
        if (res.ok) {
          toast.success("Karyawan berhasil dihapus");
          fetchData();
        } else {
          toast.error("Gagal menghapus data");
        }
      } catch {
        toast.error("Terjadi kesalahan sistem");
      }
    }
  };

  // Handle Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama || !formData.departemenId || !formData.jabatanId) {
      toast.error("Nama, Departemen, dan Jabatan wajib diisi");
      return;
    }

    setIsSubmitting(true);
    try {
      const url = isEditing ? `http://localhost:3000/api/karyawan/${currentId}` : "http://localhost:3000/api/karyawan";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success(isEditing ? "Data diperbarui" : "Karyawan ditambahkan");
        setOpen(false);
        fetchData();
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

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Master Karyawan</h1>
          <p className="text-muted-foreground mt-2">Kelola data seluruh karyawan perusahaan.</p>
        </div>
        <Button onClick={handleAdd} className="cursor-pointer transition-all hover:bg-primary/90 active:scale-95">
          <IconPlus className="mr-2 h-4 w-4" />
          Tambah Karyawan
        </Button>
      </div>

      {/* Modal Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Karyawan" : "Tambah Karyawan Baru"}</DialogTitle>
            <DialogDescription>Input data lengkap karyawan.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-6 py-4">
              {/* Kolom Kiri: Organisasi & Status */}
              <div className="space-y-4">
                <h3 className="font-semibold text-primary border-b pb-1 mb-2">Organisasi</h3>
                <div className="space-y-2">
                  <Label>Perusahaan</Label>
                  <div className="flex gap-2">
                    <Select value={formData.perusahaanId} onValueChange={(val) => setFormData({ ...formData, perusahaanId: val, departemenId: "", jabatanId: "" })}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Pilih Perusahaan" />
                      </SelectTrigger>
                      <SelectContent>
                        {perusahaanList.map((p) => (
                          <SelectItem key={p.id} value={p.id.toString()}>
                            {p.nama}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button type="button" variant="outline" size="icon" className="shrink-0" onClick={() => window.open("/master/perusahaan", "_blank")} title="Tambah Perusahaan Baru">
                      <IconPlus className="size-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Departemen</Label>
                  <div className="flex gap-2">
                    <Select value={formData.departemenId} onValueChange={(val) => setFormData({ ...formData, departemenId: val, jabatanId: "" })} disabled={!formData.perusahaanId}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Pilih Departemen" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredDepartemen.map((d) => (
                          <SelectItem key={d.id} value={d.id.toString()}>
                            {d.nama}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button type="button" variant="outline" size="icon" className="shrink-0" onClick={() => window.open("/master/departemen", "_blank")} title="Tambah Departemen Baru">
                      <IconPlus className="size-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Jabatan</Label>
                  <div className="flex gap-2">
                    <Select value={formData.jabatanId} onValueChange={(val) => setFormData({ ...formData, jabatanId: val })} disabled={!formData.departemenId}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Pilih Jabatan" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredJabatan.map((j) => (
                          <SelectItem key={j.id} value={j.id.toString()}>
                            {j.nama}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button type="button" variant="outline" size="icon" className="shrink-0" onClick={() => window.open("/master/jabatan", "_blank")} title="Tambah Jabatan Baru">
                      <IconPlus className="size-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Tanggal Masuk</Label>
                  <Input type="date" value={formData.tanggalMasuk} onChange={(e) => setFormData({ ...formData, tanggalMasuk: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={formData.status} onValueChange={(val) => setFormData({ ...formData, status: val })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="RESIGNED">Resigned</SelectItem>
                      <SelectItem value="LEAVE">Leave</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Kolom Kanan: Identitas & Fisik */}
              <div className="space-y-4">
                <h3 className="font-semibold text-primary border-b pb-1 mb-2">Identitas Personal</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label>NRP</Label>
                    <Input placeholder="12345678" value={formData.nrp} onChange={(e) => setFormData({ ...formData, nrp: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>NRP BIB</Label>
                    <Input placeholder="Opsional" value={formData.nrpBib} onChange={(e) => setFormData({ ...formData, nrpBib: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Nama Lengkap (Wajib)</Label>
                  <Input placeholder="Nama Karyawan" value={formData.nama} onChange={(e) => setFormData({ ...formData, nama: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Telepon</Label>
                  <Input placeholder="0812..." value={formData.telepon} onChange={(e) => setFormData({ ...formData, telepon: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Tanggal Lahir</Label>
                  <Input type="date" value={formData.tanggalLahir} onChange={(e) => setFormData({ ...formData, tanggalLahir: e.target.value })} />
                </div>

                <h3 className="font-semibold text-primary border-b pb-1 mb-2 mt-4">Data Fisik</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label>Tinggi (cm)</Label>
                    <Input type="number" placeholder="170" value={formData.tinggiBadan} onChange={(e) => setFormData({ ...formData, tinggiBadan: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Berat (kg)</Label>
                    <Input type="number" placeholder="60" value={formData.beratBadan} onChange={(e) => setFormData({ ...formData, beratBadan: e.target.value })} />
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting} className="cursor-pointer transition-all hover:bg-primary/90 active:scale-95">
                {isSubmitting ? "Menyimpan..." : isEditing ? "Update Data" : "Simpan Data"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Table */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>NRP / NRP BIB</TableHead>
              <TableHead>Nama Karyawan</TableHead>
              <TableHead>Jabatan & Dept</TableHead>
              <TableHead>Perusahaan</TableHead>
              <TableHead>TB / BB</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center h-24">
                  Memuat data...
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center h-24">
                  Belum ada data karyawan.
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-mono font-medium">{item.nrp}</span>
                      {item.nrpBib && <span className="text-xs text-muted-foreground">{item.nrpBib}</span>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{item.nama}</span>
                      <span className="text-xs text-muted-foreground">{item.telepon || "-"}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1 text-xs font-semibold">
                        <IconBriefcase className="size-3" /> {item.jabatan?.nama || "-"}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <IconSitemap className="size-3" /> {item.departemen?.nama || "-"}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-xs">
                      <IconBuilding className="size-3" /> {item.departemen?.perusahaan?.nama || "-"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs">
                      <div>TB: {item.tinggiBadan ? `${item.tinggiBadan} cm` : "-"}</div>
                      <div>BB: {item.beratBadan ? `${item.beratBadan} kg` : "-"}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={item.status === "ACTIVE" ? "default" : "secondary"}>{item.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="icon" onClick={() => handleEdit(item)} className="cursor-pointer hover:bg-muted active:scale-95 transition-all">
                        <IconPencil className="size-4" />
                      </Button>
                      <Button variant="destructive" size="icon" onClick={() => handleDelete(item.id)} className="cursor-pointer hover:bg-destructive/90 active:scale-95 transition-all">
                        <IconTrash className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

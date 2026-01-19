import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IconBriefcase, IconPencil, IconPlus, IconTrash, IconBuilding, IconSitemap } from "@tabler/icons-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

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
  kode: string;
  nama: string;
  departemenId: number;
  departemen?: {
    nama: string;
    perusahaanId?: number;
    perusahaan?: {
      id: number;
      nama: string;
    };
  };
  status: string; // ACTIVE, INACTIVE
}

export default function MasterJabatan() {
  const [data, setData] = useState<Jabatan[]>([]);
  const [perusahaanList, setPerusahaanList] = useState<Perusahaan[]>([]);
  const [departemenList, setDepartemenList] = useState<Departemen[]>([]);
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [filters, setFilters] = useState({
    kode: "",
    nama: "",
    departemen: "all",
    perusahaan: "all",
    status: "all",
  });

  const [formData, setFormData] = useState({
    kode: "",
    nama: "",
    perusahaanId: "",
    departemenId: "",
    status: "ACTIVE",
  });

  // Filtered Departments based on selected Perusahaan
  const filteredDepartemen = departemenList.filter((d) => d.perusahaanId.toString() === formData.perusahaanId);

  // Fetch All Data
  const fetchData = async (retry = false) => {
    try {
      if (!retry) setLoading(true);
      const [resJab, resDept, resPer] = await Promise.all([fetch("http://localhost:3000/api/jabatan"), fetch("http://localhost:3000/api/departemen"), fetch("http://localhost:3000/api/perusahaan")]);

      const dataJab = await resJab.json();
      const dataDept = await resDept.json();
      const dataPer = await resPer.json();

      if (Array.isArray(dataJab)) setData(dataJab);
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

  // Handle Open Modal (Add)
  const handleAdd = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({
      kode: "",
      nama: "",
      perusahaanId: "",
      departemenId: "",
      status: "ACTIVE",
    });
    setOpen(true);
  };

  // Handle Open Modal (Edit)
  const handleEdit = (item: Jabatan) => {
    setIsEditing(true);
    setCurrentId(item.id);

    // Cari perusahaanId berdasarkan departemenId
    const dept = departemenList.find((d) => d.id === item.departemenId);
    const perusahaanId = dept ? dept.perusahaanId.toString() : "";

    setFormData({
      kode: item.kode,
      nama: item.nama,
      perusahaanId: perusahaanId,
      departemenId: item.departemenId.toString(),
      status: item.status || "ACTIVE",
    });
    setOpen(true);
  };

  // Handle Delete
  const handleDelete = async (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus jabatan ini?")) {
      try {
        const res = await fetch(`http://localhost:3000/api/jabatan/${id}`, {
          method: "DELETE",
        });

        if (res.ok) {
          toast.success("Jabatan berhasil dihapus");
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

    // Validasi
    if (!formData.kode || !formData.nama || !formData.departemenId) {
      toast.error("Semua field wajib diisi");
      return;
    }

    setIsSubmitting(true);
    try {
      const url = isEditing ? `http://localhost:3000/api/jabatan/${currentId}` : "http://localhost:3000/api/jabatan";

      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kode: formData.kode,
          nama: formData.nama,
          departemenId: formData.departemenId,
          status: formData.status,
        }),
      });

      if (res.ok) {
        toast.success(isEditing ? "Data berhasil diperbarui" : "Jabatan berhasil ditambahkan");
        setOpen(false);
        fetchData();
      } else {
        const err = await res.json();
        toast.error("Gagal menyimpan: " + err.error);
      }
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan sistem");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredData = data.filter((item) => {
    const matchKode = item.kode.toLowerCase().includes(filters.kode.toLowerCase());
    const matchNama = item.nama.toLowerCase().includes(filters.nama.toLowerCase());
    // Filter by Nama Departemen (String match) instead of ID
    const matchDepartemen = filters.departemen === "all" || item.departemen?.nama === filters.departemen;
    // Asumsi item.departemen memiliki perusahaanId (dari interface Departemen) atau access via perusahaan.id
    const matchPerusahaan = filters.perusahaan === "all" || item.departemen?.perusahaan?.id?.toString() === filters.perusahaan || item.departemen?.perusahaanId?.toString() === filters.perusahaan;
    const matchStatus = filters.status === "all" || item.status === filters.status;
    return matchKode && matchNama && matchDepartemen && matchPerusahaan && matchStatus;
  });

  // Unique Department Names for Filter
  const uniqueDepartemenNames = Array.from(new Set(departemenList.map((d) => d.nama))).sort();

  const totalPages = itemsPerPage === 0 ? 1 : Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = itemsPerPage === 0 ? filteredData : filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Master Jabatan</h1>
          <p className="text-muted-foreground mt-2">Kelola data jabatan di setiap departemen dan perusahaan.</p>
        </div>
        <Button onClick={handleAdd} className="cursor-pointer transition-all hover:bg-primary/90 active:scale-95">
          <IconPlus className="mr-2 h-4 w-4" />
          Tambah Jabatan
        </Button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{isEditing ? "Edit Jabatan" : "Tambah Jabatan Baru"}</DialogTitle>
              <DialogDescription>{isEditing ? "Perbarui detail jabatan." : "Isi detail jabatan di bawah ini."} Klik simpan setelah selesai.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                {/* Pilih Perusahaan */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="perusahaan" className="text-right">
                    Perusahaan
                  </Label>
                  <div className="col-span-3 flex gap-2">
                    <Select value={formData.perusahaanId} onValueChange={(value) => setFormData({ ...formData, perusahaanId: value, departemenId: "" })}>
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

                {/* Pilih Departemen (Filtered) */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="departemen" className="text-right">
                    Departemen
                  </Label>
                  <div className="col-span-3 flex gap-2">
                    <Select value={formData.departemenId} onValueChange={(value) => setFormData({ ...formData, departemenId: value })} disabled={!formData.perusahaanId}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={formData.perusahaanId ? "Pilih Departemen" : "Pilih Perusahaan Dulu"} />
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

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="kode" className="text-right">
                    Kode
                  </Label>
                  <Input id="kode" placeholder="Contoh: MGR-IT" className="col-span-3" value={formData.kode} onChange={(e) => setFormData({ ...formData, kode: e.target.value })} />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="nama" className="text-right">
                    Nama Jabatan
                  </Label>
                  <Input id="nama" placeholder="IT Manager" className="col-span-3" value={formData.nama} onChange={(e) => setFormData({ ...formData, nama: e.target.value })} />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="status" className="text-right">
                    Status
                  </Label>
                  <div className="flex items-center space-x-2 col-span-3">
                    <Switch id="status" checked={formData.status === "ACTIVE"} onCheckedChange={(checked: boolean) => setFormData({ ...formData, status: checked ? "ACTIVE" : "INACTIVE" })} />
                    <Label htmlFor="status">{formData.status === "ACTIVE" ? "Aktif" : "Non Aktif"}</Label>
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
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jabatan</CardTitle>
            <IconBriefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktif</CardTitle>
            <div className="h-4 w-4 rounded-full bg-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.filter((i) => i.status === "ACTIVE").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Non Aktif</CardTitle>
            <div className="h-4 w-4 rounded-full bg-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.filter((i) => i.status !== "ACTIVE").length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-xl border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-blue-600 hover:bg-blue-600 [&_th]:text-white">
              <TableHead className="w-[100px]">Kode</TableHead>
              <TableHead>Nama Jabatan</TableHead>
              <TableHead>Departemen</TableHead>
              <TableHead>Perusahaan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
            <TableRow>
              <TableHead className="p-2">
                <Input placeholder="Filter Kode" value={filters.kode} onChange={(e) => setFilters({ ...filters, kode: e.target.value })} className="h-8 text-xs" />
              </TableHead>
              <TableHead className="p-2">
                <Input placeholder="Filter Nama" value={filters.nama} onChange={(e) => setFilters({ ...filters, nama: e.target.value })} className="h-8 text-xs" />
              </TableHead>
              <TableHead className="p-2">
                <Select value={filters.departemen} onValueChange={(val) => setFilters({ ...filters, departemen: val })}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua</SelectItem>
                    {uniqueDepartemenNames.map((nama) => (
                      <SelectItem key={nama} value={nama}>
                        {nama}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableHead>
              <TableHead className="p-2">
                <Select value={filters.perusahaan} onValueChange={(val) => setFilters({ ...filters, perusahaan: val })}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua</SelectItem>
                    {perusahaanList.map((p) => (
                      <SelectItem key={p.id} value={p.id.toString()}>
                        {p.nama}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableHead>
              <TableHead className="p-2">
                <Select value={filters.status} onValueChange={(val) => setFilters({ ...filters, status: val })}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua</SelectItem>
                    <SelectItem value="ACTIVE">Aktif</SelectItem>
                    <SelectItem value="INACTIVE">Non Aktif</SelectItem>
                  </SelectContent>
                </Select>
              </TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Memuat data...
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Belum ada data jabatan.
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.kode}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <IconBriefcase className="size-4 text-muted-foreground" />
                      <span className="font-medium">{item.nama}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <IconSitemap className="size-4 text-muted-foreground" />
                      <span className="font-medium">{item.departemen?.nama || "-"}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <IconBuilding className="size-4 text-muted-foreground" />
                      <span className="font-medium">{item.departemen?.perusahaan?.nama || "-"}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${item.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {item.status === "ACTIVE" ? "Aktif" : "Non Aktif"}
                    </span>
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

      {/* Pagination Controls */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Menampilkan {paginatedData.length > 0 ? (itemsPerPage === 0 ? 1 : (currentPage - 1) * itemsPerPage + 1) : 0} hingga {itemsPerPage === 0 ? filteredData.length : Math.min(currentPage * itemsPerPage, filteredData.length)} dari{" "}
          {filteredData.length} data
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center gap-2 mr-4">
            <span className="text-sm text-muted-foreground">Baris per halaman</span>
            <Select
              value={itemsPerPage === 0 ? "all" : itemsPerPage.toString()}
              onValueChange={(value) => {
                setItemsPerPage(value === "all" ? 0 : Number(value));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[70px]">
                <SelectValue placeholder="5" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="all">Semua</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="cursor-pointer">
            Sebelumnya
          </Button>
          <div className="text-sm font-medium">
            Halaman {currentPage} dari {totalPages}
          </div>
          <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="cursor-pointer">
            Selanjutnya
          </Button>
        </div>
      </div>
    </div>
  );
}

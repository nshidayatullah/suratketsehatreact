import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IconBuilding, IconPencil, IconPlus, IconTrash, IconSitemap } from "@tabler/icons-react";
import { toast } from "sonner";

interface Departemen {
  id: number;
  kode: string;
  nama: string;
  perusahaanId: number;
  perusahaan?: {
    nama: string;
  };
}

interface Perusahaan {
  id: number;
  nama: string;
}

export default function MasterDepartemen() {
  const [data, setData] = useState<Departemen[]>([]);
  const [perusahaanList, setPerusahaanList] = useState<Perusahaan[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    kode: "",
    nama: "",
    perusahaanId: "",
  });

  // Fetch Data Departemen & Perusahaan
  const fetchData = async (retry = false) => {
    try {
      if (!retry) setLoading(true);
      const [resDept, resPerusahaan] = await Promise.all([fetch("http://localhost:3000/api/departemen"), fetch("http://localhost:3000/api/perusahaan")]);

      const dataDept = await resDept.json();
      const dataPerusahaan = await resPerusahaan.json();

      if (Array.isArray(dataDept)) setData(dataDept);
      if (Array.isArray(dataPerusahaan)) setPerusahaanList(dataPerusahaan);
    } catch (error) {
      console.error("Error fetching data:", error);
      if (!retry) toast.error("Gagal mengambil data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Auto refresh saat tab aktif kembali
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
    });
    setOpen(true);
  };

  // Handle Open Modal (Edit)
  const handleEdit = (item: Departemen) => {
    setIsEditing(true);
    setCurrentId(item.id);
    setFormData({
      kode: item.kode,
      nama: item.nama,
      perusahaanId: item.perusahaanId.toString(),
    });
    setOpen(true);
  };

  // Handle Delete
  const handleDelete = async (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus data ini?")) {
      try {
        const res = await fetch(`http://localhost:3000/api/departemen/${id}`, {
          method: "DELETE",
        });

        if (res.ok) {
          toast.success("Data berhasil dihapus");
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

    // Validasi Manual
    if (!formData.kode || !formData.nama || !formData.perusahaanId) {
      toast.error("Semua field wajib diisi");
      return;
    }

    setIsSubmitting(true);
    try {
      const url = isEditing ? `http://localhost:3000/api/departemen/${currentId}` : "http://localhost:3000/api/departemen";

      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success(isEditing ? "Data berhasil diperbarui" : "Departemen berhasil ditambahkan");
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

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Master Departemen</h1>
          <p className="text-muted-foreground mt-2">Kelola data departemen di setiap perusahaan.</p>
        </div>
        <Button onClick={handleAdd} className="cursor-pointer transition-all hover:bg-primary/90 active:scale-95">
          <IconPlus className="mr-2 h-4 w-4" />
          Tambah Departemen
        </Button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{isEditing ? "Edit Departemen" : "Tambah Departemen Baru"}</DialogTitle>
              <DialogDescription>{isEditing ? "Perbarui detail departemen." : "Isi detail departemen di bawah ini."} Klik simpan setelah selesai.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="perusahaan" className="text-right">
                    Perusahaan
                  </Label>
                  <div className="col-span-3 flex gap-2">
                    <Select value={formData.perusahaanId} onValueChange={(value) => setFormData({ ...formData, perusahaanId: value })}>
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
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="kode" className="text-right">
                    Kode Dept
                  </Label>
                  <Input id="kode" placeholder="Contoh: HRD, IT" className="col-span-3" value={formData.kode} onChange={(e) => setFormData({ ...formData, kode: e.target.value })} />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="nama" className="text-right">
                    Nama Dept
                  </Label>
                  <Input id="nama" placeholder="Human Resources, Information Tech" className="col-span-3" value={formData.nama} onChange={(e) => setFormData({ ...formData, nama: e.target.value })} />
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

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Kode</TableHead>
              <TableHead>Nama Departemen</TableHead>
              <TableHead>Perusahaan</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  Memuat data...
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  Belum ada data departemen.
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.kode}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <IconSitemap className="size-4 text-muted-foreground" />
                      <span className="font-medium">{item.nama}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <IconBuilding className="size-4 text-muted-foreground" />
                      <span>{item.perusahaan?.nama || "-"}</span>
                    </div>
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

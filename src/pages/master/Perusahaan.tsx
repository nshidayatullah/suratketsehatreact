import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IconBuilding, IconPencil, IconPlus, IconTrash } from "@tabler/icons-react";
import { toast } from "sonner";

interface Perusahaan {
  id: number;
  kode: string;
  nama: string;
  alamat: string;
}

export default function MasterPerusahaan() {
  const [data, setData] = useState<Perusahaan[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    kode: "",
    nama: "",
    alamat: "",
  });

  // Fetch Data
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:3000/api/perusahaan");
      const result = await res.json();
      if (Array.isArray(result)) {
        setData(result);
      } else {
        setData([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Gagal mengambil data perusahaan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle Open Modal (Add)
  const handleAdd = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({
      kode: "",
      nama: "",
      alamat: "",
    });
    setOpen(true);
  };

  // Handle Open Modal (Edit)
  const handleEdit = (item: Perusahaan) => {
    setIsEditing(true);
    setCurrentId(item.id);
    setFormData({
      kode: item.kode,
      nama: item.nama,
      alamat: item.alamat || "",
    });
    setOpen(true);
  };

  // Handle Delete
  const handleDelete = async (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus data ini?")) {
      try {
        const res = await fetch(`http://localhost:3000/api/perusahaan/${id}`, {
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
    console.log("Submit clicked", formData);

    // Validasi Manual
    if (!formData.kode || !formData.nama) {
      toast.error("Kode dan Nama Perusahaan wajib diisi");
      return;
    }

    setIsSubmitting(true);
    try {
      const url = isEditing ? `http://localhost:3000/api/perusahaan/${currentId}` : "http://localhost:3000/api/perusahaan";

      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        // Hanya kirim field yang relevan
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success(isEditing ? "Data berhasil diperbarui" : "Perusahaan berhasil ditambahkan");
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
          <h1 className="text-3xl font-bold tracking-tight">Master Perusahaan</h1>
          <p className="text-muted-foreground mt-2">Kelola data perusahaan induk dan cabang.</p>
        </div>
        <Button onClick={handleAdd} className="cursor-pointer transition-all hover:bg-primary/90 active:scale-95">
          <IconPlus className="mr-2 h-4 w-4" />
          Tambah Perusahaan
        </Button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{isEditing ? "Edit Perusahaan" : "Tambah Perusahaan Baru"}</DialogTitle>
              <DialogDescription>{isEditing ? "Perbarui detail perusahaan." : "Isi detail perusahaan di bawah ini."} Klik simpan setelah selesai.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="kode" className="text-right">
                    Kode
                  </Label>
                  <Input id="kode" placeholder="Contoh: PT-01" className="col-span-3" value={formData.kode} onChange={(e) => setFormData({ ...formData, kode: e.target.value })} />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="nama" className="text-right">
                    Nama
                  </Label>
                  <Input id="nama" placeholder="PT. Maju Mundur" className="col-span-3" value={formData.nama} onChange={(e) => setFormData({ ...formData, nama: e.target.value })} />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="alamat" className="text-right">
                    Alamat
                  </Label>
                  <Input id="alamat" className="col-span-3" value={formData.alamat} onChange={(e) => setFormData({ ...formData, alamat: e.target.value })} />
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
              <TableHead>Nama Perusahaan</TableHead>
              <TableHead>Alamat</TableHead>
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
                  Belum ada data perusahaan.
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.kode}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <IconBuilding className="size-4 text-muted-foreground" />
                      <div className="flex flex-col">
                        <span className="font-medium">{item.nama}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{item.alamat || "-"}</TableCell>
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

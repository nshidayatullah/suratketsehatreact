import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IconPencil, IconPlus, IconTrash, IconBriefcase } from "@tabler/icons-react";
import { toast } from "sonner";

interface JenisPekerjaan {
  id: number;
  kode: string;
  nama: string;
}

export default function MasterJenisPekerjaan() {
  const [data, setData] = useState<JenisPekerjaan[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    kode: "",
    nama: "",
  });

  // Fetch Data
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:3000/api/jenis-pekerjaan");
      const result = await res.json();
      if (Array.isArray(result)) setData(result);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Gagal mengambil data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle Add
  const handleAdd = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({ kode: "", nama: "" });
    setOpen(true);
  };

  // Handle Edit
  const handleEdit = (item: JenisPekerjaan) => {
    setIsEditing(true);
    setCurrentId(item.id);
    setFormData({ kode: item.kode, nama: item.nama });
    setOpen(true);
  };

  // Handle Delete
  const handleDelete = async (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus data ini?")) {
      try {
        const res = await fetch(`http://localhost:3000/api/jenis-pekerjaan/${id}`, {
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
    if (!formData.kode || !formData.nama) {
      toast.error("Semua field wajib diisi");
      return;
    }

    setIsSubmitting(true);
    try {
      const url = isEditing ? `http://localhost:3000/api/jenis-pekerjaan/${currentId}` : "http://localhost:3000/api/jenis-pekerjaan";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success(isEditing ? "Data diperbarui" : "Data berhasil disimpan");
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
          <h1 className="text-3xl font-bold tracking-tight">Master Jenis Pekerjaan</h1>
          <p className="text-muted-foreground mt-2">Kelola data jenis pekerjaan (Job Type).</p>
        </div>
        <Button onClick={handleAdd} className="cursor-pointer transition-all hover:bg-primary/90 active:scale-95">
          <IconPlus className="mr-2 h-4 w-4" />
          Tambah Data
        </Button>
      </div>

      {/* Modal Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Jenis Pekerjaan" : "Tambah Jenis Pekerjaan"}</DialogTitle>
            <DialogDescription>Isi detail jenis pekerjaan di bawah ini.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="kode">Kode Pekerjaan</Label>
                <Input id="kode" placeholder="Contoh: JP001" value={formData.kode} onChange={(e) => setFormData({ ...formData, kode: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nama">Nama Pekerjaan</Label>
                <Input id="nama" placeholder="Contoh: Full Time, Contract, dll" value={formData.nama} onChange={(e) => setFormData({ ...formData, nama: e.target.value })} />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting} className="cursor-pointer transition-all hover:bg-primary/90 active:scale-95">
                {isSubmitting ? "Menyimpan..." : "Simpan"}
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
              <TableHead>Kode</TableHead>
              <TableHead>Nama Pekerjaan</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center h-24">
                  Memuat data...
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center h-24">
                  Belum ada data.
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium font-mono">{item.kode}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <IconBriefcase className="size-4 text-muted-foreground" />
                      {item.nama}
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

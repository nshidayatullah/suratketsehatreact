import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IconPencil, IconPlus, IconTrash } from "@tabler/icons-react";
import { toast } from "sonner";
import { Textarea } from "../../components/ui/textarea";
import { getRoleIcon } from "@/lib/role-utils";

interface Role {
  id: number;
  name: string;
  description: string | null;
}

export default function RoleManagement() {
  const [data, setData] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  // Fetch Data
  const fetchData = async (retry = false) => {
    try {
      if (!retry) setLoading(true);
      const res = await fetch("http://localhost:3000/api/roles");
      const result = await res.json();
      if (Array.isArray(result)) setData(result);
    } catch (error) {
      console.error("Error fetching roles:", error);
      if (!retry) toast.error("Gagal mengambil data role");
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
    setFormData({ name: "", description: "" });
    setOpen(true);
  };

  // Handle Edit
  const handleEdit = (item: Role) => {
    setIsEditing(true);
    setCurrentId(item.id);
    setFormData({
      name: item.name,
      description: item.description || "",
    });
    setOpen(true);
  };

  // Handle Delete
  const handleDelete = async (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus role ini? User dengan role ini mungkin akan error.")) {
      try {
        const res = await fetch(`http://localhost:3000/api/roles/${id}`, {
          method: "DELETE",
        });
        if (res.ok) {
          toast.success("Role berhasil dihapus");
          fetchData(true);
        } else {
          toast.error("Gagal menghapus role");
        }
      } catch {
        toast.error("Terjadi kesalahan sistem");
      }
    }
  };

  // Handle Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error("Nama Role wajib diisi");
      return;
    }

    setIsSubmitting(true);
    try {
      const url = isEditing ? `http://localhost:3000/api/roles/${currentId}` : "http://localhost:3000/api/roles";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success(isEditing ? "Role diperbarui" : "Role dibuat");
        setOpen(false);
        fetchData(true);
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
          <h1 className="text-3xl font-bold tracking-tight">Role Management</h1>
          <p className="text-muted-foreground mt-2">Kelola hak akses dan peran pengguna aplikasi.</p>
        </div>
        <Button onClick={handleAdd} className="cursor-pointer transition-all hover:bg-primary/90 active:scale-95">
          <IconPlus className="mr-2 h-4 w-4" />
          Tambah Role
        </Button>
      </div>

      {/* Modal Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Role" : "Tambah Role Baru"}</DialogTitle>
            <DialogDescription>Definisikan peran baru dalam sistem.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Nama Role</Label>
                <Input placeholder="Contoh: Admin, Dokter, HR" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Deskripsi</Label>
                <Textarea placeholder="Deskripsi singkat role ini..." value={formData.description} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })} />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting} className="cursor-pointer transition-all hover:bg-primary/90 active:scale-95">
                {isSubmitting ? "Menyimpan..." : isEditing ? "Update Role" : "Simpan Role"}
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
              <TableHead>Nama Role</TableHead>
              <TableHead>Deskripsi</TableHead>
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
                  Belum ada role.
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center gap-2 font-medium">
                      {getRoleIcon(item.name)}
                      {item.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{item.description || "-"}</TableCell>
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

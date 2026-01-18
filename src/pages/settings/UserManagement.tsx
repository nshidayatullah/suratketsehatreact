import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IconPencil, IconPlus, IconTrash, IconUser } from "@tabler/icons-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { getRoleIcon } from "@/lib/role-utils";

interface Role {
  id: number;
  name: string;
}

interface User {
  id: number;
  name: string | null;
  nrp: string;
  roleId: number;
  role: Role;
}

export default function UserManagement() {
  const [data, setData] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);

  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    nrp: "",
    password: "", // Only sent if changed
    roleId: "",
  });

  // Fetch Data
  const fetchData = async (retry = false) => {
    try {
      if (!retry) setLoading(true);
      const [resUsers, resRoles] = await Promise.all([fetch("http://localhost:3000/api/users"), fetch("http://localhost:3000/api/roles")]);

      const dataUsers = await resUsers.json();
      const dataRoles = await resRoles.json();

      if (Array.isArray(dataUsers)) setData(dataUsers);
      if (Array.isArray(dataRoles)) setRoles(dataRoles);
    } catch (error) {
      console.error("Error fetching data:", error);
      if (!retry) toast.error("Gagal mengambil data user");
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
      name: "",
      nrp: "",
      password: "",
      roleId: "",
    });
    setOpen(true);
  };

  // Handle Edit
  const handleEdit = (item: User) => {
    setIsEditing(true);
    setCurrentId(item.id);
    setFormData({
      name: item.name || "",
      nrp: item.nrp,
      password: "", // Leave blank to keep current
      roleId: item.roleId.toString(),
    });
    setOpen(true);
  };

  // Handle Delete
  const handleDelete = async (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus user ini?")) {
      try {
        const res = await fetch(`http://localhost:3000/api/users/${id}`, {
          method: "DELETE",
        });
        if (res.ok) {
          toast.success("User berhasil dihapus");
          fetchData(true);
        } else {
          toast.error("Gagal menghapus user");
        }
      } catch {
        toast.error("Terjadi kesalahan sistem");
      }
    }
  };

  // Handle Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nrp || !formData.roleId) {
      toast.error("NRP dan Role wajib diisi");
      return;
    }
    if (!isEditing && !formData.password) {
      toast.error("Password wajib untuk user baru");
      return;
    }

    setIsSubmitting(true);
    try {
      const url = isEditing ? `http://localhost:3000/api/users/${currentId}` : "http://localhost:3000/api/users";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success(isEditing ? "User diperbarui" : "User dibuat");
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
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground mt-2">Kelola pengguna yang dapat mengakses aplikasi.</p>
        </div>
        <Button onClick={handleAdd} className="cursor-pointer transition-all hover:bg-primary/90 active:scale-95">
          <IconPlus className="mr-2 h-4 w-4" />
          Tambah User
        </Button>
      </div>

      {/* Modal Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit User" : "Tambah User Baru"}</DialogTitle>
            <DialogDescription>Isi detail pengguna baru.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Nama Lengkap</Label>
                <Input placeholder="Nama User" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>NRP (Login ID)</Label>
                <Input placeholder="Contoh: 12345678" value={formData.nrp} onChange={(e) => setFormData({ ...formData, nrp: e.target.value })} />
              </div>

              <div className="space-y-2">
                <Label>Role</Label>
                <div className="flex gap-2">
                  <Select value={formData.roleId} onValueChange={(val) => setFormData({ ...formData, roleId: val })}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih Role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((r) => (
                        <SelectItem key={r.id} value={r.id.toString()}>
                          {r.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button type="button" variant="outline" size="icon" className="shrink-0" onClick={() => window.open("/settings/roles", "_blank")} title="Manage Roles">
                    <IconPlus className="size-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Password {isEditing && "(Kosongkan jika tidak ubah)"}</Label>
                <Input type="password" placeholder={isEditing ? "********" : "Password Baru"} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting} className="cursor-pointer transition-all hover:bg-primary/90 active:scale-95">
                {isSubmitting ? "Menyimpan..." : isEditing ? "Update User" : "Simpan User"}
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
              <TableHead>Nama</TableHead>
              <TableHead>NRP</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-24">
                  Memuat data...
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-24">
                  Belum ada user.
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center gap-2 font-medium">
                      <IconUser className="size-4 text-muted-foreground" />
                      {item.name || "No Name"}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono">{item.nrp}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="gap-1">
                      {getRoleIcon(item.role?.name)}
                      {item.role?.name || "No Role"}
                    </Badge>
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

import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IconPencil, IconPlus, IconTrash, IconUser, IconUsers } from "@tabler/icons-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { getRoleIcon } from "@/lib/role-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

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
  status: string; // ACTIVE, INACTIVE
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
    status: "ACTIVE",
  });

  // Filter & Pagination State
  const [filters, setFilters] = useState({
    name: "",
    nrp: "",
    role: "all",
    status: "all",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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
      status: "ACTIVE",
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
      status: item.status || "ACTIVE",
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

  const filteredData = data.filter((item) => {
    const matchName = (item.name || "").toLowerCase().includes(filters.name.toLowerCase());
    const matchNrp = item.nrp.toLowerCase().includes(filters.nrp.toLowerCase());
    const matchRole = filters.role === "all" || item.role?.id.toString() === filters.role;
    const matchStatus = filters.status === "all" || item.status === filters.status;
    return matchName && matchNrp && matchRole && matchStatus;
  });

  const totalPages = itemsPerPage === 0 ? 1 : Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = itemsPerPage === 0 ? filteredData : filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-left">
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
                {isSubmitting ? "Menyimpan..." : isEditing ? "Update User" : "Simpan User"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <IconUsers className="h-4 w-4 text-muted-foreground" />
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

      {/* Table */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow className="bg-blue-600 hover:bg-blue-600 [&_th]:text-white">
              <TableHead>Nama</TableHead>
              <TableHead>NRP</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
            <TableRow>
              <TableHead className="p-2">
                <Input placeholder="Filter Nama" value={filters.name} onChange={(e) => setFilters({ ...filters, name: e.target.value })} className="h-8 text-xs" />
              </TableHead>
              <TableHead className="p-2">
                <Input placeholder="Filter NRP" value={filters.nrp} onChange={(e) => setFilters({ ...filters, nrp: e.target.value })} className="h-8 text-xs" />
              </TableHead>
              <TableHead className="p-2">
                <Select value={filters.role} onValueChange={(val) => setFilters({ ...filters, role: val })}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua</SelectItem>
                    {roles.map((r) => (
                      <SelectItem key={r.id} value={r.id.toString()}>
                        {r.name}
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
            ) : filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24">
                  Data tidak ditemukan.
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((item) => (
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
      <div className="flex items-center justify-between mt-4">
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
                <SelectValue placeholder="10" />
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

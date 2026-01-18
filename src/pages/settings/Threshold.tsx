import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IconPencil, IconActivity, IconStethoscope, IconThermometer, IconLungs, IconHeartRateMonitor } from "@tabler/icons-react";
import { toast } from "sonner";

interface VitalsThreshold {
  id: number;
  key: string;
  label: string;
  min: number;
  max: number;
  unit: string;
}

// Helper icons
const getIcon = (key: string) => {
  if (key.includes("sistole") || key.includes("diastole")) return <IconStethoscope className="size-4 text-blue-500" />;
  if (key.includes("nadi")) return <IconHeartRateMonitor className="size-4 text-red-500" />;
  if (key.includes("suhu")) return <IconThermometer className="size-4 text-orange-500" />;
  if (key.includes("rr")) return <IconLungs className="size-4 text-green-500" />;
  return <IconActivity className="size-4" />;
};

export default function Threshold() {
  const [data, setData] = useState<VitalsThreshold[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    label: "",
    min: 0,
    max: 0,
    unit: "",
  });

  // Fetch Data
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:3000/api/thresholds");
      const result = await res.json();
      if (Array.isArray(result)) setData(result);
    } catch (error) {
      console.error("Error fetching thresholds:", error);
      toast.error("Gagal mengambil data threshold");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle Edit
  const handleEdit = (item: VitalsThreshold) => {
    setCurrentId(item.id);
    setFormData({
      label: item.label,
      min: item.min,
      max: item.max,
      unit: item.unit,
    });
    setOpen(true);
  };

  // Handle Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (formData.min > formData.max) {
      toast.error("Nilai minimum tidak boleh lebih besar dari maksimum");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`http://localhost:3000/api/thresholds/${currentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ min: formData.min, max: formData.max }),
      });

      if (res.ok) {
        toast.success("Pengaturan diperbarui");
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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Threshold Settings</h1>
        <p className="text-muted-foreground mt-2">Atur ambang batas normal untuk tanda-tanda vital.</p>
      </div>

      {/* Modal Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Threshold: {formData.label}</DialogTitle>
            <DialogDescription>Tentukan batas aman minimum dan maksimum.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label>Minimum ({formData.unit})</Label>
                <Input type="number" step="0.1" value={formData.min} onChange={(e) => setFormData({ ...formData, min: parseFloat(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label>Maksimum ({formData.unit})</Label>
                <Input type="number" step="0.1" value={formData.max} onChange={(e) => setFormData({ ...formData, max: parseFloat(e.target.value) })} />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting} className="cursor-pointer transition-all hover:bg-primary/90 active:scale-95">
                {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
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
              <TableHead>Parameter</TableHead>
              <TableHead>Minimum</TableHead>
              <TableHead>Maksimum</TableHead>
              <TableHead>Satuan</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24">
                  Memuat data...
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24">
                  Data kosong.
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center gap-2 font-medium">
                      {getIcon(item.key)}
                      {item.label}
                    </div>
                  </TableCell>
                  <TableCell>{item.min}</TableCell>
                  <TableCell>{item.max}</TableCell>
                  <TableCell className="text-muted-foreground">{item.unit}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(item)} className="cursor-pointer hover:bg-muted active:scale-95 transition-all">
                      <IconPencil className="size-4 mr-1" /> Edit
                    </Button>
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

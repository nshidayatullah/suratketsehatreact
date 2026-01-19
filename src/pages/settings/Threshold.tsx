import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IconPencil, IconActivity, IconThermometer, IconLungs, IconWind, IconHeartbeat } from "@tabler/icons-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface VitalsThreshold {
  id: number;
  key: string;
  label: string;
  min: number;
  max: number;
  unit: string;
}

// Helper icons
// Helper icons
const getIcon = (key: string) => {
  if (key.includes("sistole")) return <IconHeartbeat className="size-20 text-red-600 transition-transform duration-300 group-hover:animate-bounce" />;
  if (key.includes("diastole")) return <IconHeartbeat className="size-20 text-blue-600 transition-transform duration-300 group-hover:animate-bounce" />;
  if (key.includes("nadi")) return <IconActivity className="size-20 text-red-500 transition-transform duration-300 group-hover:animate-bounce" />;
  if (key.includes("suhu")) return <IconThermometer className="size-20 text-orange-500 transition-transform duration-300 group-hover:animate-bounce" />;
  if (key.includes("rr")) return <IconWind className="size-20 text-blue-500 transition-transform duration-300 group-hover:animate-bounce" />;
  if (key.includes("spo2")) return <IconLungs className="size-20 text-cyan-500 transition-transform duration-300 group-hover:animate-bounce" />;
  return <IconActivity className="size-20 text-gray-500 transition-transform duration-300 group-hover:animate-bounce" />;
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

      {/* Card Grid */}
      {loading ? (
        <div className="text-center py-10 text-muted-foreground">Memuat data...</div>
      ) : data.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">Tidak ada data threshold.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {data.map((item) => (
            <Card key={item.id} className="group hover:shadow-md transition-all cursor-pointer border-l-4 border-l-primary flex flex-col justify-between h-full" onClick={() => handleEdit(item)}>
              <CardHeader className="pb-2 text-center">
                <CardTitle className="text-sm font-medium line-clamp-2 min-h-10 flex items-center justify-center leading-tight" title={item.label}>
                  {item.label}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 grow flex flex-col items-center justify-between gap-4 p-4">
                <div className="flex flex-col items-center justify-center gap-3 grow w-full">
                  <div className="flex items-center justify-center py-2">{getIcon(item.key)}</div>
                  <div className="text-center">
                    <div className="text-2xl font-bold tracking-tight">
                      {item.min} - {item.max}
                    </div>
                    <p className="text-xs text-muted-foreground font-semibold mt-1">{item.unit}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full h-8 text-xs font-medium"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(item);
                  }}
                >
                  <IconPencil className="size-3.5 mr-1.5" /> Ubah Batas
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

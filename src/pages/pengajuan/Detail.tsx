import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { IconArrowLeft, IconPencil, IconDeviceFloppy, IconX, IconTrash, IconUser, IconFilter } from "@tabler/icons-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

// Interfaces
// Interfaces
interface PemeriksaanFisikData {
  id: number;
  karyawanId?: number;
  nama: string;
  td?: string;
  nadi?: string;
  rr?: string;
  sao2?: string;
  suhu?: string;
  keluhan?: string;
  rekomendasi?: string;
}

interface MasterData {
  id: number;
  nama: string;
  perusahaan?: MasterData;
}
interface Karyawan extends MasterData {
  nrp: string;
  jabatanId?: number;
  departemenId?: number;
  jabatan?: MasterData;
  departemen?: MasterData & { perusahaan?: MasterData };
}

// Interface for Table Row Data
interface AnggotaTim {
  id: number; // FE only temporary id
  karyawanId?: string; // If selected from list
  nama: string; // If from list, use name, or manual input
  td: string;
  nadi: string;
  rr: string;
  sao2: string;
  suhu: string;
  keluhan: string;
  rekomendasi: "Ya" | "Tidak" | "";
}

interface PengajuanDetailData {
  id: number;
  status: string;
  tanggal: string;
  waktu: string;
  nomorIzinKerja: string;
  lokasiKerja: string;
  judulPekerjaan: string;
  keterangan: string;
  pemegangIjin: Karyawan;
  jabatan: MasterData;
  departemen: MasterData;
  perusahaan: MasterData;
  jenisPekerjaan: MasterData;
  petugasPemeriksa?: MasterData;
  pengawasPekerjaan?: MasterData;
  pemeriksaanFisik?: PemeriksaanFisikData[];
  // Raw IDs for editing
  pemegangIjinId: number;
  jabatanId: number;
  departemenId: number;
  perusahaanId: number;
  jenisPekerjaanId: number;
  petugasPemeriksaId?: number;
  pengawasPekerjaanId?: number;
}

interface VitalsThreshold {
  id: number;
  key: string;
  label: string;
  min: number;
  max: number;
  unit: string;
}

export default function PengajuanDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Search State for Employee List
  const [filters, setFilters] = useState({
    nama: "",
    jabatan: "",
    departemen: "",
    perusahaan: "",
  });

  // Data States
  const [data, setData] = useState<PengajuanDetailData | null>(null);
  const [karyawanList, setKaryawanList] = useState<Karyawan[]>([]);
  const [deptList, setDeptList] = useState<MasterData[]>([]);
  const [jabatanList, setJabatanList] = useState<MasterData[]>([]);
  const [perusahaanList, setPerusahaanList] = useState<MasterData[]>([]);
  const [jenisPekerjaanList, setJenisPekerjaanList] = useState<MasterData[]>([]);
  const [thresholds, setThresholds] = useState<VitalsThreshold[]>([]);

  // Form State
  const [formData, setFormData] = useState({
    tanggal: "",
    waktu: "",
    lokasiKerja: "",
    departemenId: "",
    judulPekerjaan: "",
    nomorIzinKerja: "",
    pemegangIjinId: "",
    jabatanId: "",
    perusahaanId: "",
    jenisPekerjaanId: "",
    keterangan: "",
    petugasPemeriksaId: "",
    pengawasPekerjaanId: "",
    status: "Diajukan",
  });

  // Table State
  const [anggotaTim, setAnggotaTim] = useState<AnggotaTim[]>([]);

  // Filter Karyawan List
  const filteredKaryawan = useMemo(() => {
    return karyawanList.filter(
      (k) =>
        (filters.nama === "" || k.nama.toLowerCase().includes(filters.nama.toLowerCase())) &&
        (filters.jabatan === "" || k.jabatan?.nama.toLowerCase().includes(filters.jabatan.toLowerCase())) &&
        (filters.departemen === "" || k.departemen?.nama.toLowerCase().includes(filters.departemen.toLowerCase())) &&
        (filters.perusahaan === "" || k.departemen?.perusahaan?.nama.toLowerCase().includes(filters.perusahaan.toLowerCase())),
    );
  }, [karyawanList, filters]);

  // Fetch Data

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch Master Data in parallel
      const [resPengajuan, resKaryawan, resDept, resJab, resPerusahaan, resJenis, resThresholds] = await Promise.all([
        fetch(`http://localhost:3000/api/pengajuan/${id}`),
        fetch("http://localhost:3000/api/karyawan"),
        fetch("http://localhost:3000/api/departemen"),
        fetch("http://localhost:3000/api/jabatan"),
        fetch("http://localhost:3000/api/perusahaan"),
        fetch("http://localhost:3000/api/jenis-pekerjaan"),
        fetch("http://localhost:3000/api/thresholds"),
      ]);

      if (!resPengajuan.ok) throw new Error("Pengajuan not found");

      const [dPengajuan, dKaryawan, dDept, dJab, dPerusahaan, dJenis, dThresholds] = await Promise.all([resPengajuan.json(), resKaryawan.json(), resDept.json(), resJab.json(), resPerusahaan.json(), resJenis.json(), resThresholds.json()]);

      // Set Master Data
      setKaryawanList(dKaryawan);
      setDeptList(dDept);
      setJabatanList(dJab);
      setPerusahaanList(dPerusahaan);
      setJenisPekerjaanList(dJenis);
      if (Array.isArray(dThresholds)) setThresholds(dThresholds);

      // Set Main Data
      setData(dPengajuan);

      // Initialize Form
      setFormData({
        tanggal: new Date(dPengajuan.tanggal).toISOString().split("T")[0],
        waktu: dPengajuan.waktu || "",
        lokasiKerja: dPengajuan.lokasiKerja || "",
        departemenId: dPengajuan.departemenId?.toString() || "",
        judulPekerjaan: dPengajuan.judulPekerjaan || "",
        nomorIzinKerja: dPengajuan.nomorIzinKerja || "",
        pemegangIjinId: dPengajuan.pemegangIjinId?.toString() || "",
        jabatanId: dPengajuan.jabatanId?.toString() || "",
        perusahaanId: dPengajuan.perusahaanId?.toString() || "",
        jenisPekerjaanId: dPengajuan.jenisPekerjaanId?.toString() || "",
        keterangan: dPengajuan.keterangan || "",
        petugasPemeriksaId: dPengajuan.petugasPemeriksaId?.toString() || "",
        pengawasPekerjaanId: dPengajuan.pengawasPekerjaanId?.toString() || "",
        status: dPengajuan.status || "Diajukan",
      });

      if (dPengajuan.pemeriksaanFisik && dPengajuan.pemeriksaanFisik.length > 0) {
        setAnggotaTim(
          dPengajuan.pemeriksaanFisik.map((p: PemeriksaanFisikData) => ({
            id: p.id,
            karyawanId: p.karyawanId ? p.karyawanId.toString() : "",
            nama: p.nama,
            td: p.td || "",
            nadi: p.nadi || "",
            rr: p.rr || "",
            sao2: p.sao2 || "",
            suhu: p.suhu || "",
            keluhan: p.keluhan || "",
            rekomendasi: (p.rekomendasi as "Ya" | "Tidak" | "") || "",
          })),
        );
      } else {
        // Initialize Table Row 1 (Pemegang Izin)
        setAnggotaTim([{ id: 1, karyawanId: dPengajuan.pemegangIjinId?.toString() || "", nama: dPengajuan.pemegangIjin?.nama || "", td: "", nadi: "", rr: "", sao2: "", suhu: "", keluhan: "", rekomendasi: "Ya" }]);
      }
    } catch (err) {
      console.error(err);
      toast.error("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Helper to convert number to word
  const numberToWord = (n: number) => {
    const words = ["nol", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan", "sepuluh", "sebelas"];
    if (n < 12) return words[n];
    return n.toString();
  };

  // Threshold Check Logic
  useEffect(() => {
    if (!thresholds.length || !isEditing) return;

    let fitCount = 0;

    anggotaTim.forEach((row) => {
      let isFit = true;

      const check = (val: number, key: string) => {
        const t = thresholds.find((t) => t.key === key);
        if (!t) return true;
        return val >= t.min && val <= t.max;
      };

      if (row.td && row.td.includes("/")) {
        const [sys, dia] = row.td.split("/").map((s) => parseFloat(s));
        if (isNaN(sys) || !check(sys, "sistole")) isFit = false;
        if (isNaN(dia) || !check(dia, "diastole")) isFit = false;
      } else if (!row.td) {
        isFit = false;
      }

      if (!row.nadi || !check(parseFloat(row.nadi), "nadi")) isFit = false;
      if (!row.rr || !check(parseFloat(row.rr), "rr")) isFit = false;
      if (!row.sao2 || !check(parseFloat(row.sao2), "sao2")) isFit = false;
      if (!row.suhu || !check(parseFloat(row.suhu), "suhu")) isFit = false;

      if (isFit) fitCount++;
    });

    if (fitCount > 0) {
      const text = `Fit bekerja ${numberToWord(fitCount)} (${fitCount}) karyawan`;
      setFormData((prev) => ({ ...prev, keterangan: text }));
    }
  }, [anggotaTim, thresholds, isEditing]);

  // Form Handlers
  const handlePemegangIzinChange = (val: string) => {
    const kId = parseInt(val);
    const selected = karyawanList.find((k) => k.id === kId);

    if (selected) {
      setFormData((prev) => ({
        ...prev,
        pemegangIjinId: val,
        jabatanId: selected.jabatanId ? selected.jabatanId.toString() : prev.jabatanId,
        perusahaanId: selected.departemen?.perusahaan?.id ? selected.departemen.perusahaan.id.toString() : prev.perusahaanId,
      }));
      setAnggotaTim((prev) => prev.map((row, idx) => (idx === 0 ? { ...row, karyawanId: val, nama: selected.nama } : row)));
    } else {
      setFormData((prev) => ({ ...prev, pemegangIjinId: val }));
    }
  };

  const handleKaryawanSelect = (karyawan: Karyawan, checked: boolean) => {
    if (!isEditing) return;

    const kId = karyawan.id.toString();

    if (kId === formData.pemegangIjinId) {
      toast.info("Karyawan ini adalah Pemegang Izin (sudah otomatis terdaftar).");
      return;
    }

    if (checked) {
      // Add
      setAnggotaTim((prev) => [
        ...prev,
        {
          id: Date.now(),
          karyawanId: kId,
          nama: karyawan.nama,
          td: "",
          nadi: "",
          rr: "",
          sao2: "",
          suhu: "",
          keluhan: "",
          rekomendasi: "Ya",
        },
      ]);
      toast.success(`${karyawan.nama} ditambahkan.`);
    } else {
      // Remove
      setAnggotaTim((prev) => prev.filter((r) => r.karyawanId !== kId));
      toast.info(`${karyawan.nama} dihapus.`);
    }
  };

  const handleTableChange = (id: number, field: keyof AnggotaTim, value: string) => {
    setAnggotaTim((prev) => prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  };

  const removeRow = (id: number) => {
    const row = anggotaTim.find((r) => r.id === id);
    if (row && row.karyawanId === formData.pemegangIjinId) {
      toast.warning("Pemegang Izin tidak dapat dihapus dari daftar.");
      return;
    }
    setAnggotaTim((prev) => prev.filter((r) => r.id !== id));
    toast.info("Karyawan dihapus dari daftar.");
  };

  const handleSave = async () => {
    setSubmitting(true);
    try {
      const payload = { ...formData, anggotaTim };
      const res = await fetch(`http://localhost:3000/api/pengajuan/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        await res.json();
        toast.success("Data berhasil diperbarui");
        setIsEditing(false);
        fetchData();
      } else {
        const err = await res.json();
        toast.error("Gagal: " + err.error);
      }
    } catch {
      toast.error("Terjadi kesalahan sistem");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">Memuat data...</div>;
  if (!data) return <div className="p-8 text-center text-destructive">Data tidak ditemukan.</div>;

  const renderInput = (value: string | undefined, onChange: (val: string) => void, type: "text" | "date" | "time" = "text", options?: { label: string; value: string }[], disabled?: boolean) => {
    if (!isEditing) return <span className="font-semibold">{options ? options.find((o) => o.value === value)?.label || "-" : value || "-"}</span>;
    if (options) {
      return (
        <Select value={value} onValueChange={onChange} disabled={disabled}>
          <SelectTrigger className="h-8">
            <SelectValue placeholder="Pilih..." />
          </SelectTrigger>
          <SelectContent>
            {options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }
    return <Input value={value} onChange={(e) => onChange(e.target.value)} type={type} className="h-8" disabled={disabled} />;
  };

  const FieldRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="grid grid-cols-[140px_1fr] border-b last:border-0 border-border/50 items-center">
      <div className="font-medium text-sm p-3 bg-muted/30 border-r border-border/50 h-full flex items-center">{label}</div>
      <div className="text-sm p-2">{children}</div>
    </div>
  );

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      {/* Actions Header */}
      <div className="flex items-center justify-between p-4 border-b bg-card shadow-sm z-10 shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="cursor-pointer">
            <IconArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              Detail Pengajuan
              {isEditing && (
                <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                  Edit Mode
                </Badge>
              )}
            </h1>
          </div>
        </div>
        <div className="flex gap-2">
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} className="cursor-pointer">
              <IconPencil className="mr-2 size-4" /> Edit Data
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)} disabled={submitting}>
                <IconX className="mr-2 size-4" /> Batal
              </Button>
              <Button onClick={handleSave} disabled={submitting}>
                <IconDeviceFloppy className="mr-2 size-4" /> Simpan Perubahan
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* LEFT PANEL: KARYAWAN LIST (Visible only in Edit Mode) */}
        <div className={`w-[600px] border-r flex flex-col bg-muted/10 transition-all duration-300 ${!isEditing ? "w-0 opacity-0 border-0 overflow-hidden" : ""}`}>
          <div className="p-4 border-b bg-muted/20 flex justify-between items-center">
            <h3 className="font-semibold flex items-center gap-2">
              <IconUser className="size-4" /> Pilih Karyawan
            </h3>
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <IconFilter className="size-3" /> Filter aktif
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            <Table>
              <TableHeader className="bg-muted/40 sticky top-0 z-10">
                <TableRow>
                  <TableHead className="w-[40px] align-top py-2"></TableHead>
                  <TableHead className="align-top py-2">
                    <div className="mb-2">Nama</div>
                    <Input placeholder="Cari..." className="h-7 text-xs bg-background" value={filters.nama} onChange={(e) => setFilters((prev) => ({ ...prev, nama: e.target.value }))} />
                  </TableHead>
                  <TableHead className="align-top py-2">
                    <div className="mb-2">Jabatan</div>
                    <Input placeholder="Cari..." className="h-7 text-xs bg-background" value={filters.jabatan} onChange={(e) => setFilters((prev) => ({ ...prev, jabatan: e.target.value }))} />
                  </TableHead>
                  <TableHead className="align-top py-2">
                    <div className="mb-2">Departemen</div>
                    <Input placeholder="Cari..." className="h-7 text-xs bg-background" value={filters.departemen} onChange={(e) => setFilters((prev) => ({ ...prev, departemen: e.target.value }))} />
                  </TableHead>
                  <TableHead className="align-top py-2">
                    <div className="mb-2">Perusahaan</div>
                    <Input placeholder="Cari..." className="h-7 text-xs bg-background" value={filters.perusahaan} onChange={(e) => setFilters((prev) => ({ ...prev, perusahaan: e.target.value }))} />
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredKaryawan.map((k) => {
                  const isChecked = anggotaTim.some((a) => a.karyawanId === k.id.toString());
                  const isPemegangIzin = k.id.toString() === formData.pemegangIjinId;

                  return (
                    <TableRow key={k.id} className={isChecked ? "bg-muted/20" : ""}>
                      <TableCell>
                        <Checkbox checked={isChecked} disabled={isPemegangIzin} onCheckedChange={(c) => handleKaryawanSelect(k, c as boolean)} />
                      </TableCell>
                      <TableCell className="font-medium">{k.nama}</TableCell>
                      <TableCell className="text-muted-foreground text-xs">{k.jabatan?.nama}</TableCell>
                      <TableCell className="text-muted-foreground text-xs">{k.departemen?.nama}</TableCell>
                      <TableCell className="text-muted-foreground text-xs">{k.departemen?.perusahaan?.nama}</TableCell>
                    </TableRow>
                  );
                })}
                {filteredKaryawan.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                      Tidak ditemukan.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* RIGHT PANEL: FORM DETAIL */}
        <div className="flex-1 overflow-y-auto bg-muted/10 p-4 md:p-8">
          {/* Status Wizard */}
          <div className="flex items-center justify-center w-full max-w-3xl mx-auto mb-8 mt-2">
            {["Diajukan", "Diperiksa", "Selesai"].map((step, i) => {
              const steps = ["Diajukan", "Diperiksa", "Selesai"];
              const currentStep = steps.indexOf(formData.status);
              const isActive = i <= currentStep;
              return (
                <div key={step} className="flex items-center">
                  <div className="flex flex-col items-center relative z-10">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 text-sm font-bold transition-colors ${isActive ? "bg-primary border-primary text-primary-foreground" : "bg-muted border-muted-foreground text-muted-foreground"}`}
                    >
                      {i + 1}
                    </div>
                    <span className={`text-xs mt-2 font-medium ${isActive ? "text-primary" : "text-muted-foreground"}`}>{step}</span>
                  </div>
                  {i < steps.length - 1 && <div className={`h-[2px] w-24 mx-2 transition-colors ${i < currentStep ? "bg-primary" : "bg-muted"}`} />}
                </div>
              );
            })}
          </div>

          <Card className="rounded-none shadow-sm border max-w-5xl mx-auto bg-card text-card-foreground min-h-[900px]">
            {/* HEADER */}
            <div className="bg-muted/40 p-4 text-center border-b">
              <h2 className="text-lg font-bold uppercase tracking-wide">Pemeriksaan Kesehatan Pra Kerja Pekerjaan Kritis</h2>
              <p className="text-xs text-muted-foreground italic">Formulir ini digunakan sebagai bukti pemeriksaan pra kerja pada karyawan yang akan melakukan pekerjaan kritis</p>
            </div>

            {/* SECTION I: UMUM */}
            <div className="bg-muted/80 px-4 py-2 border-b font-bold text-sm">I. Umum</div>
            <div className="grid grid-cols-1 md:grid-cols-2 border-b">
              {/* Left Column */}
              <div className="border-r border-border/50">
                <FieldRow label="Tanggal">{renderInput(formData.tanggal, (v) => setFormData({ ...formData, tanggal: v }), "date")}</FieldRow>
                <FieldRow label="Waktu">{renderInput(formData.waktu, (v) => setFormData({ ...formData, waktu: v }), "time")}</FieldRow>
                <FieldRow label="Lokasi Kerja">{renderInput(formData.lokasiKerja, (v) => setFormData({ ...formData, lokasiKerja: v }))}</FieldRow>
                <FieldRow label="Departemen">
                  {renderInput(
                    formData.departemenId,
                    (v) => setFormData({ ...formData, departemenId: v }),
                    "text",
                    deptList.map((d) => ({ label: d.nama, value: d.id.toString() })),
                  )}
                </FieldRow>
                <FieldRow label="Judul Pekerjaan">{renderInput(formData.judulPekerjaan, (v) => setFormData({ ...formData, judulPekerjaan: v }))}</FieldRow>
              </div>
              {/* Right Column */}
              <div>
                <FieldRow label="Nomor Izin Kerja">{renderInput(formData.nomorIzinKerja, (v) => setFormData({ ...formData, nomorIzinKerja: v }))}</FieldRow>
                <FieldRow label="Pemegang Izin">
                  {renderInput(
                    formData.pemegangIjinId,
                    handlePemegangIzinChange,
                    "text",
                    karyawanList.map((k) => ({ label: `${k.nama} - ${k.nrp}`, value: k.id.toString() })),
                  )}
                </FieldRow>
                <FieldRow label="Jabatan">
                  {renderInput(
                    formData.jabatanId,
                    (v) => setFormData({ ...formData, jabatanId: v }),
                    "text",
                    jabatanList.map((j) => ({ label: j.nama, value: j.id.toString() })),
                    !!formData.pemegangIjinId,
                  )}
                </FieldRow>
                <FieldRow label="Perusahaan">
                  {renderInput(
                    formData.perusahaanId,
                    (v) => setFormData({ ...formData, perusahaanId: v }),
                    "text",
                    perusahaanList.map((p) => ({ label: p.nama, value: p.id.toString() })),
                    !!formData.pemegangIjinId,
                  )}
                </FieldRow>
              </div>
            </div>

            {/* Jenis Pekerjaan */}
            <div className="grid grid-cols-[140px_1fr] border-b">
              <div className="font-medium text-sm p-4 bg-muted/30 border-r border-border/50 flex items-center">Jenis Pekerjaan</div>
              <div className="p-4 flex items-center">
                {isEditing ? (
                  <Select value={formData.jenisPekerjaanId} onValueChange={(v) => setFormData({ ...formData, jenisPekerjaanId: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Jenis Pekerjaan" />
                    </SelectTrigger>
                    <SelectContent>
                      {jenisPekerjaanList.map((j) => (
                        <SelectItem key={j.id} value={j.id.toString()}>
                          {j.nama}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <span className="font-semibold">{data.jenisPekerjaan?.nama || "-"}</span>
                )}
              </div>
            </div>

            {/* SECTION II: HASIL PEMERIKSAAN (DYNAMIC TABLE) */}
            <div className="bg-muted/60 px-4 py-2 border-b font-bold text-sm border-t flex justify-between items-center">
              <span>II. Hasil Pemeriksaan Pekerja</span>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="w-[50px] text-center border-r h-10">No</TableHead>
                    <TableHead className="min-w-[200px] border-r h-10">Nama</TableHead>
                    <TableHead className="min-w-[80px] text-center border-r h-10">
                      TD <span className="text-[10px] font-normal block">(mmHg)</span>
                    </TableHead>
                    <TableHead className="min-w-[70px] text-center border-r h-10">
                      Nadi <span className="text-[10px] font-normal block">(bpm)</span>
                    </TableHead>
                    <TableHead className="min-w-[60px] text-center border-r h-10">RR</TableHead>
                    <TableHead className="min-w-[60px] text-center border-r h-10">
                      SaO2 <span className="text-[10px] font-normal block">(%)</span>
                    </TableHead>
                    <TableHead className="min-w-[60px] text-center border-r h-10">
                      Suhu <span className="text-[10px] font-normal block">(°C)</span>
                    </TableHead>
                    <TableHead className="min-w-[150px] border-r h-10">Keluhan</TableHead>
                    <TableHead className="min-w-[100px] text-center h-10">Rekomendasi )*</TableHead>
                    {isEditing && <TableHead className="w-[50px] text-center border-l h-10"></TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {anggotaTim
                    .slice()
                    .sort((a, b) => a.nama.localeCompare(b.nama))
                    .map((row, index) => (
                      <TableRow key={row.id} className="border-b">
                        <TableCell className="text-center border-r py-2">{index + 1}</TableCell>
                        <TableCell className="border-r py-2 font-medium">
                          <div className="px-2">{row.nama || "-"}</div>
                        </TableCell>
                        <TableCell className="border-r p-1">
                          {isEditing ? <Input className="h-8 border-0 shadow-none bg-transparent" value={row.td} onChange={(e) => handleTableChange(row.id, "td", e.target.value)} /> : <div className="text-center">{row.td}</div>}
                        </TableCell>
                        <TableCell className="border-r p-1">
                          {isEditing ? <Input className="h-8 border-0 shadow-none bg-transparent" value={row.nadi} onChange={(e) => handleTableChange(row.id, "nadi", e.target.value)} /> : <div className="text-center">{row.nadi}</div>}
                        </TableCell>
                        <TableCell className="border-r p-1">
                          {isEditing ? <Input className="h-8 border-0 shadow-none bg-transparent" value={row.rr} onChange={(e) => handleTableChange(row.id, "rr", e.target.value)} /> : <div className="text-center">{row.rr}</div>}
                        </TableCell>
                        <TableCell className="border-r p-1">
                          {isEditing ? <Input className="h-8 border-0 shadow-none bg-transparent" value={row.sao2} onChange={(e) => handleTableChange(row.id, "sao2", e.target.value)} /> : <div className="text-center">{row.sao2}</div>}
                        </TableCell>
                        <TableCell className="border-r p-1">
                          {isEditing ? <Input className="h-8 border-0 shadow-none bg-transparent" value={row.suhu} onChange={(e) => handleTableChange(row.id, "suhu", e.target.value)} /> : <div className="text-center">{row.suhu}</div>}
                        </TableCell>
                        <TableCell className="border-r p-1">
                          {isEditing ? <Input className="h-8 border-0 shadow-none bg-transparent" value={row.keluhan} onChange={(e) => handleTableChange(row.id, "keluhan", e.target.value)} /> : <div className="px-2">{row.keluhan}</div>}
                        </TableCell>
                        <TableCell className="p-1 text-center">
                          {isEditing ? (
                            <Select value={row.rekomendasi || ""} onValueChange={(v) => handleTableChange(row.id, "rekomendasi", v)}>
                              <SelectTrigger className="h-8 border-0 shadow-none bg-transparent justify-center">
                                <SelectValue placeholder="-" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Ya">✓</SelectItem>
                                <SelectItem value="Tidak">✗</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <div>{row.rekomendasi === "Ya" ? "✓" : row.rekomendasi === "Tidak" ? "✗" : ""}</div>
                          )}
                        </TableCell>
                        {isEditing && (
                          <TableCell className="border-l p-1 text-center">
                            {row.karyawanId !== formData.pemegangIjinId && (
                              <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:bg-destructive/10" onClick={() => removeRow(row.id)}>
                                <IconTrash className="size-3" />
                              </Button>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
              <div className="p-2 text-xs text-muted-foreground italic border-t">)* Tuliskan (✓) jika diizinkan bekerja, atau (X) jika tidak diizinkan bekerja</div>
            </div>

            {/* SECTION III: KETERANGAN */}
            <div className="bg-muted/80 px-4 py-2 border-b font-bold text-sm border-t">III. Keterangan</div>
            <CardContent className="p-0">
              {isEditing ? (
                <Textarea
                  className="border-0 focus-visible:ring-0 min-h-[100px] p-4 resize-y rounded-none"
                  placeholder="Tulis keterangan tambahan..."
                  value={formData.keterangan}
                  onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                />
              ) : (
                <div className="p-4 min-h-[100px] text-sm whitespace-pre-wrap">{data.keterangan || "-"}</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

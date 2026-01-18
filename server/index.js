const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Logging Middleware
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url}`, req.body);
  next();
});

// --- ROUTES ---

// Cek Server
app.get("/", (req, res) => {
  res.json({ message: "Server is running!" });
});

// === MASTER DATA: PERUSAHAAN ===
// Get All
app.get("/api/perusahaan", async (req, res) => {
  try {
    const data = await prisma.perusahaan.findMany({
      include: { departemen: true },
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create
app.post("/api/perusahaan", async (req, res) => {
  try {
    const { kode, nama, alamat } = req.body;
    const newData = await prisma.perusahaan.create({
      data: { kode, nama, alamat },
    });
    res.json(newData);
  } catch (error) {
    console.error("Error creating perusahaan:", error);
    res.status(400).json({ error: error.message });
  }
});

// Update
app.put("/api/perusahaan/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { kode, nama, alamat } = req.body;
    const updatedData = await prisma.perusahaan.update({
      where: { id: parseInt(id) },
      data: { kode, nama, alamat },
    });
    res.json(updatedData);
  } catch (error) {
    console.error("Error updating perusahaan:", error);
    res.status(400).json({ error: error.message });
  }
});

// Delete
app.delete("/api/perusahaan/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.perusahaan.delete({
      where: { id: parseInt(id) },
    });
    res.json({ message: "Data deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// === MASTER DATA: DEPARTEMEN ===
// Get All
app.get("/api/departemen", async (req, res) => {
  try {
    const data = await prisma.departemen.findMany({
      include: { perusahaan: true },
    });
    res.json(data);
  } catch (error) {
    console.error("Error fetching departemen:", error);
    res.status(500).json({ error: error.message });
  }
});

// Create
app.post("/api/departemen", async (req, res) => {
  try {
    const { kode, nama, perusahaanId } = req.body;
    const newData = await prisma.departemen.create({
      data: {
        kode,
        nama,
        perusahaanId: parseInt(perusahaanId),
      },
    });
    res.json(newData);
  } catch (error) {
    console.error("Error creating departemen:", error);
    res.status(400).json({ error: error.message });
  }
});

// Update
app.put("/api/departemen/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { kode, nama, perusahaanId } = req.body;
    const updatedData = await prisma.departemen.update({
      where: { id: parseInt(id) },
      data: {
        kode,
        nama,
        perusahaanId: parseInt(perusahaanId),
      },
    });
    res.json(updatedData);
  } catch (error) {
    console.error("Error updating departemen:", error);
    res.status(400).json({ error: error.message });
  }
});

// Delete
app.delete("/api/departemen/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.departemen.delete({
      where: { id: parseInt(id) },
    });
    res.json({ message: "Data deleted successfully" });
  } catch (error) {
    console.error("Error deleting departemen:", error);
    res.status(400).json({ error: error.message });
  }
});

// === MASTER DATA: JABATAN ===
// Get All
app.get("/api/jabatan", async (req, res) => {
  try {
    const data = await prisma.jabatan.findMany({
      include: {
        departemen: {
          include: { perusahaan: true },
        },
      },
    });
    res.json(data);
  } catch (error) {
    console.error("Error fetching jabatan:", error);
    res.status(500).json({ error: error.message });
  }
});

// Create
app.post("/api/jabatan", async (req, res) => {
  try {
    const { kode, nama, departemenId } = req.body;
    const newData = await prisma.jabatan.create({
      data: {
        kode,
        nama,
        departemenId: parseInt(departemenId),
      },
    });
    res.json(newData);
  } catch (error) {
    console.error("Error creating jabatan:", error);
    res.status(400).json({ error: error.message });
  }
});

// Update
app.put("/api/jabatan/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { kode, nama, departemenId } = req.body;
    const updatedData = await prisma.jabatan.update({
      where: { id: parseInt(id) },
      data: {
        kode,
        nama,
        departemenId: parseInt(departemenId),
      },
    });
    res.json(updatedData);
  } catch (error) {
    console.error("Error updating jabatan:", error);
    res.status(400).json({ error: error.message });
  }
});

// Delete
app.delete("/api/jabatan/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.jabatan.delete({
      where: { id: parseInt(id) },
    });
    res.json({ message: "Data deleted successfully" });
  } catch (error) {
    console.error("Error deleting jabatan:", error);
    res.status(400).json({ error: error.message });
  }
});

// === MASTER DATA: KARYAWAN ===
// Get All with Relations
app.get("/api/karyawan", async (req, res) => {
  try {
    const data = await prisma.karyawan.findMany({
      include: {
        jabatan: true,
        departemen: {
          include: { perusahaan: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });
    res.json(data);
  } catch (error) {
    console.error("Error fetching karyawan:", error);
    res.status(500).json({ error: error.message });
  }
});

// Create
app.post("/api/karyawan", async (req, res) => {
  try {
    const { nrp, nrpBib, nama, telepon, status, departemenId, jabatanId, tanggalLahir, tanggalMasuk, tinggiBadan, beratBadan } = req.body;

    // Convert logic
    const tglLahir = tanggalLahir ? new Date(tanggalLahir) : null;
    const tglMasuk = tanggalMasuk ? new Date(tanggalMasuk) : null;
    const tb = tinggiBadan ? parseFloat(tinggiBadan) : null;
    const bb = beratBadan ? parseFloat(beratBadan) : null;

    const newData = await prisma.karyawan.create({
      data: {
        nrp,
        nrpBib,
        nama,
        telepon,
        status,
        departemenId: parseInt(departemenId),
        jabatanId: parseInt(jabatanId),
        tanggalLahir: tglLahir,
        tanggalMasuk: tglMasuk,
        tinggiBadan: tb,
        beratBadan: bb,
      },
    });
    res.json(newData);
  } catch (error) {
    console.error("Error creating karyawan:", error);
    res.status(400).json({ error: error.message });
  }
});

// Update
app.put("/api/karyawan/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nrp, nrpBib, nama, telepon, status, departemenId, jabatanId, tanggalLahir, tanggalMasuk, tinggiBadan, beratBadan } = req.body;

    const tglLahir = tanggalLahir ? new Date(tanggalLahir) : null;
    const tglMasuk = tanggalMasuk ? new Date(tanggalMasuk) : null;
    const tb = tinggiBadan ? parseFloat(tinggiBadan) : null;
    const bb = beratBadan ? parseFloat(beratBadan) : null;

    const updatedData = await prisma.karyawan.update({
      where: { id: parseInt(id) },
      data: {
        nrp,
        nrpBib,
        nama,
        telepon,
        status,
        departemenId: parseInt(departemenId),
        jabatanId: parseInt(jabatanId),
        tanggalLahir: tglLahir,
        tanggalMasuk: tglMasuk,
        tinggiBadan: tb,
        beratBadan: bb,
      },
    });
    res.json(updatedData);
  } catch (error) {
    console.error("Error updating karyawan:", error);
    res.status(400).json({ error: error.message });
  }
});

// Delete
app.delete("/api/karyawan/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.karyawan.delete({
      where: { id: parseInt(id) },
    });
    res.json({ message: "Data deleted successfully" });
  } catch (error) {
    console.error("Error deleting karyawan:", error);
    res.status(400).json({ error: error.message });
  }
});

// === MASTER: JENIS PEKERJAAN ===
app.get("/api/jenis-pekerjaan", async (req, res) => {
  try {
    const data = await prisma.jenisPekerjaan.findMany();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/jenis-pekerjaan", async (req, res) => {
  try {
    const { kode, nama } = req.body;
    const data = await prisma.jenisPekerjaan.create({
      data: { kode, nama },
    });
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put("/api/jenis-pekerjaan/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { kode, nama } = req.body;
    const data = await prisma.jenisPekerjaan.update({
      where: { id: parseInt(id) },
      data: { kode, nama },
    });
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete("/api/jenis-pekerjaan/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.jenisPekerjaan.delete({
      where: { id: parseInt(id) },
    });
    res.json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// === TRANSAKSI: PENGAJUAN IZIN KERJA ===
app.get("/api/pengajuan", async (req, res) => {
  try {
    const data = await prisma.pengajuan.findMany({
      include: {
        departemen: true,
        jabatan: true,
        perusahaan: true,
        jenisPekerjaan: true,
        pemegangIjin: true,
        petugasPemeriksa: true,
        pengawasPekerjaan: true,
      },
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/pengajuan", async (req, res) => {
  try {
    const { tanggal, waktu, lokasiKerja, departemenId, judulPekerjaan, nomorIzinKerja, pemegangIjinId, jabatanId, perusahaanId, jenisPekerjaanId, keterangan, petugasPemeriksaId, pengawasPekerjaanId } = req.body;

    const newData = await prisma.pengajuan.create({
      data: {
        tanggal: tanggal ? new Date(tanggal) : null,
        waktu,
        lokasiKerja,
        departemenId: parseInt(departemenId),
        judulPekerjaan,
        nomorIzinKerja,
        pemegangIjinId: parseInt(pemegangIjinId),
        jabatanId: parseInt(jabatanId),
        perusahaanId: parseInt(perusahaanId),
        jenisPekerjaanId: parseInt(jenisPekerjaanId),
        keterangan,
        petugasPemeriksaId: petugasPemeriksaId ? parseInt(petugasPemeriksaId) : null,
        pengawasPekerjaanId: pengawasPekerjaanId ? parseInt(pengawasPekerjaanId) : null,
      },
    });
    res.json(newData);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete("/api/pengajuan/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.pengajuan.delete({ where: { id: parseInt(id) } });
    res.json({ message: "Deleted" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// === SETTINGS: ROLE MANAGEMENT ===
app.get("/api/roles", async (req, res) => {
  try {
    const data = await prisma.role.findMany();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/roles", async (req, res) => {
  try {
    const { name, description } = req.body;
    const newData = await prisma.role.create({ data: { name, description } });
    res.json(newData);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
app.put("/api/roles/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const updated = await prisma.role.update({ where: { id: parseInt(id) }, data: { name, description } });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
app.delete("/api/roles/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.role.delete({ where: { id: parseInt(id) } });
    res.json({ message: "Role deleted" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// === SETTINGS: USER MANAGEMENT ===
app.get("/api/users", async (req, res) => {
  try {
    const data = await prisma.user.findMany({ include: { role: true } });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/users", async (req, res) => {
  try {
    const { name, nrp, password, roleId } = req.body;
    const newData = await prisma.user.create({
      data: { name, nrp, password, roleId: parseInt(roleId) },
    });
    res.json(newData);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
app.put("/api/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, nrp, password, roleId } = req.body;
    const data = { name, nrp, roleId: parseInt(roleId) };
    if (password) data.password = password;
    const updated = await prisma.user.update({ where: { id: parseInt(id) }, data });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
app.delete("/api/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.user.delete({ where: { id: parseInt(id) } });
    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// === SETTINGS: VITALS THRESHOLD ===
app.get("/api/thresholds", async (req, res) => {
  try {
    let data = await prisma.vitalsThreshold.findMany();
    if (data.length === 0) {
      // Seed default data
      const defaultThresholds = [
        { key: "sistole", label: "Tekanan Darah (Sistole)", min: 90, max: 120, unit: "mmHg" },
        { key: "diastole", label: "Tekanan Darah (Diastole)", min: 60, max: 80, unit: "mmHg" },
        { key: "nadi", label: "Denyut Nadi", min: 60, max: 100, unit: "bpm" },
        { key: "suhu", label: "Suhu Tubuh", min: 36.1, max: 37.2, unit: "°C" },
        { key: "rr", label: "Laju Pernapasan", min: 12, max: 20, unit: "x/menit" },
        { key: "spo2", label: "Saturasi Oksigen", min: 95, max: 100, unit: "%" },
      ];
      for (const t of defaultThresholds) {
        await prisma.vitalsThreshold.create({ data: t });
      }
      data = await prisma.vitalsThreshold.findMany();
    }
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/thresholds/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { min, max } = req.body;
    const updated = await prisma.vitalsThreshold.update({
      where: { id: parseInt(id) },
      data: { min: parseFloat(min), max: parseFloat(max) },
    });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

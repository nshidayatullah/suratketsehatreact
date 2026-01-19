-- CreateTable
CREATE TABLE "PemeriksaanFisik" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "pengajuanId" INTEGER NOT NULL,
    "karyawanId" INTEGER,
    "nama" TEXT NOT NULL,
    "td" TEXT,
    "nadi" TEXT,
    "rr" TEXT,
    "sao2" TEXT,
    "suhu" TEXT,
    "keluhan" TEXT,
    "rekomendasi" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PemeriksaanFisik_pengajuanId_fkey" FOREIGN KEY ("pengajuanId") REFERENCES "Pengajuan" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PemeriksaanFisik_karyawanId_fkey" FOREIGN KEY ("karyawanId") REFERENCES "Karyawan" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Pengajuan" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tanggal" DATETIME,
    "waktu" TEXT,
    "lokasiKerja" TEXT,
    "departemenId" INTEGER NOT NULL,
    "judulPekerjaan" TEXT NOT NULL,
    "nomorIzinKerja" TEXT,
    "pemegangIjinId" INTEGER NOT NULL,
    "jabatanId" INTEGER NOT NULL,
    "perusahaanId" INTEGER NOT NULL,
    "jenisPekerjaanId" INTEGER NOT NULL,
    "keterangan" TEXT,
    "petugasPemeriksaId" INTEGER,
    "pengawasPekerjaanId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Pengajuan_departemenId_fkey" FOREIGN KEY ("departemenId") REFERENCES "Departemen" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Pengajuan_pemegangIjinId_fkey" FOREIGN KEY ("pemegangIjinId") REFERENCES "Karyawan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Pengajuan_jabatanId_fkey" FOREIGN KEY ("jabatanId") REFERENCES "Jabatan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Pengajuan_perusahaanId_fkey" FOREIGN KEY ("perusahaanId") REFERENCES "Perusahaan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Pengajuan_jenisPekerjaanId_fkey" FOREIGN KEY ("jenisPekerjaanId") REFERENCES "JenisPekerjaan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Pengajuan_petugasPemeriksaId_fkey" FOREIGN KEY ("petugasPemeriksaId") REFERENCES "Karyawan" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Pengajuan_pengawasPekerjaanId_fkey" FOREIGN KEY ("pengawasPekerjaanId") REFERENCES "Karyawan" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Pengajuan" ("createdAt", "departemenId", "id", "jabatanId", "jenisPekerjaanId", "judulPekerjaan", "keterangan", "lokasiKerja", "nomorIzinKerja", "pemegangIjinId", "pengawasPekerjaanId", "perusahaanId", "petugasPemeriksaId", "tanggal", "updatedAt", "waktu") SELECT "createdAt", "departemenId", "id", "jabatanId", "jenisPekerjaanId", "judulPekerjaan", "keterangan", "lokasiKerja", "nomorIzinKerja", "pemegangIjinId", "pengawasPekerjaanId", "perusahaanId", "petugasPemeriksaId", "tanggal", "updatedAt", "waktu" FROM "Pengajuan";
DROP TABLE "Pengajuan";
ALTER TABLE "new_Pengajuan" RENAME TO "Pengajuan";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

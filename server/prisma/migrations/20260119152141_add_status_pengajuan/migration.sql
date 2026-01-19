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
    "status" TEXT NOT NULL DEFAULT 'Diajukan',
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

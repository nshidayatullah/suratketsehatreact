/*
  Warnings:

  - You are about to drop the column `email` on the `Karyawan` table. All the data in the column will be lost.
  - You are about to drop the column `nik` on the `Karyawan` table. All the data in the column will be lost.
  - Added the required column `nrp` to the `Karyawan` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Karyawan" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nrp" TEXT NOT NULL,
    "nrpBib" TEXT,
    "nama" TEXT NOT NULL,
    "telepon" TEXT,
    "tanggalLahir" DATETIME,
    "tanggalMasuk" DATETIME,
    "tinggiBadan" REAL,
    "beratBadan" REAL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "departemenId" INTEGER NOT NULL,
    "jabatanId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Karyawan_departemenId_fkey" FOREIGN KEY ("departemenId") REFERENCES "Departemen" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Karyawan_jabatanId_fkey" FOREIGN KEY ("jabatanId") REFERENCES "Jabatan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Karyawan" ("createdAt", "departemenId", "id", "jabatanId", "nama", "status", "tanggalLahir", "tanggalMasuk", "telepon", "updatedAt") SELECT "createdAt", "departemenId", "id", "jabatanId", "nama", "status", "tanggalLahir", "tanggalMasuk", "telepon", "updatedAt" FROM "Karyawan";
DROP TABLE "Karyawan";
ALTER TABLE "new_Karyawan" RENAME TO "Karyawan";
CREATE UNIQUE INDEX "Karyawan_nrp_key" ON "Karyawan"("nrp");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

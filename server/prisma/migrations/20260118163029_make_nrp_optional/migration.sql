-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Karyawan" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nrp" TEXT,
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
INSERT INTO "new_Karyawan" ("beratBadan", "createdAt", "departemenId", "id", "jabatanId", "nama", "nrp", "nrpBib", "status", "tanggalLahir", "tanggalMasuk", "telepon", "tinggiBadan", "updatedAt") SELECT "beratBadan", "createdAt", "departemenId", "id", "jabatanId", "nama", "nrp", "nrpBib", "status", "tanggalLahir", "tanggalMasuk", "telepon", "tinggiBadan", "updatedAt" FROM "Karyawan";
DROP TABLE "Karyawan";
ALTER TABLE "new_Karyawan" RENAME TO "Karyawan";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Perusahaan" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "kode" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "alamat" TEXT,
    "telepon" TEXT,
    "email" TEXT,
    "website" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Perusahaan" ("alamat", "createdAt", "email", "id", "kode", "nama", "telepon", "updatedAt", "website") SELECT "alamat", "createdAt", "email", "id", "kode", "nama", "telepon", "updatedAt", "website" FROM "Perusahaan";
DROP TABLE "Perusahaan";
ALTER TABLE "new_Perusahaan" RENAME TO "Perusahaan";
CREATE UNIQUE INDEX "Perusahaan_kode_key" ON "Perusahaan"("kode");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

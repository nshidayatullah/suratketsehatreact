-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Departemen" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "kode" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "perusahaanId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Departemen_perusahaanId_fkey" FOREIGN KEY ("perusahaanId") REFERENCES "Perusahaan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Departemen" ("createdAt", "id", "kode", "nama", "perusahaanId", "updatedAt") SELECT "createdAt", "id", "kode", "nama", "perusahaanId", "updatedAt" FROM "Departemen";
DROP TABLE "Departemen";
ALTER TABLE "new_Departemen" RENAME TO "Departemen";
CREATE UNIQUE INDEX "Departemen_kode_key" ON "Departemen"("kode");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

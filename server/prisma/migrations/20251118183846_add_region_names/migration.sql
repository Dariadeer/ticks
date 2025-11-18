/*
  Warnings:

  - The primary key for the `Location` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `locationName` on the `Sighting` table. All the data in the column will be lost.
  - Added the required column `admin_name` to the `Location` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id` to the `Location` table without a default value. This is not possible if the table is not empty.
  - Added the required column `locationId` to the `Sighting` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Location" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "admin_name" TEXT NOT NULL,
    "latitude" REAL NOT NULL,
    "longtitude" REAL NOT NULL,
    "population" INTEGER
);
INSERT INTO "new_Location" ("latitude", "longtitude", "name", "population") SELECT "latitude", "longtitude", "name", "population" FROM "Location";
DROP TABLE "Location";
ALTER TABLE "new_Location" RENAME TO "Location";
CREATE TABLE "new_Sighting" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tickId" INTEGER NOT NULL,
    "locationId" INTEGER NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Sighting_tickId_fkey" FOREIGN KEY ("tickId") REFERENCES "Tick" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Sighting_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Sighting" ("date", "id", "tickId") SELECT "date", "id", "tickId" FROM "Sighting";
DROP TABLE "Sighting";
ALTER TABLE "new_Sighting" RENAME TO "Sighting";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

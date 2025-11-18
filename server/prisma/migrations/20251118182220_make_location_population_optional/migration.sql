-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Location" (
    "name" TEXT NOT NULL PRIMARY KEY,
    "latitude" REAL NOT NULL,
    "longtitude" REAL NOT NULL,
    "population" INTEGER
);
INSERT INTO "new_Location" ("latitude", "longtitude", "name", "population") SELECT "latitude", "longtitude", "name", "population" FROM "Location";
DROP TABLE "Location";
ALTER TABLE "new_Location" RENAME TO "Location";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

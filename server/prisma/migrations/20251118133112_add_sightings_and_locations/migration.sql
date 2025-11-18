-- CreateTable
CREATE TABLE "Sighting" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tickId" INTEGER NOT NULL,
    "locationName" TEXT NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Sighting_tickId_fkey" FOREIGN KEY ("tickId") REFERENCES "Tick" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Sighting_locationName_fkey" FOREIGN KEY ("locationName") REFERENCES "Location" ("name") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Location" (
    "name" TEXT NOT NULL PRIMARY KEY,
    "latitude" REAL NOT NULL,
    "longtitude" REAL NOT NULL,
    "population" INTEGER NOT NULL
);

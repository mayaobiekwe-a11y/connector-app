-- CreateTable
CREATE TABLE "Relationship" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "memberId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Relationship_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Member" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT,
    "company" TEXT,
    "industry" TEXT,
    "location" TEXT,
    "bio" TEXT,
    "linkedinUrl" TEXT,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "openToRoles" BOOLEAN NOT NULL DEFAULT false,
    "openToGigWork" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "communityId" TEXT NOT NULL,
    CONSTRAINT "Member_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Member" ("bio", "communityId", "company", "createdAt", "email", "id", "industry", "isAdmin", "location", "name", "passwordHash", "title") SELECT "bio", "communityId", "company", "createdAt", "email", "id", "industry", "isAdmin", "location", "name", "passwordHash", "title" FROM "Member";
DROP TABLE "Member";
ALTER TABLE "new_Member" RENAME TO "Member";
CREATE UNIQUE INDEX "Member_email_key" ON "Member"("email");
CREATE INDEX "Member_communityId_idx" ON "Member"("communityId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Relationship_memberId_idx" ON "Relationship"("memberId");

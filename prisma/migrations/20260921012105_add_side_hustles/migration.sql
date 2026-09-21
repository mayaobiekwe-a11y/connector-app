-- CreateTable
CREATE TABLE "SideHustle" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SideHustle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SideHustle_memberId_idx" ON "SideHustle"("memberId");

-- AddForeignKey
ALTER TABLE "SideHustle" ADD CONSTRAINT "SideHustle_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

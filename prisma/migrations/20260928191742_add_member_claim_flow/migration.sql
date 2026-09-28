-- AlterTable
ALTER TABLE "Member" ALTER COLUMN "passwordHash" DROP NOT NULL,
ADD COLUMN     "claimToken" TEXT,
ADD COLUMN     "claimedAt" TIMESTAMP(3),
ADD COLUMN     "inviteSentAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "Member_claimToken_key" ON "Member"("claimToken");

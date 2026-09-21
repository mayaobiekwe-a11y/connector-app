-- AlterTable
ALTER TABLE "Member" ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "monthlyCapacity" INTEGER,
ADD COLUMN     "profileType" TEXT NOT NULL DEFAULT 'GENERAL',
ADD COLUMN     "subscriptionStatus" TEXT NOT NULL DEFAULT 'NONE',
ADD COLUMN     "visibleInDirectory" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Match" ADD COLUMN     "source" TEXT NOT NULL DEFAULT 'AI_MATCH';

-- CreateTable
CREATE TABLE "AskCreditEntry" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "refId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AskCreditEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AskCreditEntry_memberId_idx" ON "AskCreditEntry"("memberId");

-- AddForeignKey
ALTER TABLE "AskCreditEntry" ADD CONSTRAINT "AskCreditEntry_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

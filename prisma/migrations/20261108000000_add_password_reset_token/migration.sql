ALTER TABLE "Member" ADD COLUMN "resetToken" TEXT;
ALTER TABLE "Member" ADD COLUMN "resetTokenExpires" TIMESTAMP(3);
CREATE UNIQUE INDEX "Member_resetToken_key" ON "Member"("resetToken");

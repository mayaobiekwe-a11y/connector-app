-- AlterTable
ALTER TABLE "Member" ADD COLUMN     "needCategories" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

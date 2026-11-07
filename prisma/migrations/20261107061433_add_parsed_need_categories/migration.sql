-- AlterTable
ALTER TABLE "Request" ADD COLUMN     "parsedNeedCategories" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "commissionCents" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "PlatformSettings" (
    "id" TEXT NOT NULL DEFAULT 'global',
    "commissionRate" DOUBLE PRECISION NOT NULL DEFAULT 10,

    CONSTRAINT "PlatformSettings_pkey" PRIMARY KEY ("id")
);

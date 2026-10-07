-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('PHYSICAL', 'DIGITAL');

-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "shippingFullName" DROP NOT NULL,
ALTER COLUMN "shippingPhone" DROP NOT NULL,
ALTER COLUMN "shippingCountry" DROP NOT NULL,
ALTER COLUMN "shippingCity" DROP NOT NULL,
ALTER COLUMN "shippingAddress" DROP NOT NULL;

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "productType" "ProductType" NOT NULL DEFAULT 'PHYSICAL';

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "digitalFileUrl" TEXT,
ADD COLUMN     "type" "ProductType" NOT NULL DEFAULT 'PHYSICAL';

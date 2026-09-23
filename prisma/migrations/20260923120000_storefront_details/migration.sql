-- Order confirmation emails, product detail fields, and admin photo uploads.
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "confirmationSentAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "fabric" TEXT,
ADD COLUMN     "fit" TEXT,
ADD COLUMN     "pieceType" TEXT,
ADD COLUMN     "pieces" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "sizeChart" TEXT,
ADD COLUMN     "work" TEXT;

-- CreateTable
CREATE TABLE "Upload" (
    "id" TEXT NOT NULL,
    "data" BYTEA NOT NULL,
    "contentType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Upload_pkey" PRIMARY KEY ("id")
);

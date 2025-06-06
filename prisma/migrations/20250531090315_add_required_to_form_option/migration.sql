/*
  Warnings:

  - You are about to drop the column `image` on the `Location` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "FormOption" ADD COLUMN     "required" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Location" DROP COLUMN "image";

-- AlterTable
ALTER TABLE "Response" ADD COLUMN     "imageUploadId" INTEGER;

-- CreateTable
CREATE TABLE "ImageUpload" (
    "id" SERIAL NOT NULL,
    "publicId" TEXT NOT NULL,
    "secureUrl" TEXT NOT NULL,
    "format" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "resourceType" TEXT,
    "originalFilename" TEXT,
    "exifData" JSONB,
    "locationId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImageUpload_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ImageUpload_publicId_key" ON "ImageUpload"("publicId");

-- AddForeignKey
ALTER TABLE "ImageUpload" ADD CONSTRAINT "ImageUpload_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Response" ADD CONSTRAINT "Response_imageUploadId_fkey" FOREIGN KEY ("imageUploadId") REFERENCES "ImageUpload"("id") ON DELETE SET NULL ON UPDATE CASCADE;

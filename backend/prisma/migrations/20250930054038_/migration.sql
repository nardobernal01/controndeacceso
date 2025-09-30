/*
  Warnings:

  - You are about to drop the column `duration` on the `Attendance` table. All the data in the column will be lost.
  - You are about to drop the column `encodings` on the `Person` table. All the data in the column will be lost.
  - Added the required column `status` to the `Attendance` table without a default value. This is not possible if the table is not empty.
  - Made the column `entryAt` on table `Attendance` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `entryTime` to the `Person` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Person` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Attendance" DROP COLUMN "duration",
ADD COLUMN     "status" TEXT NOT NULL,
ALTER COLUMN "entryAt" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."Person" DROP COLUMN "encodings",
ADD COLUMN     "entryTime" TEXT NOT NULL,
ADD COLUMN     "facialEncoding" JSONB,
ADD COLUMN     "photoUrl" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

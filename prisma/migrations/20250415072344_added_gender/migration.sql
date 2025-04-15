/*
  Warnings:

  - You are about to drop the column `maintenanceCalories` on the `UserProfile` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY');

-- AlterTable
ALTER TABLE "UserProfile" DROP COLUMN "maintenanceCalories",
ADD COLUMN     "gender" "Gender";

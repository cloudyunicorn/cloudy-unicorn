-- CreateEnum
CREATE TYPE "ActivityLevel" AS ENUM ('SEDENTARY', 'LIGHTLY_ACTIVE', 'MODERATELY_ACTIVE', 'VERY_ACTIVE', 'EXTREMELY_ACTIVE');

-- AlterTable
ALTER TABLE "UserProfile" ADD COLUMN     "activityLevel" "ActivityLevel";

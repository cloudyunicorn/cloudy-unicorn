/*
  Warnings:

  - Changed the type of `type` on the `ProgressLog` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "ProgressType" AS ENUM ('WEIGHT', 'BODY_FAT', 'WORKOUT_COMPLETED');

-- AlterTable
ALTER TABLE "ProgressLog" ADD COLUMN     "workoutSessionId" TEXT,
DROP COLUMN "type",
ADD COLUMN     "type" "ProgressType" NOT NULL;

-- CreateIndex
CREATE INDEX "ProgressLog_userId_type_logged_at_idx" ON "ProgressLog"("userId", "type", "logged_at");

-- CreateIndex
CREATE INDEX "ProgressLog_workoutSessionId_idx" ON "ProgressLog"("workoutSessionId");

-- AddForeignKey
ALTER TABLE "ProgressLog" ADD CONSTRAINT "ProgressLog_workoutSessionId_fkey" FOREIGN KEY ("workoutSessionId") REFERENCES "WorkoutSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

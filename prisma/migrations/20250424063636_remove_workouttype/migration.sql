/*
  Warnings:

  - The values [WORKOUT_COMPLETED] on the enum `ProgressType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ProgressType_new" AS ENUM ('WEIGHT', 'BODY_FAT');
ALTER TABLE "ProgressLog" ALTER COLUMN "type" TYPE "ProgressType_new" USING ("type"::text::"ProgressType_new");
ALTER TYPE "ProgressType" RENAME TO "ProgressType_old";
ALTER TYPE "ProgressType_new" RENAME TO "ProgressType";
DROP TYPE "ProgressType_old";
COMMIT;

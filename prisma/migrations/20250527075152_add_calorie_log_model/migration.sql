-- CreateEnum
CREATE TYPE "MealType" AS ENUM ('BREAKFAST', 'LUNCH', 'DINNER', 'SNACK');

-- CreateTable
CREATE TABLE "CalorieLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mealType" "MealType" NOT NULL,
    "food" TEXT NOT NULL,
    "calories" INTEGER NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CalorieLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CalorieLog_userId_date_idx" ON "CalorieLog"("userId", "date");

-- CreateIndex
CREATE INDEX "CalorieLog_userId_mealType_idx" ON "CalorieLog"("userId", "mealType");

-- AddForeignKey
ALTER TABLE "CalorieLog" ADD CONSTRAINT "CalorieLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Supabase RLS Policies for Cloudy Unicorn Mobile App
-- Run this SQL in Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- Note: Prisma schema uses camelCase column names

-- =============================================
-- STEP 1: Grant schema access to authenticated users
-- =============================================
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- =============================================
-- STEP 2: Grant table permissions
-- =============================================
GRANT SELECT, UPDATE ON "User" TO authenticated;
GRANT SELECT, INSERT, UPDATE ON "UserProfile" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON "MealPlan" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON "WorkoutProgram" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON "ProgressLog" TO authenticated;
GRANT SELECT, INSERT, DELETE ON "CalorieLog" TO authenticated;
GRANT SELECT, INSERT ON "WorkoutSession" TO authenticated;
GRANT SELECT, INSERT ON "BodyMeasurement" TO authenticated;
GRANT SELECT, INSERT ON "AIHealthAssessment" TO authenticated;
GRANT SELECT, INSERT ON "Feedback" TO authenticated;
GRANT SELECT, INSERT, UPDATE ON "UserChallenge" TO authenticated;

-- =============================================
-- STEP 3: Enable RLS on all tables
-- =============================================
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "UserProfile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MealPlan" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WorkoutProgram" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ProgressLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CalorieLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WorkoutSession" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "BodyMeasurement" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AIHealthAssessment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Feedback" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "UserChallenge" ENABLE ROW LEVEL SECURITY;

-- =============================================
-- User Table Policies
-- =============================================
CREATE POLICY "Users can view own record"
ON "User" FOR SELECT
TO authenticated
USING (auth_id = auth.uid()::text);

CREATE POLICY "Users can update own record"
ON "User" FOR UPDATE
TO authenticated
USING (auth_id = auth.uid()::text);

-- =============================================
-- UserProfile Table Policies (uses "userId" column)
-- =============================================
CREATE POLICY "Users can view own profile"
ON "UserProfile" FOR SELECT
TO authenticated
USING (
  "userId" IN (
    SELECT id FROM "User" WHERE auth_id = auth.uid()::text
  )
);

CREATE POLICY "Users can insert own profile"
ON "UserProfile" FOR INSERT
TO authenticated
WITH CHECK (
  "userId" IN (
    SELECT id FROM "User" WHERE auth_id = auth.uid()::text
  )
);

CREATE POLICY "Users can update own profile"
ON "UserProfile" FOR UPDATE
TO authenticated
USING (
  "userId" IN (
    SELECT id FROM "User" WHERE auth_id = auth.uid()::text
  )
);

-- =============================================
-- MealPlan Table Policies (uses "userId" column)
-- =============================================
CREATE POLICY "Users can view own meal plans"
ON "MealPlan" FOR SELECT
TO authenticated
USING (
  "userId" IN (
    SELECT id FROM "User" WHERE auth_id = auth.uid()::text
  )
);

CREATE POLICY "Users can insert own meal plans"
ON "MealPlan" FOR INSERT
TO authenticated
WITH CHECK (
  "userId" IN (
    SELECT id FROM "User" WHERE auth_id = auth.uid()::text
  )
);

CREATE POLICY "Users can update own meal plans"
ON "MealPlan" FOR UPDATE
TO authenticated
USING (
  "userId" IN (
    SELECT id FROM "User" WHERE auth_id = auth.uid()::text
  )
);

CREATE POLICY "Users can delete own meal plans"
ON "MealPlan" FOR DELETE
TO authenticated
USING (
  "userId" IN (
    SELECT id FROM "User" WHERE auth_id = auth.uid()::text
  )
);

-- =============================================
-- WorkoutProgram Table Policies (uses "userId" column)
-- =============================================
CREATE POLICY "Users can view own workout programs"
ON "WorkoutProgram" FOR SELECT
TO authenticated
USING (
  "userId" IN (
    SELECT id FROM "User" WHERE auth_id = auth.uid()::text
  )
);

CREATE POLICY "Users can insert own workout programs"
ON "WorkoutProgram" FOR INSERT
TO authenticated
WITH CHECK (
  "userId" IN (
    SELECT id FROM "User" WHERE auth_id = auth.uid()::text
  )
);

CREATE POLICY "Users can update own workout programs"
ON "WorkoutProgram" FOR UPDATE
TO authenticated
USING (
  "userId" IN (
    SELECT id FROM "User" WHERE auth_id = auth.uid()::text
  )
);

CREATE POLICY "Users can delete own workout programs"
ON "WorkoutProgram" FOR DELETE
TO authenticated
USING (
  "userId" IN (
    SELECT id FROM "User" WHERE auth_id = auth.uid()::text
  )
);

-- =============================================
-- ProgressLog Table Policies (uses "userId" column)
-- =============================================
CREATE POLICY "Users can view own progress logs"
ON "ProgressLog" FOR SELECT
TO authenticated
USING (
  "userId" IN (
    SELECT id FROM "User" WHERE auth_id = auth.uid()::text
  )
);

CREATE POLICY "Users can insert own progress logs"
ON "ProgressLog" FOR INSERT
TO authenticated
WITH CHECK (
  "userId" IN (
    SELECT id FROM "User" WHERE auth_id = auth.uid()::text
  )
);

CREATE POLICY "Users can update own progress logs"
ON "ProgressLog" FOR UPDATE
TO authenticated
USING (
  "userId" IN (
    SELECT id FROM "User" WHERE auth_id = auth.uid()::text
  )
);

CREATE POLICY "Users can delete own progress logs"
ON "ProgressLog" FOR DELETE
TO authenticated
USING (
  "userId" IN (
    SELECT id FROM "User" WHERE auth_id = auth.uid()::text
  )
);

-- =============================================
-- CalorieLog Table Policies (uses "userId" column)
-- =============================================
CREATE POLICY "Users can view own calorie logs"
ON "CalorieLog" FOR SELECT
TO authenticated
USING (
  "userId" IN (
    SELECT id FROM "User" WHERE auth_id = auth.uid()::text
  )
);

CREATE POLICY "Users can insert own calorie logs"
ON "CalorieLog" FOR INSERT
TO authenticated
WITH CHECK (
  "userId" IN (
    SELECT id FROM "User" WHERE auth_id = auth.uid()::text
  )
);

CREATE POLICY "Users can delete own calorie logs"
ON "CalorieLog" FOR DELETE
TO authenticated
USING (
  "userId" IN (
    SELECT id FROM "User" WHERE auth_id = auth.uid()::text
  )
);

-- =============================================
-- WorkoutSession Table Policies (uses "userId" column)
-- =============================================
CREATE POLICY "Users can view own workout sessions"
ON "WorkoutSession" FOR SELECT
TO authenticated
USING (
  "userId" IN (
    SELECT id FROM "User" WHERE auth_id = auth.uid()::text
  )
);

CREATE POLICY "Users can insert own workout sessions"
ON "WorkoutSession" FOR INSERT
TO authenticated
WITH CHECK (
  "userId" IN (
    SELECT id FROM "User" WHERE auth_id = auth.uid()::text
  )
);

-- =============================================
-- BodyMeasurement Table Policies (uses "userId" column)
-- =============================================
CREATE POLICY "Users can view own body measurements"
ON "BodyMeasurement" FOR SELECT
TO authenticated
USING (
  "userId" IN (
    SELECT id FROM "User" WHERE auth_id = auth.uid()::text
  )
);

CREATE POLICY "Users can insert own body measurements"
ON "BodyMeasurement" FOR INSERT
TO authenticated
WITH CHECK (
  "userId" IN (
    SELECT id FROM "User" WHERE auth_id = auth.uid()::text
  )
);

-- =============================================
-- AIHealthAssessment Table Policies (uses "userId" column)
-- =============================================
CREATE POLICY "Users can view own health assessments"
ON "AIHealthAssessment" FOR SELECT
TO authenticated
USING (
  "userId" IN (
    SELECT id FROM "User" WHERE auth_id = auth.uid()::text
  )
);

CREATE POLICY "Users can insert own health assessments"
ON "AIHealthAssessment" FOR INSERT
TO authenticated
WITH CHECK (
  "userId" IN (
    SELECT id FROM "User" WHERE auth_id = auth.uid()::text
  )
);

-- =============================================
-- Feedback Table Policies (uses "userId" column)
-- =============================================
CREATE POLICY "Users can view own feedback"
ON "Feedback" FOR SELECT
TO authenticated
USING (
  "userId" IN (
    SELECT id FROM "User" WHERE auth_id = auth.uid()::text
  )
);

CREATE POLICY "Users can insert own feedback"
ON "Feedback" FOR INSERT
TO authenticated
WITH CHECK (
  "userId" IN (
    SELECT id FROM "User" WHERE auth_id = auth.uid()::text
  )
);

-- =============================================
-- UserChallenge Table Policies (uses "userId" column)
-- =============================================
CREATE POLICY "Users can view own challenges"
ON "UserChallenge" FOR SELECT
TO authenticated
USING (
  "userId" IN (
    SELECT id FROM "User" WHERE auth_id = auth.uid()::text
  )
);

CREATE POLICY "Users can insert own challenges"
ON "UserChallenge" FOR INSERT
TO authenticated
WITH CHECK (
  "userId" IN (
    SELECT id FROM "User" WHERE auth_id = auth.uid()::text
  )
);

CREATE POLICY "Users can update own challenges"
ON "UserChallenge" FOR UPDATE
TO authenticated
USING (
  "userId" IN (
    SELECT id FROM "User" WHERE auth_id = auth.uid()::text
  )
);

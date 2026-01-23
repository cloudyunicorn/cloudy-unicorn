-- GRANTS ONLY - Run this FIRST if you already applied the RLS policies
-- This adds the missing schema and table permissions

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

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
GRANT SELECT ON "Challenge" TO authenticated;
GRANT SELECT ON "Exercise" TO authenticated;

'use client';

import React from 'react';
import { UserCog, Dumbbell, Weight, Flame } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { useData } from '@/contexts/DataContext';
import { formatDistanceToNow } from 'date-fns';
import { FitnessGoal, DifficultyLevel } from '@prisma/client';
import { BodyInfoDialog } from "./body-info-dialog";

// Define types for the user data
type UserProfileData = {
  age: number | null;
  weight: number | null;
  height: number | null;
  bodyFatPercentage: number | null;
  dietaryPreferences: string[];
  fitnessLevel: DifficultyLevel | null;
  targetWeight: number | null;
};

type UserStatsData = {
  workoutsThisWeek: number;
  activeChallenges: number;
  latestWeightLog: { value: number; loggedAt: Date } | null;
};

type UserData = {
  goals: FitnessGoal[];
  profile: UserProfileData | null;
  stats: UserStatsData;
} | null;

// Calculate BMR using Mifflin-St Jeor formula
const calculateBMR = (weight: number, height: number, age: number, isMale: boolean) => {
  return (10 * weight) + (6.25 * height) - (5 * age) + (isMale ? 5 : -161);
};

export function SectionCards() {
  const { data: userData, isLoading, error } = useData();

  const profile = userData?.profile;
  const goals = userData?.goals;
  const stats = userData?.stats;
  const primaryGoal = goals && goals.length > 0 ? goals[0] : null;

  // Calculate BMR if we have the required data
  const bmr = profile?.weight && profile?.height && profile?.age 
    ? calculateBMR(profile.weight, profile.height, profile.age, true) // Assuming male for now
    : null;


  if (error) {
    return (
      <div className="px-4 lg:px-6 text-destructive">
        Error loading dashboard cards: {error.message || String(error)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 md:grid-cols-2 lg:grid-cols-4">
      {/* Body Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <UserCog className="h-4 w-4" />
            Current Body Info
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center h-8">
              <Spinner className="h-4 w-4" />
            </div>
          ) : profile ? (
            <CardTitle>
              {profile.weight ? `${profile.weight} kg` : '-'} / {profile.height ? `${profile.height} cm` : '-'}
            </CardTitle>
          ) : (
            <CardTitle>Add Your Info</CardTitle>
          )}
        </CardHeader>
        <CardFooter>
          {profile ? (
            <div className="text-sm">
              <div>Primary Goal: {primaryGoal?.replace(/_/g, ' ').toLowerCase()}</div>
              <div className="text-muted-foreground">Keep your profile updated!</div>
            </div>
          ) : (
            <div className="text-sm">
              <div>Click <BodyInfoDialog /> to add details</div>
            </div>
          )}
        </CardFooter>
      </Card>

      {/* BMR Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Flame className="h-4 w-4" />
            Basal Metabolic Rate
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center h-8">
              <Spinner className="h-4 w-4" />
            </div>
          ) : (
            <CardTitle>
              {bmr ? `${Math.round(bmr)} kcal/day` : '-'}
            </CardTitle>
          )}
        </CardHeader>
        <CardFooter>
          <div className="text-sm">
            {bmr ? (
              <>
                <div>Calories at complete rest</div>
                <div className="text-muted-foreground">Your body's base energy needs</div>
              </>
            ) : (
              <div>Complete your body info to calculate</div>
            )}
          </div>
        </CardFooter>
      </Card>

      {/* Workouts This Week Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Dumbbell className="h-4 w-4" />
            Workouts This Week
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center h-8">
              <Spinner className="h-4 w-4" />
            </div>
          ) : (
            <CardTitle>{stats?.workoutsThisWeek ?? 0}</CardTitle>
          )}
        </CardHeader>
        <CardFooter>
          <div className="text-sm">
            {stats && stats.workoutsThisWeek > 0 ? 'Great consistency!' : 'Log your first workout!'}
          </div>
        </CardFooter>
      </Card>

      {/* Latest Weight Log Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Weight className="h-4 w-4" />
            Latest Weight
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center h-8">
              <Spinner className="h-4 w-4" />
            </div>
          ) : (
            <CardTitle>
              {stats?.latestWeightLog?.value ? `${stats.latestWeightLog.value} kg` : '-'}
            </CardTitle>
          )}
        </CardHeader>
        <CardFooter>
          <div className="text-sm">
            {stats?.latestWeightLog ? 
              `Logged ${formatDistanceToNow(new Date(stats.latestWeightLog.loggedAt), { addSuffix: true })}` : 
              'No weight logged yet'}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

// Card components with proper TypeScript types
interface CardProps {
  children: React.ReactNode;
}

function Card({ children }: CardProps) {
  return <div className="border rounded-lg p-4">{children}</div>;
}

interface CardHeaderProps {
  children: React.ReactNode;
}

function CardHeader({ children }: CardHeaderProps) {
  return <div className="mb-4">{children}</div>;
}

interface CardTitleProps {
  children: React.ReactNode;
}

function CardTitle({ children }: CardTitleProps) {
  return <h3 className="text-xl font-semibold">{children}</h3>;
}

interface CardFooterProps {
  children: React.ReactNode;
}

function CardFooter({ children }: CardFooterProps) {
  return <div className="mt-4">{children}</div>;
}

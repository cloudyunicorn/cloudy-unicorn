import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Activity,
  Flame,
  Dumbbell,
  TrendingUp,
  Scale,
  Target,
  ChevronRight
} from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/providers/AuthProvider';
import { Card, CardContent } from '@/components/ui/Card';
import { LoadingScreen } from '@/components/ui/Spinner';

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { data, isLoading, refetch } = useData();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  if (isLoading && !data) {
    return <LoadingScreen text="Loading your dashboard..." />;
  }

  const userName = data?.user?.name || user?.email?.split('@')[0] || 'there';
  const stats = data?.stats;
  const profile = data?.profile;

  // Quick action cards
  const quickActions = [
    {
      title: 'AI Meal Plan',
      description: 'Generate personalized meals',
      icon: Flame,
      color: '#f97316',
      route: '/nutrition',
    },
    {
      title: 'AI Workout',
      description: 'Get a custom workout',
      icon: Dumbbell,
      color: '#8b5cf6',
      route: '/workout',
    },
    {
      title: 'Log Progress',
      description: 'Track your weight',
      icon: TrendingUp,
      color: '#10b981',
      route: '/progress',
    },
    {
      title: 'Track Calories',
      description: 'Log your meals',
      icon: Activity,
      color: '#3b82f6',
      route: '/nutrition',
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <Animated.View entering={FadeIn.duration(300)} style={{ flex: 1 }}>
        <ScrollView
          className="flex-1 px-5"
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Header */}
          <View className="pt-4 pb-6 flex-row justify-between items-center">
            <View>
              <Text className="text-foreground text-2xl font-bold">
                Hello, {data?.user?.name || user?.email?.split('@')[0] || 'User'} 👋
              </Text>
              <Text className="text-muted-foreground mt-1">Let's crush your goals today!</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/profile')}>
              <View className="w-10 h-10 rounded-full bg-primary/20 items-center justify-center">
                <Text className="text-primary font-bold">
                  {(data?.user?.name?.[0] || user?.email?.[0] || 'U').toUpperCase()}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Stats Cards */}
          <View className="flex-row gap-3 mb-6">
            <Card className="flex-1 bg-primary/10 border-primary/20">
              <CardContent className="p-4 items-center">
                <Flame size={24} color="#f97316" className="mb-2" />
                <Text className="text-2xl font-bold text-foreground">
                  {data?.calorieLogs?.[0]?.calories_in || 0}
                </Text>
                <Text className="text-xs text-muted-foreground">Cal Eaten</Text>
              </CardContent>
            </Card>
            <Card className="flex-1 bg-blue-500/10 border-blue-500/20">
              <CardContent className="p-4 items-center">
                <Dumbbell size={24} color="#3b82f6" className="mb-2" />
                <Text className="text-2xl font-bold text-foreground">
                  {data?.workoutPrograms?.length || 0}
                </Text>
                <Text className="text-xs text-muted-foreground">Workouts</Text>
              </CardContent>
            </Card>
            <Card className="flex-1 bg-green-500/10 border-green-500/20">
              <CardContent className="p-4 items-center">
                <Scale size={24} color="#10b981" className="mb-2" />
                <Text className="text-2xl font-bold text-foreground">
                  {data?.profile?.weight || '-'}
                </Text>
                <Text className="text-xs text-muted-foreground">Kg Weight</Text>
              </CardContent>
            </Card>
          </View>

          {/* Quick Actions */}
          <Text className="text-lg font-semibold text-foreground mb-3">Quick Actions</Text>
          <View className="gap-3 mb-6">
            <TouchableOpacity onPress={() => router.push('/nutrition')}>
              <Card>
                <CardContent className="flex-row items-center p-4">
                  <View className="w-10 h-10 rounded-full bg-orange-100 items-center justify-center mr-3">
                    <Flame size={20} color="#f97316" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-semibold text-foreground">Track Calories</Text>
                    <Text className="text-xs text-muted-foreground">Log your meals for today</Text>
                  </View>
                  <ChevronRight size={20} color="#9ca3af" />
                </CardContent>
              </Card>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/workout')}>
              <Card>
                <CardContent className="flex-row items-center p-4">
                  <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center mr-3">
                    <Dumbbell size={20} color="#3b82f6" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-semibold text-foreground">New Workout</Text>
                    <Text className="text-xs text-muted-foreground">Generate a plan with AI</Text>
                  </View>
                  <ChevronRight size={20} color="#9ca3af" />
                </CardContent>
              </Card>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/progress')}>
              <Card>
                <CardContent className="flex-row items-center p-4">
                  <View className="w-10 h-10 rounded-full bg-green-100 items-center justify-center mr-3">
                    <Activity size={20} color="#10b981" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-semibold text-foreground">Log Progress</Text>
                    <Text className="text-xs text-muted-foreground">Update weight & body metrics</Text>
                  </View>
                  <ChevronRight size={20} color="#9ca3af" />
                </CardContent>
              </Card>
            </TouchableOpacity>
          </View>

          {/* Your Focus / Goals */}
          <Text className="text-lg font-semibold text-foreground mb-3">Your Focus</Text>
          {data?.goals && data.goals.length > 0 ? (
            <View className="flex-row flex-wrap gap-2">
              {data.goals.map((goal, i) => (
                <View key={i} className="bg-primary/10 px-3 py-1.5 rounded-full flex-row items-center">
                  <Target size={14} color="#8b5cf6" className="mr-1.5" />
                  <Text className="text-primary text-sm font-medium">
                    {goal.replace('_', ' ')}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Card>
              <CardContent className="p-4">
                <Text className="text-muted-foreground text-center">
                  No goals set yet. Go to Profile to set your goals!
                </Text>
              </CardContent>
            </Card>
          )}

        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

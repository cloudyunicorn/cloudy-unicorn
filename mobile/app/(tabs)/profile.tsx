import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Settings, LogOut, Edit3, Target, Scale, Activity, ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';
import { supabase } from '@/lib/supabase';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/providers/AuthProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingScreen } from '@/components/ui/Spinner';
import { FitnessGoal, Gender, ActivityLevel, DifficultyLevel } from '@/types/database';

export default function ProfileScreen() {
    const router = useRouter();
    const { user: authUser } = useAuth();
    const { data, isLoading, updateProfile, updateGoals } = useData();
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Edit form state
    const [name, setName] = useState(data?.user?.name || '');
    const [age, setAge] = useState(data?.profile?.age?.toString() || '');
    const [weight, setWeight] = useState(data?.profile?.weight?.toString() || '');
    const [height, setHeight] = useState(data?.profile?.height?.toString() || '');
    const [targetWeight, setTargetWeight] = useState(data?.profile?.target_weight?.toString() || '');
    const [selectedGoals, setSelectedGoals] = useState<FitnessGoal[]>(data?.goals || []);
    const [gender, setGender] = useState<Gender | ''>(data?.profile?.gender || '');
    const [fitnessLevel, setFitnessLevel] = useState<DifficultyLevel | ''>(data?.profile?.fitness_level || '');

    if (isLoading && !data) {
        return <LoadingScreen text="Loading profile..." />;
    }

    const handleLogout = async () => {
        Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Sign Out',
                style: 'destructive',
                onPress: async () => {
                    await supabase.auth.signOut();
                },
            },
        ]);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateProfile({
                age: age ? parseInt(age) : null,
                weight: weight ? parseFloat(weight) : null,
                height: height ? parseFloat(height) : null,
                target_weight: targetWeight ? parseFloat(targetWeight) : null,
                gender: gender || null,
                fitness_level: fitnessLevel || null,
            });

            if (selectedGoals.length > 0) {
                await updateGoals(selectedGoals);
            }

            Alert.alert('Success', 'Profile updated!');
            setIsEditing(false);
        } catch (error) {
            Alert.alert('Error', 'Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    const toggleGoal = (goal: FitnessGoal) => {
        setSelectedGoals(prev =>
            prev.includes(goal)
                ? prev.filter(g => g !== goal)
                : [...prev, goal]
        );
    };

    const allGoals = Object.values(FitnessGoal);
    const genderOptions = Object.values(Gender);
    const fitnessLevels = Object.values(DifficultyLevel);

    const userName = data?.user?.name || authUser?.email?.split('@')[0] || 'User';
    const userEmail = data?.user?.email || authUser?.email || '';

    return (
        <SafeAreaView className="flex-1 bg-background" edges={['top']}>
            <Animated.View entering={FadeIn.duration(300)} style={{ flex: 1 }}>
                <ScrollView
                    className="flex-1"
                    contentContainerStyle={{ paddingBottom: 100 }}
                >
                    {/* Header */}
                    <View className="px-5 pt-4 pb-6">
                        <View className="flex-row items-center justify-between">
                            <Text className="text-foreground text-2xl font-bold">Profile</Text>
                            <TouchableOpacity
                                onPress={() => setIsEditing(!isEditing)}
                                className="p-2"
                            >
                                <Edit3 size={22} color="#8b5cf6" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* User Info Card */}
                    <View className="px-5 mb-6">
                        <Card>
                            <CardContent className="py-5">
                                <View className="flex-row items-center">
                                    <View className="w-16 h-16 rounded-full bg-primary/20 items-center justify-center mr-4">
                                        <Text className="text-primary text-2xl font-bold">
                                            {userName.charAt(0).toUpperCase()}
                                        </Text>
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-foreground text-xl font-bold">{userName}</Text>
                                        <Text className="text-muted-foreground mt-1">{userEmail}</Text>
                                    </View>
                                </View>
                            </CardContent>
                        </Card>
                    </View>

                    {isEditing ? (
                        // Edit Mode
                        <View className="px-5 gap-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Body Information</CardTitle>
                                </CardHeader>
                                <CardContent className="gap-4">
                                    <View className="flex-row gap-3">
                                        <Input
                                            containerClassName="flex-1"
                                            label="Age"
                                            value={age}
                                            onChangeText={setAge}
                                            keyboardType="numeric"
                                            placeholder="25"
                                        />
                                        <View className="flex-1">
                                            <Text className="text-sm font-medium text-foreground mb-1.5">Gender</Text>
                                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                                <View className="flex-row gap-2">
                                                    {genderOptions.map(g => (
                                                        <TouchableOpacity
                                                            key={g}
                                                            onPress={() => setGender(g)}
                                                            className={`px-3 py-2 rounded-lg ${gender === g ? 'bg-primary' : 'bg-card border border-border'
                                                                }`}
                                                        >
                                                            <Text className={gender === g ? 'text-white text-xs' : 'text-muted-foreground text-xs'}>
                                                                {g.replace('_', ' ')}
                                                            </Text>
                                                        </TouchableOpacity>
                                                    ))}
                                                </View>
                                            </ScrollView>
                                        </View>
                                    </View>

                                    <View className="flex-row gap-3">
                                        <Input
                                            containerClassName="flex-1"
                                            label="Weight (kg)"
                                            value={weight}
                                            onChangeText={setWeight}
                                            keyboardType="decimal-pad"
                                            placeholder="70"
                                        />
                                        <Input
                                            containerClassName="flex-1"
                                            label="Height (cm)"
                                            value={height}
                                            onChangeText={setHeight}
                                            keyboardType="numeric"
                                            placeholder="175"
                                        />
                                    </View>

                                    <Input
                                        label="Target Weight (kg)"
                                        value={targetWeight}
                                        onChangeText={setTargetWeight}
                                        keyboardType="decimal-pad"
                                        placeholder="65"
                                    />

                                    <View>
                                        <Text className="text-sm font-medium text-foreground mb-2">Fitness Level</Text>
                                        <View className="flex-row gap-2">
                                            {fitnessLevels.map(level => (
                                                <TouchableOpacity
                                                    key={level}
                                                    onPress={() => setFitnessLevel(level)}
                                                    className={`flex-1 py-3 rounded-xl items-center ${fitnessLevel === level ? 'bg-primary' : 'bg-card border border-border'
                                                        }`}
                                                >
                                                    <Text className={fitnessLevel === level ? 'text-white text-sm font-medium' : 'text-muted-foreground text-sm'}>
                                                        {level.charAt(0) + level.slice(1).toLowerCase()}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Fitness Goals</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <View className="flex-row flex-wrap gap-2">
                                        {allGoals.map(goal => (
                                            <TouchableOpacity
                                                key={goal}
                                                onPress={() => toggleGoal(goal)}
                                                className={`px-4 py-2 rounded-full ${selectedGoals.includes(goal) ? 'bg-primary' : 'bg-card border border-border'
                                                    }`}
                                            >
                                                <Text className={selectedGoals.includes(goal) ? 'text-white font-medium' : 'text-muted-foreground'}>
                                                    {goal.replace('_', ' ')}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </CardContent>
                            </Card>

                            <View className="flex-row gap-3">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onPress={() => setIsEditing(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className="flex-1"
                                    onPress={handleSave}
                                    loading={isSaving}
                                >
                                    Save Changes
                                </Button>
                            </View>
                        </View>
                    ) : (
                        // View Mode
                        <View className="px-5 gap-4">
                            {/* Body Stats */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Body Stats</CardTitle>
                                </CardHeader>
                                <CardContent className="gap-3">
                                    <View className="flex-row items-center justify-between py-2 border-b border-border">
                                        <View className="flex-row items-center">
                                            <Scale size={18} color="#8b5cf6" />
                                            <Text className="text-muted-foreground ml-3">Weight</Text>
                                        </View>
                                        <Text className="text-foreground font-medium">
                                            {data?.profile?.weight ? `${data.profile.weight} kg` : 'Not set'}
                                        </Text>
                                    </View>
                                    <View className="flex-row items-center justify-between py-2 border-b border-border">
                                        <View className="flex-row items-center">
                                            <Activity size={18} color="#10b981" />
                                            <Text className="text-muted-foreground ml-3">Height</Text>
                                        </View>
                                        <Text className="text-foreground font-medium">
                                            {data?.profile?.height ? `${data.profile.height} cm` : 'Not set'}
                                        </Text>
                                    </View>
                                    <View className="flex-row items-center justify-between py-2 border-b border-border">
                                        <View className="flex-row items-center">
                                            <Target size={18} color="#f97316" />
                                            <Text className="text-muted-foreground ml-3">Target Weight</Text>
                                        </View>
                                        <Text className="text-foreground font-medium">
                                            {data?.profile?.target_weight ? `${data.profile.target_weight} kg` : 'Not set'}
                                        </Text>
                                    </View>
                                    <View className="flex-row items-center justify-between py-2">
                                        <View className="flex-row items-center">
                                            <User size={18} color="#3b82f6" />
                                            <Text className="text-muted-foreground ml-3">Fitness Level</Text>
                                        </View>
                                        <Text className="text-foreground font-medium">
                                            {data?.profile?.fitness_level || 'Not set'}
                                        </Text>
                                    </View>
                                </CardContent>
                            </Card>

                            {/* Goals */}
                            {data?.goals && data.goals.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Fitness Goals</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <View className="flex-row flex-wrap gap-2">
                                            {data.goals.map((goal, index) => (
                                                <View key={index} className="bg-primary/10 px-4 py-2 rounded-full">
                                                    <Text className="text-primary font-medium">
                                                        {goal.replace('_', ' ')}
                                                    </Text>
                                                </View>
                                            ))}
                                        </View>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Sign Out */}
                            <Card>
                                <TouchableOpacity onPress={handleLogout}>
                                    <CardContent className="py-4">
                                        <View className="flex-row items-center">
                                            <View className="w-10 h-10 rounded-full bg-destructive/10 items-center justify-center mr-4">
                                                <LogOut size={20} color="#ef4444" />
                                            </View>
                                            <Text className="text-destructive font-medium flex-1">Sign Out</Text>
                                            <ChevronRight size={20} color="#ef4444" />
                                        </View>
                                    </CardContent>
                                </TouchableOpacity>
                            </Card>
                        </View>
                    )}
                </ScrollView>
            </Animated.View>
        </SafeAreaView>
    );
}

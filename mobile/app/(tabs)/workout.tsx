import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Dumbbell, Sparkles, BookOpen, Trash2, ChevronDown, ChevronUp } from 'lucide-react-native';
import Markdown from 'react-native-markdown-display';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, TextArea } from '@/components/ui/Input';
import { LoadingScreen } from '@/components/ui/Spinner';
import { streamFitnessResponse, getWorkoutPrompt } from '@/lib/ai-client';
import { FitnessContext, DifficultyLevel } from '@/types/database';
import { markdownStyles } from '@/lib/markdown-styles';

// Fun facts to show while AI is thinking
const WAITING_FACTS = [
    "💪 Did you know? Muscle weighs more than fat by volume, so building muscle can increase weight while slimming you down!",
    "🏃 Running just 5 minutes a day can add years to your life!",
    "🔥 Your body burns calories even while sleeping - about 50-100 calories per hour!",
    "🧘 Yoga can boost your immune system and reduce stress hormones.",
    "🏃 Just 30 minutes of walking can burn 100-300 calories depending on your pace!",
    "💪 Muscles grow during rest, not during the workout itself!",
    "🧠 Exercise promotes brain cell growth and improves memory.",
    "🏋️ Compound exercises like squats burn more calories than isolation exercises.",
    "💤 Getting 7-9 hours of sleep can help with muscle recovery.",
    "🏋️ Strength training can boost your metabolism for up to 72 hours after your workout!",
    "💧 Staying hydrated can improve your workout performance by up to 25%!",
    "🏃 High-intensity intervals can burn fat faster than steady cardio.",
    "🎯 Setting specific fitness goals makes you 42% more likely to achieve them.",
    "💪 Grip strength is linked to overall longevity and health.",
    "🧘 Just 10 minutes of stretching daily can improve flexibility significantly.",
];

export default function WorkoutScreen() {
    const { data, isLoading, addWorkoutProgram, removeWorkoutProgram } = useData();
    const [activeTab, setActiveTab] = useState<'generate' | 'saved'>('generate');
    const [query, setQuery] = useState('');
    const [equipment, setEquipment] = useState('bodyweight');
    const [difficulty, setDifficulty] = useState<string>('BEGINNER');
    const [aiResponse, setAiResponse] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isThinking, setIsThinking] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [expandedPlan, setExpandedPlan] = useState<string | null>(null);
    const [factIndex, setFactIndex] = useState(0);

    // Rotate fun facts every 10 seconds while thinking
    useEffect(() => {
        if (isThinking && !aiResponse) {
            const interval = setInterval(() => {
                setFactIndex(prev => (prev + 1) % WAITING_FACTS.length);
            }, 10000);
            return () => clearInterval(interval);
        }
    }, [isThinking]);


    if (isLoading && !data) {
        return <LoadingScreen text="Loading workout data..." />;
    }

    const buildContext = (): FitnessContext => ({
        diet: '',
        goals: data?.goals?.map(g => g.toString()) || [],
        fitnessLevel: difficulty.toLowerCase(),
        healthConditions: [],
        bodyMetrics: {
            age: data?.profile?.age || undefined,
            weight: data?.profile?.weight || undefined,
            height: data?.profile?.height || undefined,
            bodyFatPercentage: data?.profile?.body_fat_percentage || undefined,
            gender: data?.profile?.gender || undefined,
        },
        currentPlan: {
            workouts: equipment.split(',').map(e => e.trim()),
        },
    });

    const handleGenerate = async () => {
        if (!query.trim()) {
            Alert.alert('Error', 'Please describe what kind of workout you want');
            return;
        }

        setIsGenerating(true);
        setAiResponse('');
        setIsThinking(true);

        try {
            const context = buildContext();
            const prompt = getWorkoutPrompt(context, query);

            streamFitnessResponse(
                prompt,
                context,
                (chunk) => setAiResponse(prev => prev + chunk),
                () => {
                    setIsGenerating(false);
                    setIsThinking(false);
                },
                (error) => {
                    Alert.alert('Error', 'Failed to generate workout. Please try again.');
                    console.error(error);
                    setIsGenerating(false);
                    setIsThinking(false);
                },
                (thinking) => setIsThinking(thinking)
            );
        } catch (error) {
            Alert.alert('Error', 'Failed to generate workout. Please try again.');
            console.error(error);
            setIsGenerating(false);
            setIsThinking(false);
        }
    };

    const handleSave = async () => {
        if (!aiResponse) return;

        setIsSaving(true);
        try {
            const title = `Workout - ${new Date().toLocaleDateString()}`;
            await addWorkoutProgram(title, aiResponse, difficulty);
            Alert.alert('Success', 'Workout program saved!');
            setAiResponse('');
            setQuery('');
        } catch (error) {
            Alert.alert('Error', 'Failed to save workout program');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (programId: string) => {
        Alert.alert('Delete Program', 'Are you sure you want to delete this workout?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await removeWorkoutProgram(programId);
                    } catch (error) {
                        Alert.alert('Error', 'Failed to delete workout program');
                    }
                },
            },
        ]);
    };

    const difficultyLevels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

    return (
        <SafeAreaView className="flex-1 bg-background" edges={['top']}>
            <Animated.View entering={FadeIn.duration(300)} style={{ flex: 1 }}>
                {/* Header */}
                <View className="px-5 pt-4 pb-4">
                    <Text className="text-foreground text-2xl font-bold">Workout</Text>
                    <Text className="text-muted-foreground mt-1">AI-powered workout programs</Text>
                </View>

                {/* Tabs */}
                <View className="flex-row px-5 mb-4">
                    <TouchableOpacity
                        onPress={() => setActiveTab('generate')}
                        className={`flex-1 flex-row items-center justify-center py-3 rounded-xl mr-2 ${activeTab === 'generate' ? 'bg-primary' : 'bg-card border border-border'
                            }`}
                    >
                        <Sparkles size={16} color={activeTab === 'generate' ? '#fff' : '#9ca3af'} />
                        <Text className={`ml-2 font-medium ${activeTab === 'generate' ? 'text-primary-foreground' : 'text-muted-foreground'
                            }`}>
                            AI Generate
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setActiveTab('saved')}
                        className={`flex-1 flex-row items-center justify-center py-3 rounded-xl ${activeTab === 'saved' ? 'bg-primary' : 'bg-card border border-border'
                            }`}
                    >
                        <BookOpen size={16} color={activeTab === 'saved' ? '#fff' : '#9ca3af'} />
                        <Text className={`ml-2 font-medium ${activeTab === 'saved' ? 'text-primary-foreground' : 'text-muted-foreground'
                            }`}>
                            Saved Workouts
                        </Text>
                    </TouchableOpacity>
                </View>

                <ScrollView
                    className="flex-1 px-5"
                    contentContainerStyle={{ paddingBottom: 100 }}
                >
                    {activeTab === 'generate' && (
                        <View className="gap-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>AI Workout Generator</CardTitle>
                                </CardHeader>
                                <CardContent className="gap-4">
                                    {/* Difficulty Selection */}
                                    <View>
                                        <Text className="text-sm font-medium text-foreground mb-2">Fitness Level</Text>
                                        <View className="flex-row gap-2">
                                            {difficultyLevels.map(level => (
                                                <TouchableOpacity
                                                    key={level}
                                                    onPress={() => setDifficulty(level)}
                                                    className={`flex-1 py-3 rounded-xl items-center ${difficulty === level ? 'bg-primary' : 'bg-card border border-border'
                                                        }`}
                                                >
                                                    <Text className={difficulty === level ? 'text-white font-medium text-sm' : 'text-muted-foreground text-sm'}>
                                                        {level.charAt(0) + level.slice(1).toLowerCase()}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>

                                    <Input
                                        label="Available Equipment"
                                        value={equipment}
                                        onChangeText={setEquipment}
                                        placeholder="e.g., dumbbells, resistance bands, pull-up bar"
                                    />
                                    <TextArea
                                        label="What workout are you looking for?"
                                        value={query}
                                        onChangeText={setQuery}
                                        placeholder="E.g., 'Full body workout for muscle building' or '20-minute cardio HIIT session'"
                                    />
                                    <Button
                                        onPress={handleGenerate}
                                        loading={isGenerating}
                                        disabled={isGenerating}
                                    >
                                        {isGenerating ? (isThinking ? 'AI is thinking...' : 'Generating...') : 'Generate Workout'}
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Thinking indicator with rotating facts */}
                            {isGenerating && isThinking && !aiResponse && (
                                <Card>
                                    <CardContent className="py-6">
                                        <View className="items-center mb-4">
                                            <Text className="text-primary text-lg font-semibold">
                                                💪 AI is crafting your workout...
                                            </Text>
                                            <Text className="text-muted-foreground text-sm mt-1">
                                                This may take a minute
                                            </Text>
                                        </View>
                                        <View className="bg-primary/10 rounded-xl p-4 mt-2">
                                            <Text className="text-foreground text-center text-sm leading-6">
                                                {WAITING_FACTS[factIndex]}
                                            </Text>
                                        </View>
                                    </CardContent>
                                </Card>
                            )}

                            {aiResponse && (
                                <Card>
                                    <CardHeader>
                                        <View className="flex-row items-center justify-between">
                                            <CardTitle>AI Workout Plan</CardTitle>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onPress={handleSave}
                                                loading={isSaving}
                                            >
                                                Save Workout
                                            </Button>
                                        </View>
                                    </CardHeader>
                                    <CardContent>
                                        <Markdown style={markdownStyles}>{aiResponse}</Markdown>
                                    </CardContent>
                                </Card>
                            )}
                        </View>
                    )}

                    {activeTab === 'saved' && (
                        <View className="gap-4">
                            {data?.workoutPrograms && data.workoutPrograms.length > 0 ? (
                                data.workoutPrograms.map(program => (
                                    <Card key={program.id}>
                                        <TouchableOpacity
                                            onPress={() => setExpandedPlan(expandedPlan === program.id ? null : program.id)}
                                        >
                                            <CardHeader>
                                                <View className="flex-row items-center justify-between">
                                                    <View className="flex-1">
                                                        <CardTitle>{program.title}</CardTitle>
                                                        <View className="flex-row items-center mt-2">
                                                            <View className="bg-primary/10 px-2 py-1 rounded-full mr-2">
                                                                <Text className="text-primary text-xs">
                                                                    {program.difficulty}
                                                                </Text>
                                                            </View>
                                                            <Text className="text-muted-foreground text-sm">
                                                                {new Date(program.created_at).toLocaleDateString()}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                    <View className="flex-row items-center">
                                                        <TouchableOpacity
                                                            onPress={() => handleDelete(program.id)}
                                                            className="p-2 mr-2"
                                                        >
                                                            <Trash2 size={18} color="#ef4444" />
                                                        </TouchableOpacity>
                                                        {expandedPlan === program.id ? (
                                                            <ChevronUp size={20} color="#9ca3af" />
                                                        ) : (
                                                            <ChevronDown size={20} color="#9ca3af" />
                                                        )}
                                                    </View>
                                                </View>
                                            </CardHeader>
                                        </TouchableOpacity>
                                        {expandedPlan === program.id && (
                                            <CardContent>
                                                <Markdown style={markdownStyles}>
                                                    {program.description}
                                                </Markdown>
                                            </CardContent>
                                        )}
                                    </Card>
                                ))
                            ) : (
                                <Card>
                                    <CardContent className="py-8 items-center">
                                        <Dumbbell size={48} color="#9ca3af" />
                                        <Text className="text-muted-foreground mt-4 text-center">
                                            No saved workouts yet.{'\n'}Generate one to get started!
                                        </Text>
                                    </CardContent>
                                </Card>
                            )}
                        </View>
                    )}
                </ScrollView>
            </Animated.View>
        </SafeAreaView >
    );
}

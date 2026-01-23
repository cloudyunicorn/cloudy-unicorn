import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Flame, Sparkles, BookOpen, Trash2, ChevronDown, ChevronUp } from 'lucide-react-native';
import Markdown from 'react-native-markdown-display';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, TextArea } from '@/components/ui/Input';
import { LoadingScreen } from '@/components/ui/Spinner';
import { streamFitnessResponse, getMealPrompt } from '@/lib/ai-client';
import { FitnessContext } from '@/types/database';
import { markdownStyles } from '@/lib/markdown-styles';

// Fun facts to show while AI is thinking
const WAITING_FACTS = [
    "💪 Did you know? Muscle weighs more than fat by volume, so building muscle can increase weight while slimming you down!",
    "🥦 Fun fact: Broccoli has more protein per calorie than steak!",
    "🔥 Your body burns calories even while sleeping - about 50-100 calories per hour!",
    "💧 Drinking cold water can boost your metabolism by up to 30% for an hour.",
    "🏃 Just 30 minutes of walking can burn 100-300 calories depending on your pace!",
    "🍎 Apples are more effective at waking you up than coffee due to natural sugars and vitamins.",
    "🧠 Exercise promotes brain cell growth and improves memory.",
    "🥑 Avocados contain more potassium than bananas!",
    "💤 Getting 7-9 hours of sleep can help with weight management.",
    "🏋️ Strength training can boost your metabolism for up to 72 hours after your workout!",
    "🥗 Eating slowly can help you feel fuller with less food.",
    "🌶️ Spicy foods can temporarily boost metabolism by 8%!",
    "🎯 Setting specific fitness goals makes you 42% more likely to achieve them.",
    "🍋 Starting your day with lemon water can aid digestion.",
    "🧘 Just 10 minutes of stretching daily can improve flexibility significantly.",
];

export default function NutritionScreen() {
    const { data, isLoading, addMealPlan, removeMealPlan } = useData();
    const [activeTab, setActiveTab] = useState<'generate' | 'saved' | 'calories'>('generate');
    const [query, setQuery] = useState('');
    const [dietPreferences, setDietPreferences] = useState('balanced');
    const [aiResponse, setAiResponse] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isThinking, setIsThinking] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [expandedPlan, setExpandedPlan] = useState<string | null>(null);
    const [factIndex, setFactIndex] = useState(0);

    // Rotate fun facts every 10 seconds while thinking
    useEffect(() => {
        if (isThinking && !aiResponse) {
            // Set random fact when starting
            setFactIndex(Math.floor(Math.random() * WAITING_FACTS.length));
            const interval = setInterval(() => {
                setFactIndex(prev => (prev + 1) % WAITING_FACTS.length);
            }, 10000);
            return () => clearInterval(interval);
        }
    }, [isThinking]);


    if (isLoading && !data) {
        return <LoadingScreen text="Loading nutrition data..." />;
    }

    const buildContext = (): FitnessContext => ({
        diet: dietPreferences,
        goals: data?.goals?.map(g => g.toString()) || [],
        fitnessLevel: data?.profile?.fitness_level?.toLowerCase() || 'beginner',
        healthConditions: [],
        bodyMetrics: {
            age: data?.profile?.age || undefined,
            weight: data?.profile?.weight || undefined,
            height: data?.profile?.height || undefined,
            bodyFatPercentage: data?.profile?.body_fat_percentage || undefined,
            gender: data?.profile?.gender || undefined,
            targetWeight: data?.profile?.target_weight || undefined,
        },
    });

    const handleGenerate = async () => {
        if (!query.trim()) {
            Alert.alert('Error', 'Please enter what kind of meal plan you want');
            return;
        }

        setIsGenerating(true);
        setAiResponse('');
        setIsThinking(true);

        try {
            const context = buildContext();
            const prompt = getMealPrompt(context, query);

            streamFitnessResponse(
                prompt,
                context,
                (chunk) => setAiResponse(prev => prev + chunk),
                () => {
                    setIsGenerating(false);
                    setIsThinking(false);
                },
                (error) => {
                    Alert.alert('Error', 'Failed to generate meal plan. Please try again.');
                    console.error(error);
                    setIsGenerating(false);
                    setIsThinking(false);
                },
                (thinking) => setIsThinking(thinking)
            );
        } catch (error) {
            Alert.alert('Error', 'Failed to generate meal plan. Please try again.');
            console.error(error);
            setIsGenerating(false);
            setIsThinking(false);
        }
    };

    const handleSave = async () => {
        if (!aiResponse) return;

        setIsSaving(true);
        try {
            const title = `Meal Plan - ${new Date().toLocaleDateString()} `;
            const tags = dietPreferences.split(',').map(t => t.trim()).filter(Boolean);
            await addMealPlan(title, aiResponse, 2000, tags);
            Alert.alert('Success', 'Meal plan saved!');
            setAiResponse('');
            setQuery('');
        } catch (error: any) {
            console.error('Save meal plan error:', error);
            Alert.alert('Error', error?.message || 'Failed to save meal plan');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (planId: string) => {
        Alert.alert('Delete Plan', 'Are you sure you want to delete this meal plan?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await removeMealPlan(planId);
                    } catch (error) {
                        Alert.alert('Error', 'Failed to delete meal plan');
                    }
                },
            },
        ]);
    };

    const tabs = [
        { id: 'generate', label: 'AI Generate', icon: Sparkles },
        { id: 'saved', label: 'Saved Plans', icon: BookOpen },
        { id: 'calories', label: 'Calories', icon: Flame },
    ];

    return (
        <SafeAreaView className="flex-1 bg-background" edges={['top']}>
            <Animated.View entering={FadeIn.duration(300)} style={{ flex: 1 }}>
                {/* Header */}
                <View className="px-5 pt-4 pb-4">
                    <Text className="text-foreground text-2xl font-bold">Nutrition</Text>
                    <Text className="text-muted-foreground mt-1">AI-powered meal planning & tracking</Text>
                </View>

                {/* Tabs */}
                <View className="flex-row px-5 mb-4">
                    {tabs.map(tab => (
                        <TouchableOpacity
                            key={tab.id}
                            onPress={() => setActiveTab(tab.id as any)}
                            className={`flex-1 flex-row items-center justify-center py-3 rounded-xl mr-2 ${activeTab === tab.id ? 'bg-primary' : 'bg-card border border-border'}`}
                        >
                            <tab.icon
                                size={16}
                                color={activeTab === tab.id ? '#fff' : '#9ca3af'}
                            />
                            <Text
                                className={`ml-2 font-medium text-sm ${activeTab === tab.id ? 'text-primary-foreground' : 'text-muted-foreground'}`}
                            >
                                {tab.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <ScrollView
                    className="flex-1 px-5"
                    contentContainerStyle={{ paddingBottom: 100 }}
                >
                    {activeTab === 'generate' && (
                        <View className="gap-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>AI Meal Planner</CardTitle>
                                </CardHeader>
                                <CardContent className="gap-4">
                                    <Input
                                        label="Dietary Preferences"
                                        value={dietPreferences}
                                        onChangeText={setDietPreferences}
                                        placeholder="e.g., vegetarian, high-protein, low-carb"
                                    />
                                    <TextArea
                                        label="What are you looking for?"
                                        value={query}
                                        onChangeText={setQuery}
                                        placeholder="E.g., 'High protein breakfast ideas for muscle gain' or 'Quick healthy lunch under 500 calories'"
                                    />
                                    <Button
                                        onPress={handleGenerate}
                                        loading={isGenerating}
                                        disabled={isGenerating}
                                    >
                                        {isGenerating ? (isThinking ? 'AI is thinking...' : 'Generating...') : 'Generate Meal Plan'}
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Thinking indicator with rotating facts */}
                            {isGenerating && isThinking && !aiResponse && (
                                <Card>
                                    <CardContent className="py-6">
                                        <View className="items-center mb-4">
                                            <Text className="text-primary text-lg font-semibold">
                                                ✨ AI is crafting your meal plan...
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
                                            <CardTitle>AI Suggestion</CardTitle>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onPress={handleSave}
                                                loading={isSaving}
                                            >
                                                Save Plan
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
                            {data?.mealPlans && data.mealPlans.length > 0 ? (
                                data.mealPlans.map(plan => (
                                    <Card key={plan.id}>
                                        <TouchableOpacity
                                            onPress={() => setExpandedPlan(expandedPlan === plan.id ? null : plan.id)}
                                        >
                                            <CardHeader>
                                                <View className="flex-row items-center justify-between">
                                                    <View className="flex-1">
                                                        <CardTitle>{plan.title}</CardTitle>
                                                        <Text className="text-muted-foreground text-sm mt-1">
                                                            {new Date(plan.created_at).toLocaleDateString()}
                                                        </Text>
                                                    </View>
                                                    <View className="flex-row items-center">
                                                        <TouchableOpacity
                                                            onPress={() => handleDelete(plan.id)}
                                                            className="p-2 mr-2"
                                                        >
                                                            <Trash2 size={18} color="#ef4444" />
                                                        </TouchableOpacity>
                                                        {expandedPlan === plan.id ? (
                                                            <ChevronUp size={20} color="#9ca3af" />
                                                        ) : (
                                                            <ChevronDown size={20} color="#9ca3af" />
                                                        )}
                                                    </View>
                                                </View>
                                            </CardHeader>
                                        </TouchableOpacity>
                                        {expandedPlan === plan.id && (
                                            <CardContent>
                                                <Markdown style={markdownStyles}>
                                                    {plan.description}
                                                </Markdown>
                                                {plan.dietary_tags && plan.dietary_tags.length > 0 && (
                                                    <View className="flex-row flex-wrap gap-2 mt-4">
                                                        {plan.dietary_tags.map((tag, i) => (
                                                            <View key={i} className="bg-primary/10 px-3 py-1 rounded-full">
                                                                <Text className="text-primary text-xs">{tag}</Text>
                                                            </View>
                                                        ))}
                                                    </View>
                                                )}
                                            </CardContent>
                                        )}
                                    </Card>
                                ))
                            ) : (
                                <Card>
                                    <CardContent className="py-8 items-center">
                                        <BookOpen size={48} color="#9ca3af" />
                                        <Text className="text-muted-foreground mt-4 text-center">
                                            No saved meal plans yet.{'\n'}Generate one to get started!
                                        </Text>
                                    </CardContent>
                                </Card>
                            )}
                        </View>
                    )}

                    {activeTab === 'calories' && (
                        <CalorieTracker data={data} />
                    )}
                </ScrollView>
            </Animated.View>
        </SafeAreaView>
    );
}

// Sub-component for calorie tracking
function CalorieTracker({ data }: { data: any }) {
    const { addCalorieLog, removeCalorieLog } = useData();
    const [food, setFood] = useState('');
    const [calories, setCalories] = useState('');
    const [mealType, setMealType] = useState('BREAKFAST');
    const [isLogging, setIsLogging] = useState(false);

    const handleLog = async () => {
        if (!food.trim() || !calories) {
            Alert.alert('Error', 'Please enter food and calories');
            return;
        }

        setIsLogging(true);
        try {
            await addCalorieLog(mealType, food, parseInt(calories), '');
            setFood('');
            setCalories('');
            Alert.alert('Success', 'Calorie entry logged!');
        } catch (error) {
            Alert.alert('Error', 'Failed to log calories');
        } finally {
            setIsLogging(false);
        }
    };

    const todayLogs = data?.calorieLogs?.filter((log: any) => {
        const logDate = new Date(log.date).toDateString();
        const today = new Date().toDateString();
        return logDate === today;
    }) || [];

    const totalCalories = todayLogs.reduce((sum: number, log: any) => sum + log.calories, 0);

    const mealTypes = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'];

    return (
        <View className="gap-4">
            {/* Today's Summary */}
            <Card>
                <CardContent className="py-4">
                    <Text className="text-muted-foreground text-sm">Today's Total</Text>
                    <Text className="text-foreground text-3xl font-bold mt-1">
                        {totalCalories} <Text className="text-lg font-normal">kcal</Text>
                    </Text>
                </CardContent>
            </Card>

            {/* Log Form */}
            <Card>
                <CardHeader>
                    <CardTitle>Log Food</CardTitle>
                </CardHeader>
                <CardContent className="gap-4">
                    <View className="flex-row flex-wrap gap-2">
                        {mealTypes.map(type => (
                            <TouchableOpacity
                                key={type}
                                onPress={() => setMealType(type)}
                                className={`px - 4 py - 2 rounded - full ${mealType === type ? 'bg-primary' : 'bg-card border border-border'
                                    } `}
                            >
                                <Text className={mealType === type ? 'text-white font-medium' : 'text-muted-foreground'}>
                                    {type.charAt(0) + type.slice(1).toLowerCase()}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <Input
                        label="Food"
                        value={food}
                        onChangeText={setFood}
                        placeholder="e.g., Chicken salad"
                    />
                    <Input
                        label="Calories"
                        value={calories}
                        onChangeText={setCalories}
                        placeholder="e.g., 350"
                        keyboardType="numeric"
                    />
                    <Button onPress={handleLog} loading={isLogging}>
                        Log Entry
                    </Button>
                </CardContent>
            </Card>

            {/* Today's Entries */}
            {todayLogs.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Today's Entries</CardTitle>
                    </CardHeader>
                    <CardContent className="py-0">
                        {todayLogs.map((log: any, index: number) => (
                            <View
                                key={log.id}
                                className={`flex - row items - center py - 3 ${index < todayLogs.length - 1 ? 'border-b border-border' : ''
                                    } `}
                            >
                                <View className="flex-1">
                                    <Text className="text-foreground font-medium">{log.food}</Text>
                                    <Text className="text-muted-foreground text-sm">
                                        {log.meal_type.charAt(0) + log.meal_type.slice(1).toLowerCase()}
                                    </Text>
                                </View>
                                <Text className="text-foreground font-semibold mr-3">
                                    {log.calories} kcal
                                </Text>
                                <TouchableOpacity
                                    onPress={() => {
                                        Alert.alert('Delete', 'Remove this entry?', [
                                            { text: 'Cancel', style: 'cancel' },
                                            { text: 'Delete', style: 'destructive', onPress: () => removeCalorieLog(log.id) },
                                        ]);
                                    }}
                                >
                                    <Trash2 size={16} color="#ef4444" />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </CardContent>
                </Card>
            )}
        </View>
    );
}

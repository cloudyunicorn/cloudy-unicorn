import { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Dimensions, FlatList, ViewToken } from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Apple, Dumbbell, ClipboardCheck, BarChart, Sparkles, ArrowRight } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const onboardingData = [
    {
        id: '1',
        icon: Apple,
        title: 'Personalized Meal Plans',
        description: 'Tailored nutrition guides based on your goals and preferences.',
        gradient: 'bg-emerald-500',
    },
    {
        id: '2',
        icon: Dumbbell,
        title: 'Custom Workout Programs',
        description: 'Exercise routines designed for your fitness level and schedule.',
        gradient: 'bg-blue-500',
    },
    {
        id: '3',
        icon: ClipboardCheck,
        title: 'Habit-Changing Challenges',
        description: 'Daily and weekly challenges to build lasting healthy habits.',
        gradient: 'bg-purple-500',
    },
    {
        id: '4',
        icon: BarChart,
        title: 'Progress Tracking',
        description: 'Monitor workouts, meals, and habits with intuitive charts.',
        gradient: 'bg-pink-500',
    },
];

export default function OnboardingScreen() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);

    const viewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
        if (viewableItems.length > 0 && viewableItems[0].index !== null) {
            setCurrentIndex(viewableItems[0].index);
        }
    }).current;

    const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

    const handleNext = () => {
        if (currentIndex < onboardingData.length - 1) {
            flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
        }
    };

    const isLastSlide = currentIndex === onboardingData.length - 1;

    const renderItem = ({ item }: { item: typeof onboardingData[0] }) => {
        const IconComponent = item.icon;
        return (
            <View style={{ width }} className="flex-1 items-center justify-center px-8">
                <View className={`w-28 h-28 rounded-full items-center justify-center mb-8 ${item.gradient}`}>
                    <IconComponent size={48} color="white" strokeWidth={1.5} />
                </View>
                <Text className="text-3xl font-bold text-foreground text-center mb-4">
                    {item.title}
                </Text>
                <Text className="text-lg text-muted-foreground text-center max-w-xs">
                    {item.description}
                </Text>
            </View>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-background">
            {/* Header */}
            <View className="flex-row items-center justify-center pt-8 pb-4">
                <View className="w-10 h-10 bg-primary rounded-full items-center justify-center mr-2">
                    <Sparkles size={20} color="white" />
                </View>
                <Text className="text-xl font-bold text-foreground">Cloudy Unicorn</Text>
            </View>

            {/* Tagline */}
            <Text className="text-sm text-muted-foreground text-center mb-4">
                Your Ultimate Fitness Companion
            </Text>

            {/* Onboarding Carousel */}
            <FlatList
                ref={flatListRef}
                data={onboardingData}
                renderItem={renderItem}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                onViewableItemsChanged={viewableItemsChanged}
                viewabilityConfig={viewConfig}
                className="flex-1"
            />

            {/* Pagination Dots */}
            <View className="flex-row justify-center mb-8">
                {onboardingData.map((_, index) => (
                    <View
                        key={index}
                        className={`h-2 mx-1 rounded-full ${index === currentIndex ? 'w-8 bg-primary' : 'w-2 bg-muted'
                            }`}
                    />
                ))}
            </View>

            {/* Buttons */}
            <View className="px-6 pb-8 space-y-3">
                {isLastSlide ? (
                    <>
                        <Link href="/(auth)/register" asChild>
                            <TouchableOpacity className="w-full bg-primary py-4 rounded-xl flex-row items-center justify-center">
                                <Text className="text-primary-foreground font-bold text-lg mr-2">
                                    Get Started Free
                                </Text>
                                <ArrowRight size={20} color="white" />
                            </TouchableOpacity>
                        </Link>
                        <Link href="/(auth)/login" asChild>
                            <TouchableOpacity className="w-full bg-secondary py-4 rounded-xl border border-border">
                                <Text className="text-secondary-foreground text-center font-bold text-lg">
                                    Sign In
                                </Text>
                            </TouchableOpacity>
                        </Link>
                    </>
                ) : (
                    <>
                        <TouchableOpacity
                            onPress={handleNext}
                            className="w-full bg-primary py-4 rounded-xl flex-row items-center justify-center"
                        >
                            <Text className="text-primary-foreground font-bold text-lg mr-2">
                                Next
                            </Text>
                            <ArrowRight size={20} color="white" />
                        </TouchableOpacity>
                        <Link href="/(auth)/login" asChild>
                            <TouchableOpacity className="py-4">
                                <Text className="text-muted-foreground text-center">
                                    Already have an account? <Text className="text-primary font-semibold">Sign In</Text>
                                </Text>
                            </TouchableOpacity>
                        </Link>
                    </>
                )}
            </View>
        </SafeAreaView>
    );
}

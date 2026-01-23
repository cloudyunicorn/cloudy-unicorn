import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TrendingUp, Scale, Activity, Plus, Sparkles } from 'lucide-react-native';
import Svg, { Path, Circle, Line, Text as SvgText } from 'react-native-svg';
import Markdown from 'react-native-markdown-display';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, TextArea } from '@/components/ui/Input';
import { LoadingScreen } from '@/components/ui/Spinner';
import { ProgressType } from '@/types/database';
import { getFitnessResponse, getHealthAssessmentPrompt } from '@/lib/ai-client';
import { markdownStyles } from '@/lib/markdown-styles';


const screenWidth = Dimensions.get('window').width;

export default function ProgressScreen() {
    const { data, isLoading, addProgressLog } = useData();
    const [activeTab, setActiveTab] = useState<'chart' | 'log' | 'assessment'>('chart');
    const [logType, setLogType] = useState<ProgressType>(ProgressType.WEIGHT);
    const [logValue, setLogValue] = useState('');
    const [logNotes, setLogNotes] = useState('');
    const [isLogging, setIsLogging] = useState(false);
    const [assessmentQuery, setAssessmentQuery] = useState('');
    const [assessmentResponse, setAssessmentResponse] = useState('');
    const [isAssessing, setIsAssessing] = useState(false);

    if (isLoading && !data) {
        return <LoadingScreen text="Loading progress data..." />;
    }

    const handleLogProgress = async () => {
        const value = parseFloat(logValue);
        if (isNaN(value) || value <= 0) {
            Alert.alert('Error', 'Please enter a valid value');
            return;
        }

        setIsLogging(true);
        try {
            await addProgressLog(logType, value, logNotes);
            Alert.alert('Success', 'Progress logged!');
            setLogValue('');
            setLogNotes('');
            setActiveTab('chart');
        } catch (error: any) {
            console.error('Log progress error:', error);
            Alert.alert('Error', error?.message || 'Failed to log progress');
        } finally {
            setIsLogging(false);
        }
    };

    const handleAssessment = async () => {
        setIsAssessing(true);
        setAssessmentResponse('');

        try {
            const context = {
                diet: '',
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
            };
            const prompt = getHealthAssessmentPrompt(context, assessmentQuery || 'Give me a health assessment');
            const stream = getFitnessResponse(prompt, context);

            for await (const chunk of stream) {
                setAssessmentResponse(prev => prev + chunk);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to get assessment');
        } finally {
            setIsAssessing(false);
        }
    };

    // Chart data processing
    const weightLogs = useMemo(() => {
        return (data?.progressLogs || [])
            .filter(log => log.type === 'WEIGHT')
            .sort((a, b) => new Date(a.logged_at).getTime() - new Date(b.logged_at).getTime())
            .slice(-10);
    }, [data?.progressLogs]);

    const tabs = [
        { id: 'chart', label: 'Progress', icon: TrendingUp },
        { id: 'log', label: 'Log Entry', icon: Plus },
        { id: 'assessment', label: 'Assessment', icon: Sparkles },
    ];

    return (
        <SafeAreaView className="flex-1 bg-background" edges={['top']}>
            <Animated.View entering={FadeIn.duration(300)} style={{ flex: 1 }}>
                {/* Header */}
                <View className="px-5 pt-4 pb-4">
                    <Text className="text-foreground text-2xl font-bold">Progress</Text>
                    <Text className="text-muted-foreground mt-1">Track your fitness journey</Text>
                </View>

                {/* Tabs */}
                <View className="flex-row px-5 mb-4">
                    {tabs.map(tab => (
                        <TouchableOpacity
                            key={tab.id}
                            onPress={() => setActiveTab(tab.id as any)}
                            className={`flex-1 flex-row items-center justify-center py-3 rounded-xl mr-2 last:mr-0 ${activeTab === tab.id ? 'bg-primary' : 'bg-card border border-border'
                                }`}
                        >
                            <tab.icon size={16} color={activeTab === tab.id ? '#fff' : '#9ca3af'} />
                            <Text className={`ml-2 font-medium text-sm ${activeTab === tab.id ? 'text-primary-foreground' : 'text-muted-foreground'
                                }`}>
                                {tab.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <ScrollView
                    className="flex-1 px-5"
                    contentContainerStyle={{ paddingBottom: 100 }}
                >
                    {activeTab === 'chart' && (
                        <View className="gap-4">
                            {/* Stats Summary */}
                            <View className="flex-row gap-3">
                                <Card className="flex-1">
                                    <CardContent className="py-4">
                                        <View className="flex-row items-center mb-2">
                                            <Scale size={18} color="#8b5cf6" />
                                            <Text className="text-muted-foreground text-xs ml-2">Current</Text>
                                        </View>
                                        <Text className="text-foreground text-xl font-bold">
                                            {data?.stats?.latestWeightLog?.value || data?.profile?.weight || '--'} kg
                                        </Text>
                                    </CardContent>
                                </Card>
                                <Card className="flex-1">
                                    <CardContent className="py-4">
                                        <View className="flex-row items-center mb-2">
                                            <Activity size={18} color="#10b981" />
                                            <Text className="text-muted-foreground text-xs ml-2">Target</Text>
                                        </View>
                                        <Text className="text-foreground text-xl font-bold">
                                            {data?.profile?.target_weight || '--'} kg
                                        </Text>
                                    </CardContent>
                                </Card>
                            </View>

                            {/* Weight Chart */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Weight Trend</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {weightLogs.length > 1 ? (
                                        <ProgressChart data={weightLogs} />
                                    ) : (
                                        <View className="py-8 items-center">
                                            <TrendingUp size={48} color="#9ca3af" />
                                            <Text className="text-muted-foreground mt-4 text-center">
                                                Log at least 2 entries{'\n'}to see your progress chart
                                            </Text>
                                        </View>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Recent Logs */}
                            {data?.progressLogs && data.progressLogs.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Recent Logs</CardTitle>
                                    </CardHeader>
                                    <CardContent className="py-0">
                                        {data.progressLogs.slice(0, 5).map((log, index) => (
                                            <View
                                                key={log.id}
                                                className={`flex-row items-center py-3 ${index < 4 ? 'border-b border-border' : ''
                                                    }`}
                                            >
                                                <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center mr-3">
                                                    {log.type === 'WEIGHT' ? (
                                                        <Scale size={18} color="#8b5cf6" />
                                                    ) : (
                                                        <Activity size={18} color="#8b5cf6" />
                                                    )}
                                                </View>
                                                <View className="flex-1">
                                                    <Text className="text-foreground font-medium">
                                                        {log.type === 'WEIGHT' ? 'Weight' : 'Body Fat'}
                                                    </Text>
                                                    <Text className="text-muted-foreground text-sm">
                                                        {new Date(log.logged_at).toLocaleDateString()}
                                                    </Text>
                                                </View>
                                                <Text className="text-foreground font-semibold">
                                                    {log.value} {log.type === 'WEIGHT' ? 'kg' : '%'}
                                                </Text>
                                            </View>
                                        ))}
                                    </CardContent>
                                </Card>
                            )}
                        </View>
                    )}

                    {activeTab === 'log' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Log Progress</CardTitle>
                            </CardHeader>
                            <CardContent className="gap-4">
                                <View>
                                    <Text className="text-sm font-medium text-foreground mb-2">Type</Text>
                                    <View className="flex-row gap-2">
                                        <TouchableOpacity
                                            onPress={() => setLogType(ProgressType.WEIGHT)}
                                            className={`flex-1 py-3 rounded-xl items-center ${logType === ProgressType.WEIGHT ? 'bg-primary' : 'bg-card border border-border'
                                                }`}
                                        >
                                            <Text className={logType === ProgressType.WEIGHT ? 'text-white font-medium' : 'text-muted-foreground'}>
                                                Weight (kg)
                                            </Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={() => setLogType(ProgressType.BODY_FAT)}
                                            className={`flex-1 py-3 rounded-xl items-center ${logType === ProgressType.BODY_FAT ? 'bg-primary' : 'bg-card border border-border'
                                                }`}
                                        >
                                            <Text className={logType === ProgressType.BODY_FAT ? 'text-white font-medium' : 'text-muted-foreground'}>
                                                Body Fat (%)
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                <Input
                                    label={logType === ProgressType.WEIGHT ? 'Weight (kg)' : 'Body Fat (%)'}
                                    value={logValue}
                                    onChangeText={setLogValue}
                                    placeholder={logType === ProgressType.WEIGHT ? 'e.g., 75.5' : 'e.g., 18.5'}
                                    keyboardType="decimal-pad"
                                />
                                <TextArea
                                    label="Notes (optional)"
                                    value={logNotes}
                                    onChangeText={setLogNotes}
                                    placeholder="Any notes about this measurement..."
                                />
                                <Button onPress={handleLogProgress} loading={isLogging}>
                                    Log Progress
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {activeTab === 'assessment' && (
                        <View className="gap-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>AI Health Assessment</CardTitle>
                                </CardHeader>
                                <CardContent className="gap-4">
                                    <TextArea
                                        label="What would you like assessed?"
                                        value={assessmentQuery}
                                        onChangeText={setAssessmentQuery}
                                        placeholder="E.g., 'Assess my current body composition' or leave empty for a general assessment"
                                    />
                                    <Button onPress={handleAssessment} loading={isAssessing}>
                                        {isAssessing ? 'Analyzing...' : 'Get Assessment'}
                                    </Button>
                                </CardContent>
                            </Card>

                            {assessmentResponse && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Your Assessment</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <Markdown style={markdownStyles}>{assessmentResponse}</Markdown>
                                    </CardContent>
                                </Card>
                            )}
                        </View>
                    )}
                </ScrollView>
            </Animated.View>
        </SafeAreaView>
    );
}

// Simple line chart component
function ProgressChart({ data }: { data: any[] }) {
    const chartWidth = screenWidth - 80;
    const chartHeight = 180;
    const padding = 20;

    const values = data.map(d => d.value);
    const minValue = Math.min(...values) - 2;
    const maxValue = Math.max(...values) + 2;
    const range = maxValue - minValue;

    const points = data.map((d, i) => ({
        x: padding + (i / (data.length - 1)) * (chartWidth - padding * 2),
        y: chartHeight - padding - ((d.value - minValue) / range) * (chartHeight - padding * 2),
        value: d.value,
        date: new Date(d.logged_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    }));

    const pathData = points
        .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
        .join(' ');

    return (
        <View>
            <Svg width={chartWidth} height={chartHeight}>
                {/* Grid lines */}
                {[0, 1, 2, 3].map(i => (
                    <Line
                        key={i}
                        x1={padding}
                        y1={padding + (i / 3) * (chartHeight - padding * 2)}
                        x2={chartWidth - padding}
                        y2={padding + (i / 3) * (chartHeight - padding * 2)}
                        stroke="#374151"
                        strokeWidth={0.5}
                    />
                ))}

                {/* Line path */}
                <Path
                    d={pathData}
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    fill="none"
                />

                {/* Data points */}
                {points.map((p, i) => (
                    <Circle
                        key={i}
                        cx={p.x}
                        cy={p.y}
                        r={4}
                        fill="#8b5cf6"
                    />
                ))}
            </Svg>

            {/* X-axis labels */}
            <View className="flex-row justify-between px-5 mt-2">
                {points.filter((_, i) => i === 0 || i === points.length - 1).map((p, i) => (
                    <Text key={i} className="text-muted-foreground text-xs">{p.date}</Text>
                ))}
            </View>
        </View>
    );
}

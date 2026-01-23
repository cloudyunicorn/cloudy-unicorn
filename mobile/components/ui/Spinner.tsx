import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { clsx } from 'clsx';

interface SpinnerProps {
    size?: 'small' | 'large';
    color?: string;
    className?: string;
    text?: string;
}

export function Spinner({
    size = 'large',
    color = '#8b5cf6',
    className,
    text
}: SpinnerProps) {
    return (
        <View className={clsx('items-center justify-center', className)}>
            <ActivityIndicator size={size} color={color} />
            {text && (
                <Text className="text-muted-foreground mt-2 text-sm">{text}</Text>
            )}
        </View>
    );
}

interface LoadingScreenProps {
    text?: string;
}

export function LoadingScreen({ text = 'Loading...' }: LoadingScreenProps) {
    return (
        <View className="flex-1 items-center justify-center bg-background">
            <Spinner size="large" text={text} />
        </View>
    );
}

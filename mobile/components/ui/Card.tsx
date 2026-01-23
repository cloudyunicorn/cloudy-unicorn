import React, { ReactNode } from 'react';
import { View, Text, ViewStyle } from 'react-native';
import { clsx } from 'clsx';

interface CardProps {
    children: ReactNode;
    className?: string;
    style?: ViewStyle;
}

export function Card({ children, className, style }: CardProps) {
    return (
        <View
            className={clsx(
                'bg-card rounded-2xl border border-border overflow-hidden',
                className
            )}
            style={style}
        >
            {children}
        </View>
    );
}

interface CardHeaderProps {
    children: ReactNode;
    className?: string;
}

export function CardHeader({ children, className }: CardHeaderProps) {
    return (
        <View className={clsx('px-4 pt-4 pb-2', className)}>
            {children}
        </View>
    );
}

interface CardTitleProps {
    children: ReactNode;
    className?: string;
}

export function CardTitle({ children, className }: CardTitleProps) {
    return (
        <Text className={clsx('text-lg font-bold text-card-foreground', className)}>
            {children}
        </Text>
    );
}

interface CardDescriptionProps {
    children: ReactNode;
    className?: string;
}

export function CardDescription({ children, className }: CardDescriptionProps) {
    return (
        <Text className={clsx('text-sm text-muted-foreground mt-1', className)}>
            {children}
        </Text>
    );
}

interface CardContentProps {
    children: ReactNode;
    className?: string;
}

export function CardContent({ children, className }: CardContentProps) {
    return (
        <View className={clsx('px-4 py-3', className)}>
            {children}
        </View>
    );
}

interface CardFooterProps {
    children: ReactNode;
    className?: string;
}

export function CardFooter({ children, className }: CardFooterProps) {
    return (
        <View className={clsx('px-4 pb-4 pt-2 flex-row', className)}>
            {children}
        </View>
    );
}

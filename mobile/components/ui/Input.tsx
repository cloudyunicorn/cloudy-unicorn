import React from 'react';
import { View, Text, TextInput, TextInputProps, ViewStyle } from 'react-native';
import { clsx } from 'clsx';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    containerClassName?: string;
    containerStyle?: ViewStyle;
}

export function Input({
    label,
    error,
    containerClassName,
    containerStyle,
    className,
    ...props
}: InputProps) {
    return (
        <View className={clsx('space-y-2', containerClassName)} style={containerStyle}>
            {label && (
                <Text className="text-sm font-medium text-foreground mb-1.5">
                    {label}
                </Text>
            )}
            <TextInput
                className={clsx(
                    'bg-input border border-border rounded-xl px-4 py-3 text-base text-foreground',
                    error && 'border-destructive',
                    className
                )}
                placeholderTextColor="#9ca3af"
                {...props}
            />
            {error && (
                <Text className="text-sm text-destructive mt-1">
                    {error}
                </Text>
            )}
        </View>
    );
}

interface TextAreaProps extends TextInputProps {
    label?: string;
    error?: string;
    containerClassName?: string;
}

export function TextArea({
    label,
    error,
    containerClassName,
    className,
    ...props
}: TextAreaProps) {
    return (
        <View className={clsx('space-y-2', containerClassName)}>
            {label && (
                <Text className="text-sm font-medium text-foreground mb-1.5">
                    {label}
                </Text>
            )}
            <TextInput
                multiline
                textAlignVertical="top"
                className={clsx(
                    'bg-input border border-border rounded-xl px-4 py-3 text-base text-foreground min-h-[120px]',
                    error && 'border-destructive',
                    className
                )}
                placeholderTextColor="#9ca3af"
                {...props}
            />
            {error && (
                <Text className="text-sm text-destructive mt-1">
                    {error}
                </Text>
            )}
        </View>
    );
}

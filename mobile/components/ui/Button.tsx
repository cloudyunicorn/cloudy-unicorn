import React from 'react';
import { View, Text, Pressable, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { clsx } from 'clsx';

interface ButtonProps {
    onPress: () => void;
    children: React.ReactNode;
    variant?: 'default' | 'secondary' | 'outline' | 'destructive' | 'ghost';
    size?: 'default' | 'sm' | 'lg';
    disabled?: boolean;
    loading?: boolean;
    className?: string;
    style?: ViewStyle;
}

export function Button({
    onPress,
    children,
    variant = 'default',
    size = 'default',
    disabled = false,
    loading = false,
    className,
    style,
}: ButtonProps) {
    const baseStyles = 'flex-row items-center justify-center rounded-xl';

    const variantStyles = {
        default: 'bg-primary',
        secondary: 'bg-secondary',
        outline: 'border-2 border-border bg-transparent',
        destructive: 'bg-destructive',
        ghost: 'bg-transparent',
    };

    const sizeStyles = {
        default: 'px-6 py-3',
        sm: 'px-4 py-2',
        lg: 'px-8 py-4',
    };

    const textVariantStyles = {
        default: 'text-primary-foreground',
        secondary: 'text-secondary-foreground',
        outline: 'text-foreground',
        destructive: 'text-destructive-foreground',
        ghost: 'text-foreground',
    };

    const textSizeStyles = {
        default: 'text-base',
        sm: 'text-sm',
        lg: 'text-lg',
    };

    return (
        <Pressable
            onPress={onPress}
            disabled={disabled || loading}
            className={clsx(
                baseStyles,
                variantStyles[variant],
                sizeStyles[size],
                (disabled || loading) && 'opacity-50',
                className
            )}
            style={[{ minHeight: size === 'sm' ? 36 : size === 'lg' ? 56 : 44 }, style]}
        >
            {loading ? (
                <ActivityIndicator
                    size="small"
                    color={variant === 'outline' || variant === 'ghost' ? '#666' : '#fff'}
                />
            ) : typeof children === 'string' ? (
                <Text className={clsx('font-semibold', textVariantStyles[variant], textSizeStyles[size])}>
                    {children}
                </Text>
            ) : (
                children
            )}
        </Pressable>
    );
}

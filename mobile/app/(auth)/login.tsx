import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import { supabase } from '@/lib/supabase';

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginScreen() {
    const [loading, setLoading] = useState(false);
    const { control, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormData) => {
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({
            email: data.email,
            password: data.password,
        });
        setLoading(false);

        if (error) {
            Alert.alert('Login Failed', error.message);
        }
    };

    return (
        <View className="flex-1 justify-center items-center bg-gray-50 p-6 dark:bg-gray-900">
            <View className="w-full max-w-sm">
                <Text className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
                    Welcome Back
                </Text>

                <View className="space-y-4">
                    <View>
                        <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</Text>
                        <Controller
                            control={control}
                            name="email"
                            render={({ field: { onChange, value } }) => (
                                <TextInput
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                    placeholder="you@example.com"
                                    placeholderTextColor="#9CA3AF"
                                    autoCapitalize="none"
                                    value={value}
                                    onChangeText={onChange}
                                />
                            )}
                        />
                        {errors.email && <Text className="text-red-500 text-xs mt-1">{errors.email.message}</Text>}
                    </View>

                    <View>
                        <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</Text>
                        <Controller
                            control={control}
                            name="password"
                            render={({ field: { onChange, value } }) => (
                                <TextInput
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                    placeholder="••••••••"
                                    placeholderTextColor="#9CA3AF"
                                    secureTextEntry
                                    value={value}
                                    onChangeText={onChange}
                                />
                            )}
                        />
                        {errors.password && <Text className="text-red-500 text-xs mt-1">{errors.password.message}</Text>}
                    </View>

                    <TouchableOpacity
                        className={`w-full bg-indigo-600 py-3 rounded-lg ${loading ? 'opacity-70' : ''}`}
                        onPress={handleSubmit(onSubmit)}
                        disabled={loading}
                    >
                        <Text className="text-white text-center font-semibold">
                            {loading ? 'Signing in...' : 'Sign In'}
                        </Text>
                    </TouchableOpacity>
                </View>

                <View className="mt-6 flex-row justify-center">
                    <Text className="text-gray-600 dark:text-gray-400">Don't have an account? </Text>
                    <Link href="/(auth)/register" asChild>
                        <TouchableOpacity>
                            <Text className="text-indigo-600 dark:text-indigo-400 font-semibold">Sign Up</Text>
                        </TouchableOpacity>
                    </Link>
                </View>
            </View>
        </View>
    );
}

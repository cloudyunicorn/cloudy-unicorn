import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';

const registerSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterScreen() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { control, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data: RegisterFormData) => {
        setLoading(true);
        const { error } = await supabase.auth.signUp({
            email: data.email,
            password: data.password,
        });
        setLoading(false);

        if (error) {
            Alert.alert('Registration Failed', error.message);
        } else {
            Alert.alert('Success', 'Check your email to verify your account.');
            router.replace('/(auth)/login');
        }
    };

    return (
        <View className="flex-1 justify-center items-center bg-gray-50 p-6 dark:bg-gray-900">
            <View className="w-full max-w-sm">
                <Text className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
                    Create Account
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

                    <View>
                        <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm Password</Text>
                        <Controller
                            control={control}
                            name="confirmPassword"
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
                        {errors.confirmPassword && <Text className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</Text>}
                    </View>

                    <TouchableOpacity
                        className={`w-full bg-indigo-600 py-3 rounded-lg ${loading ? 'opacity-70' : ''}`}
                        onPress={handleSubmit(onSubmit)}
                        disabled={loading}
                    >
                        <Text className="text-white text-center font-semibold">
                            {loading ? 'Creating account...' : 'Sign Up'}
                        </Text>
                    </TouchableOpacity>
                </View>

                <View className="mt-6 flex-row justify-center">
                    <Text className="text-gray-600 dark:text-gray-400">Already have an account? </Text>
                    <Link href="/(auth)/login" asChild>
                        <TouchableOpacity>
                            <Text className="text-indigo-600 dark:text-indigo-400 font-semibold">Sign In</Text>
                        </TouchableOpacity>
                    </Link>
                </View>
            </View>
        </View>
    );
}

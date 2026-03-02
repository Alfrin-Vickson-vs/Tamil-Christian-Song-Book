import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../utils/supabase';
import { router } from 'expo-router';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleLogin() {
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            Alert.alert('Login Failed', error.message);
            setLoading(false);
        } else {
            router.replace('/(tabs)');
        }
    }

    return (
        <View className="flex-1">
            <LinearGradient
                colors={['#ffffff', '#f1f5f9']}
                className="flex-1 justify-center px-6"
            >
                <View className="items-center mb-10">
                    <Text className="text-3xl font-bold text-gray-900 mb-2">Welcome</Text>
                    <Text className="text-base text-gray-500 text-center">
                        Tamil Christian Song Book
                    </Text>
                </View>

                <View className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <View className="mb-4">
                        <Text className="text-sm font-medium text-gray-700 mb-1">Email</Text>
                        <TextInput
                            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900"
                            placeholder="Enter your email"
                            autoCapitalize="none"
                            keyboardType="email-address"
                            value={email}
                            onChangeText={setEmail}
                        />
                    </View>

                    <View className="mb-6">
                        <Text className="text-sm font-medium text-gray-700 mb-1">Password</Text>
                        <TextInput
                            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900"
                            placeholder="Enter your password"
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                        />
                    </View>

                    <TouchableOpacity
                        className="bg-primary-dark py-4 rounded-xl items-center shadow-md mb-4 flex-row justify-center"
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        {loading ? <ActivityIndicator color="#fff" className="mr-2" /> : null}
                        <Text className="text-white font-semibold text-base">Sign In</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="py-2 items-center"
                        onPress={() => router.replace('/(tabs)')}
                    >
                        <Text className="text-primary-dark font-medium">Continue as Guest</Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        </View>
    );
}

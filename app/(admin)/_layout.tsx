import React from 'react';
import { Stack, Redirect } from 'expo-router';
import { useAuthStore } from '../../store/auth';
import { ActivityIndicator, View } from 'react-native';

export default function AdminLayout() {
    const { user, role, isLoading } = useAuthStore();

    if (isLoading) {
        return (
            <View className="flex-1 items-center justify-center bg-background-light dark:bg-background-dark">
                <ActivityIndicator size="large" color="#6366f1" />
            </View>
        );
    }

    // Double check protection: If user is not logged in, or not an admin, redirect them out
    if (!user || role !== 'admin') {
        return <Redirect href="/(tabs)" />;
    }

    return (
        <Stack>
            <Stack.Screen name="index" options={{ title: 'Admin Dashboard', headerBackTitle: 'Home' }} />
            <Stack.Screen name="songs/index" options={{ title: 'Manage Songs' }} />
            <Stack.Screen name="songs/edit" options={{ title: 'Edit Song', presentation: 'modal' }} />
        </Stack>
    );
}

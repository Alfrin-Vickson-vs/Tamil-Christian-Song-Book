import React, { useState, useEffect } from 'react';
import { View, Text, Switch, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from 'nativewind';
import { LogOut, Monitor, DownloadCloud, Trash2 } from 'lucide-react-native';
import { useAuthStore } from '../../store/auth';
import { supabase } from '../../utils/supabase';
import { SyncService } from '../../services/syncService';
import { router } from 'expo-router';

export default function SettingsTab() {
    const { colorScheme, setColorScheme } = useColorScheme();
    const { user, role } = useAuthStore();

    const [syncing, setSyncing] = useState(false);
    const [lastSync, setLastSync] = useState<string | null>(null);

    useEffect(() => {
        loadSyncDate();
    }, []);

    async function loadSyncDate() {
        const date = await SyncService.getLastSyncDate();
        if (date) {
            setLastSync(date.toLocaleDateString() + ' ' + date.toLocaleTimeString());
        } else {
            setLastSync('Never');
        }
    }

    const handleSync = async () => {
        setSyncing(true);
        const success = await SyncService.syncAllSongs();
        if (success) {
            Alert.alert('Success', 'All songs downloaded for offline use.');
            loadSyncDate();
        } else {
            Alert.alert('Error', 'Failed to sync songs.');
        }
        setSyncing(false);
    };

    const clearData = async () => {
        await SyncService.clearOfflineData();
        setLastSync('Never');
        Alert.alert('Cleared', 'Offline data has been cleared.');
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark pt-6">
            <View className="px-6 mb-8">
                <Text className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
                    Settings
                </Text>
            </View>

            <View className="px-4">
                {/* Appearance */}
                <Text className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 px-2">Appearance</Text>
                <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
                    <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center">
                            <View className="bg-blue-50 dark:bg-blue-900/30 p-2 rounded-lg mr-3">
                                <Monitor size={20} color="#3b82f6" />
                            </View>
                            <Text className="text-base font-medium text-gray-900 dark:text-white">Dark Mode</Text>
                        </View>
                        <Switch
                            value={colorScheme === 'dark'}
                            onValueChange={(value) => setColorScheme(value ? 'dark' : 'light')}
                            trackColor={{ false: '#e2e8f0', true: '#818cf8' }}
                            thumbColor={colorScheme === 'dark' ? '#4f46e5' : '#f8fafc'}
                        />
                    </View>
                </View>

                {/* Offline & Storage */}
                <Text className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 px-2">Offline Data</Text>
                <View className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 mb-6 overflow-hidden">
                    <TouchableOpacity className="flex-row items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700" onPress={handleSync} disabled={syncing}>
                        <View className="flex-row items-center flex-1">
                            <View className="bg-emerald-50 dark:bg-emerald-900/30 p-2 rounded-lg mr-3">
                                <DownloadCloud size={20} color="#10b981" />
                            </View>
                            <View>
                                <Text className="text-base font-medium text-gray-900 dark:text-white">Sync All Songs</Text>
                                <Text className="text-xs text-gray-500">Last synced: {lastSync}</Text>
                            </View>
                        </View>
                        {syncing && <ActivityIndicator size="small" color="#10b981" />}
                    </TouchableOpacity>

                    <TouchableOpacity className="flex-row items-center justify-between p-4" onPress={clearData}>
                        <View className="flex-row items-center">
                            <View className="bg-rose-50 dark:bg-rose-900/30 p-2 rounded-lg mr-3">
                                <Trash2 size={20} color="#ef4444" />
                            </View>
                            <Text className="text-base font-medium text-gray-900 dark:text-white">Clear Offline Data</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Admin Section (Conditional) */}
                {role === 'admin' && (
                    <>
                        <Text className="text-sm font-bold text-primary-dark uppercase tracking-wider mb-3 px-2 mt-4">Admin Area</Text>
                        <View className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-indigo-100 dark:border-indigo-900/50 mb-6 overflow-hidden">
                            <TouchableOpacity
                                className="flex-row items-center p-4"
                                onPress={() => router.push('/(admin)')}
                            >
                                <View className="bg-indigo-50 dark:bg-indigo-900/30 p-2 rounded-lg mr-3">
                                    <Monitor size={20} color="#4f46e5" />
                                </View>
                                <Text className="text-base font-medium text-gray-900 dark:text-white">Admin Dashboard</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                )}

                {/* Account Settings */}
                <Text className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 px-2">Account</Text>
                <View className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <View className="p-4 border-b border-gray-100 dark:border-gray-700">
                        <Text className="text-gray-500 text-sm">Logged in as:</Text>
                        <Text className="text-gray-900 dark:text-white font-medium text-base mt-1">
                            {user ? user.email : 'Guest Session'}
                        </Text>
                    </View>

                    <TouchableOpacity
                        className="flex-row items-center p-4"
                        onPress={handleLogout}
                    >
                        <View className="bg-rose-50 dark:bg-rose-900/30 p-2 rounded-lg mr-3">
                            <LogOut size={20} color="#ef4444" />
                        </View>
                        <Text className="text-base font-medium text-rose-500">
                            {user ? 'Sign Out' : 'Sign In'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

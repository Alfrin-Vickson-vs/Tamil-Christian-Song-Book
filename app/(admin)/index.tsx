import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Music, FileText, Bell, Users } from 'lucide-react-native';

export default function AdminDashboard() {
    return (
        <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900" edges={['bottom']}>
            <ScrollView className="flex-1 px-4 py-6">
                <Text className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 px-2">Management</Text>

                <View className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mb-6">
                    <TouchableOpacity
                        className="flex-row items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700"
                        onPress={() => router.push('/(admin)/songs')}
                    >
                        <View className="flex-row items-center">
                            <View className="bg-indigo-50 dark:bg-indigo-900/30 p-2 rounded-lg mr-3">
                                <Music size={20} color="#4f46e5" />
                            </View>
                            <View>
                                <Text className="text-base font-bold text-gray-900 dark:text-white">Songs Database</Text>
                                <Text className="text-xs text-gray-500">Add, Edit, and Delete songs</Text>
                            </View>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity className="flex-row items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
                        <View className="flex-row items-center">
                            <View className="bg-emerald-50 dark:bg-emerald-900/30 p-2 rounded-lg mr-3">
                                <FileText size={20} color="#10b981" />
                            </View>
                            <View>
                                <Text className="text-base font-bold text-gray-900 dark:text-white">Daily Verses</Text>
                                <Text className="text-xs text-gray-500">Manage Verse of the day roster</Text>
                            </View>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity className="flex-row items-center justify-between p-4">
                        <View className="flex-row items-center">
                            <View className="bg-amber-50 dark:bg-amber-900/30 p-2 rounded-lg mr-3">
                                <Bell size={20} color="#f59e0b" />
                            </View>
                            <View>
                                <Text className="text-base font-bold text-gray-900 dark:text-white">Announcements</Text>
                                <Text className="text-xs text-gray-500">Push Church updates to users</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FavoritesService } from '../../services/favoritesService';
import { Song } from '../../types/song';
import { router, useFocusEffect } from 'expo-router';
import { Heart } from 'lucide-react-native';

export default function FavoritesTab() {
    const [songs, setSongs] = useState<Song[]>([]);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            loadFavorites();
        }, [])
    );

    async function loadFavorites() {
        setLoading(true);
        try {
            const data = await FavoritesService.getFavorites();
            // filter out nulls in case of corrupted database links
            setSongs(data.filter(Boolean));
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    const renderSongItem = ({ item }: { item: Song }) => (
        <TouchableOpacity
            className="bg-white dark:bg-gray-800 p-4 mb-3 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex-row items-center justify-between"
            onPress={() => router.push(`/song/${item.id}` as any)}
        >
            <View className="flex-1 pr-4">
                <Text className="text-base font-bold text-gray-900 dark:text-white mb-1" numberOfLines={1}>
                    {item.title_tamil}
                </Text>
                {item.title_english && (
                    <Text className="text-sm text-gray-500 dark:text-gray-400" numberOfLines={1}>
                        {item.title_english}
                    </Text>
                )}
            </View>
            <Heart size={20} color="#ef4444" fill="#ef4444" />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark pt-6">
            <View className="px-6 mb-6">
                <Text className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
                    Favorites
                </Text>
                <Text className="text-gray-500 dark:text-gray-400 text-base">
                    Your saved songs for offline worship
                </Text>
            </View>

            <View className="flex-1 px-4">
                {loading ? (
                    <View className="flex-1 items-center justify-center">
                        <ActivityIndicator size="large" color="#6366f1" />
                    </View>
                ) : songs.length === 0 ? (
                    <View className="flex-1 items-center justify-center -mt-20">
                        <Heart size={48} color="#e2e8f0" />
                        <Text className="text-gray-500 text-lg mt-4 font-medium text-center px-8">
                            No favorites yet. Save some songs to view them offline here!
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={songs}
                        keyExtractor={(item) => item.id}
                        renderItem={renderSongItem}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 20 }}
                    />
                )}
            </View>
        </SafeAreaView>
    );
}

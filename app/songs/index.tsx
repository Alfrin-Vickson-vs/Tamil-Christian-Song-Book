import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SongService } from '../../services/songService';
import { Song, Category } from '../../types/song';
import { router } from 'expo-router';
import { Search, ArrowLeft, Filter } from 'lucide-react-native';

const CATEGORIES: Category[] = ['Worship', 'Christmas', 'Easter', 'Youth', 'Fasting Prayer', 'Special Songs'];

export default function SongsListScreen() {
    const [songs, setSongs] = useState<Song[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('');

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchSongs();
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery, selectedCategory]);

    async function fetchSongs() {
        setLoading(true);
        try {
            const data = await SongService.getSongs(searchQuery, selectedCategory);
            setSongs(data);
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
            <View className="bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full">
                <Text className="text-xs font-medium text-primary-dark dark:text-indigo-300">
                    {item.category || 'Worship'}
                </Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
            {/* Header */}
            <View className="flex-row items-center px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                <TouchableOpacity onPress={() => router.back()} className="p-2">
                    <ArrowLeft size={24} color="#6366f1" />
                </TouchableOpacity>
                <Text className="flex-1 text-xl font-bold text-gray-900 dark:text-white ml-2">
                    Songs Library
                </Text>
            </View>

            {/* Search Bar */}
            <View className="px-4 py-4">
                <View className="flex-row items-center bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-3">
                    <Search size={20} color="#94a3b8" />
                    <TextInput
                        className="flex-1 ml-3 text-base text-gray-900 dark:text-white"
                        placeholder="Search by Tamil, English, or Lyrics..."
                        placeholderTextColor="#94a3b8"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            {/* Categories Filter */}
            <View className="px-4 mb-4">
                <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={['All', ...CATEGORIES]}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => {
                        const isSelected = (item === 'All' && !selectedCategory) || item === selectedCategory;
                        return (
                            <TouchableOpacity
                                className={`mr-3 px-4 py-2 rounded-full border ${isSelected
                                    ? 'bg-primary-dark border-primary-dark'
                                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                                    }`}
                                onPress={() => setSelectedCategory(item === 'All' ? '' : item)}
                            >
                                <Text className={`font-medium ${isSelected ? 'text-white' : 'text-gray-600 dark:text-gray-300'
                                    }`}>
                                    {item}
                                </Text>
                            </TouchableOpacity>
                        )
                    }}
                />
            </View>

            {/* List */}
            <View className="flex-1 px-4">
                {loading ? (
                    <View className="flex-1 items-center justify-center">
                        <ActivityIndicator size="large" color="#6366f1" />
                    </View>
                ) : songs.length === 0 ? (
                    <View className="flex-1 items-center justify-center">
                        <Text className="text-gray-500 text-lg">No songs found in this category.</Text>
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

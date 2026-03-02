import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SongService } from '../../services/songService';
import { HomeService, Verse, Announcement } from '../../services/homeService';
import { Song } from '../../types/song';
import { router } from 'expo-router';
import { BookOpen, Music, Search, Bell, ChevronRight } from 'lucide-react-native';

export default function HomeTab() {
    const [featuredSongs, setFeaturedSongs] = useState<Song[]>([]);
    const [dailyVerse, setDailyVerse] = useState<Verse | null>(null);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        try {
            const [songs, verse, updates] = await Promise.all([
                SongService.getFeaturedSongs(),
                HomeService.getDailyVerse(),
                HomeService.getRecentAnnouncements()
            ]);
            setFeaturedSongs(songs);
            setDailyVerse(verse);
            setAnnouncements(updates);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    const renderSong = ({ item }: { item: Song }) => (
        <TouchableOpacity
            className="bg-white dark:bg-gray-800 p-4 rounded-xl mr-4 w-64 shadow-sm border border-gray-100 dark:border-gray-700"
            onPress={() => router.push(`/song/${item.id}` as any)}
        >
            <Text className="text-lg font-bold text-gray-900 dark:text-white" numberOfLines={1}>
                {item.title_tamil}
            </Text>
            {item.title_english && (
                <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1" numberOfLines={1}>
                    {item.title_english}
                </Text>
            )}
            <View className="mt-3 bg-primary-light/10 self-start px-2 py-1 rounded">
                <Text className="text-xs text-primary-dark font-medium">{item.category || 'Worship'}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <ScrollView className="flex-1 bg-background-light dark:bg-background-dark" showsVerticalScrollIndicator={false}>
            <LinearGradient
                colors={['#4f46e5', '#3730a3']}
                className="pt-16 pb-8 px-6 rounded-b-3xl shadow-md"
            >
                <Text className="text-4xl font-black text-white mb-2 leading-tight">
                    Tamil
                    {"\n"}Christian
                    {"\n"}Song Book
                </Text>
                <Text className="text-indigo-200 text-sm font-medium mb-6 uppercase tracking-wider">
                    Worship in Spirit & Truth
                </Text>

                <TouchableOpacity
                    className="bg-white/20 p-4 rounded-2xl flex-row items-center border border-white/20 backdrop-blur-md"
                    onPress={() => router.push('/songs')}
                >
                    <Search color="white" size={20} className="mr-3" />
                    <Text className="text-white text-base font-medium">Search songs, lyrics...</Text>
                </TouchableOpacity>
            </LinearGradient>

            <View className="flex-1 px-6 pt-6 pb-20">
                {/* Quick Actions */}
                <View className="flex-row justify-between mb-8">
                    <TouchableOpacity
                        className="flex-1 bg-white dark:bg-gray-800 p-4 rounded-2xl items-center mr-2 shadow-sm border border-gray-100 dark:border-gray-700"
                        onPress={() => router.push('/songs')}
                    >
                        <View className="bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded-full mb-2">
                            <Music color="#4f46e5" size={24} />
                        </View>
                        <Text className="font-bold text-gray-900 dark:text-white">All Songs</Text>
                    </TouchableOpacity>

                    <TouchableOpacity className="flex-1 bg-white dark:bg-gray-800 p-4 rounded-2xl items-center ml-2 shadow-sm border border-gray-100 dark:border-gray-700">
                        <View className="bg-emerald-50 dark:bg-emerald-900/30 p-3 rounded-full mb-2">
                            <BookOpen color="#10b981" size={24} />
                        </View>
                        <Text className="font-bold text-gray-900 dark:text-white">Daily Verse</Text>
                    </TouchableOpacity>
                </View>

                {/* Daily Verse Section */}
                {dailyVerse && (
                    <View className="bg-white dark:bg-gray-800 rounded-3xl p-6 mb-8 shadow-sm border border-gray-100 dark:border-gray-700">
                        <View className="flex-row items-center mb-4">
                            <BookOpen size={20} color="#6366f1" />
                            <Text className="text-base font-bold text-gray-900 dark:text-white ml-2">Verse of the Day</Text>
                        </View>
                        <Text className="text-lg italic text-gray-700 dark:text-gray-200 leading-relaxed mb-4">"{dailyVerse.verse_text}"</Text>
                        <Text className="text-sm font-bold text-primary-dark right-0 text-right">- {dailyVerse.verse_reference}</Text>
                    </View>
                )}

                {/* Featured Songs */}
                <Text className="text-xl font-black text-gray-900 dark:text-white mb-4">
                    Featured Songs
                </Text>

                {loading ? (
                    <ActivityIndicator color="#4f46e5" className="mb-8" />
                ) : (
                    <FlatList
                        data={featuredSongs}
                        renderItem={renderSong}
                        keyExtractor={(item) => item.id}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingRight: 20, paddingBottom: 10 }}
                        className="mb-8"
                    />
                )}

                {/* Announcements */}
                {announcements.length > 0 && (
                    <View>
                        <View className="flex-row items-center justify-between mb-4">
                            <Text className="text-xl font-black text-gray-900 dark:text-white">Church Updates</Text>
                            <TouchableOpacity className="flex-row items-center">
                                <Text className="text-sm font-bold text-primary-dark mr-1">View All</Text>
                                <ChevronRight size={16} color="#4f46e5" />
                            </TouchableOpacity>
                        </View>

                        {announcements.map((ann, idx) => (
                            <View key={ann.id} className="bg-white dark:bg-gray-800 p-4 rounded-2xl mb-3 shadow-sm border border-gray-100 dark:border-gray-700">
                                <View className="flex-row items-center mb-2">
                                    <Bell size={16} color="#f59e0b" className="mr-2" />
                                    <Text className="font-bold text-gray-900 dark:text-white">{ann.title}</Text>
                                </View>
                                <Text className="text-gray-600 dark:text-gray-400 text-sm">{ann.message}</Text>
                            </View>
                        ))}
                    </View>
                )}

            </View>
        </ScrollView>
    );
}

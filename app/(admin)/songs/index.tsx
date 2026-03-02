import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Plus, Edit2, Trash2, Search } from 'lucide-react-native';
import { supabase } from '../../../utils/supabase';
import { SongService } from '../../../services/songService';
import { Song } from '../../../types/song';

export default function AdminSongsList() {
    const [songs, setSongs] = useState<Song[]>([]);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        React.useCallback(() => {
            fetchSongs();
        }, [])
    );

    async function fetchSongs() {
        setLoading(true);
        try {
            const data = await SongService.getSongs();
            setSongs(data);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to fetch songs catalog.');
        } finally {
            setLoading(false);
        }
    }

    const handleDelete = (id: string, title: string) => {
        Alert.alert(
            'Delete Song',
            `Are you sure you want to delete "${title}"? This cannot be undone.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        const { error } = await supabase.from('songs').delete().eq('id', id);
                        if (error) {
                            Alert.alert('Error', error.message);
                        } else {
                            fetchSongs();
                        }
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }: { item: Song }) => (
        <View className="bg-white dark:bg-gray-800 p-4 mb-3 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex-row items-center justify-between">
            <View className="flex-1 pr-2">
                <Text className="text-base font-bold text-gray-900 dark:text-white" numberOfLines={1}>{item.title_tamil}</Text>
                <Text className="text-sm text-gray-500">{item.category || 'Uncategorized'}</Text>
            </View>
            <View className="flex-row items-center space-x-3">
                <TouchableOpacity
                    className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg mr-2"
                    onPress={() => router.push({ pathname: '/(admin)/songs/edit', params: { id: item.id } })}
                >
                    <Edit2 size={18} color="#4f46e5" />
                </TouchableOpacity>
                <TouchableOpacity
                    className="p-2 bg-rose-50 dark:bg-rose-900/30 rounded-lg"
                    onPress={() => handleDelete(item.id, item.title_tamil)}
                >
                    <Trash2 size={18} color="#ef4444" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900" edges={['bottom']}>
            <View className="px-4 py-4 flex-row items-center justify-between">
                <Text className="text-xl font-bold text-gray-900 dark:text-white">Song Database</Text>
                <TouchableOpacity
                    className="bg-primary-dark flex-row items-center px-4 py-2 rounded-lg shadow-sm"
                    onPress={() => router.push('/(admin)/songs/edit')}
                >
                    <Plus size={18} color="white" />
                    <Text className="text-white font-medium ml-2">Add New</Text>
                </TouchableOpacity>
            </View>

            <View className="flex-1 px-4">
                {loading ? (
                    <View className="flex-1 justify-center items-center">
                        <ActivityIndicator size="large" color="#4f46e5" />
                    </View>
                ) : (
                    <FlatList
                        data={songs}
                        keyExtractor={(item) => item.id}
                        renderItem={renderItem}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 20 }}
                        ListEmptyComponent={
                            <View className="items-center justify-center py-10">
                                <Text className="text-gray-500 text-base">No songs found in database.</Text>
                            </View>
                        }
                    />
                )}
            </View>
        </SafeAreaView>
    );
}

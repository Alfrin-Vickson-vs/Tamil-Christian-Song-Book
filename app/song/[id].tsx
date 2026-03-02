import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, useWindowDimensions } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, ZoomIn, ZoomOut, Heart, Share2, Maximize, Music, Plus, Minus, PlayCircle, PauseCircle, FileText } from 'lucide-react-native';
import { Audio } from 'expo-av';
import * as Linking from 'expo-linking';
import { SongService } from '../../services/songService';
import { Song } from '../../types/song';
import { transposeChordsText } from '../../utils/chords';
import { FavoritesService } from '../../services/favoritesService';

export default function SongDetailScreen() {
    const { id } = useLocalSearchParams();
    const { width } = useWindowDimensions();

    const [song, setSong] = useState<Song | null>(null);
    const [loading, setLoading] = useState(true);
    const [fontSize, setFontSize] = useState(18);
    const [isFavorite, setIsFavorite] = useState(false);
    const [worshipMode, setWorshipMode] = useState(false);
    const [showChords, setShowChords] = useState(false);
    const [transposeSteps, setTransposeSteps] = useState(0);

    // Audio State
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        if (id) {
            loadSong(id as string);
        }
        return () => {
            // Cleanup sound on unmount
            if (sound) {
                sound.unloadAsync();
            }
        };
    }, [id]);

    useEffect(() => {
        return sound
            ? () => {
                sound.unloadAsync();
            }
            : undefined;
    }, [sound]);

    async function handlePlayAudio() {
        if (!song?.audio_url) return;

        try {
            if (sound) {
                if (isPlaying) {
                    await sound.pauseAsync();
                    setIsPlaying(false);
                } else {
                    await sound.playAsync();
                    setIsPlaying(true);
                }
            } else {
                const { sound: newSound } = await Audio.Sound.createAsync(
                    { uri: song.audio_url },
                    { shouldPlay: true }
                );
                setSound(newSound);
                setIsPlaying(true);

                newSound.setOnPlaybackStatusUpdate((status) => {
                    if (status.isLoaded && status.didJustFinish) {
                        setIsPlaying(false);
                    }
                });
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to play audio.');
            console.error(error);
        }
    }

    async function loadSong(songId: string) {
        try {
            const data = await SongService.getSongById(songId);
            setSong(data);
            if (data) {
                const isFav = await FavoritesService.isFavorite(data.id);
                setIsFavorite(isFav);
            }
        } catch (err) {
            Alert.alert('Error', 'Failed to load song');
        } finally {
            setLoading(false);
        }
    }

    const increaseFont = () => setFontSize(prev => Math.min(prev + 2, 40));
    const decreaseFont = () => setFontSize(prev => Math.max(prev - 2, 12));

    const toggleFavorite = async () => {
        if (!song) return;
        try {
            const isFav = await FavoritesService.toggleFavorite(song);
            setIsFavorite(isFav);
        } catch (err) {
            Alert.alert('Error', 'Could not update favorites.');
        }
    };

    const renderLyricsWithChords = () => {
        if (!song) return null;

        // If chords exist, and showChords is true, display them.
        // In our DB, chords and lyrics could be separate or interleaved.
        // If lyrics have interleaved chords in brackets: "[C]Hallelujah" -> we can render them styled.
        const textToRender = showChords && song.chords ? transposeChordsText(song.chords, transposeSteps) : song.lyrics;

        // A simple regex to colorize brackets [C] if interleaved.
        if (showChords) {
            const parts = textToRender.split(/(\[[^\]]+\])/g);
            return parts.map((part, index) => {
                if (part.startsWith('[') && part.endsWith(']')) {
                    return <Text key={index} className="text-primary-dark dark:text-indigo-400 font-bold">{part} </Text>;
                }
                return <Text key={index}>{part}</Text>;
            });
        }

        return <Text>{song.lyrics}</Text>;
    };

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-background-light dark:bg-background-dark">
                <ActivityIndicator size="large" color="#6366f1" />
            </View>
        );
    }

    if (!song) {
        return (
            <View className="flex-1 items-center justify-center bg-background-light dark:bg-background-dark">
                <Text className="text-gray-900 dark:text-white">Song not found</Text>
            </View>
        );
    }

    if (worshipMode) {
        return (
            <SafeAreaView className="flex-1 bg-black">
                <TouchableOpacity
                    className="absolute top-10 right-6 z-10 bg-white/20 p-3 rounded-full"
                    onPress={() => setWorshipMode(false)}
                >
                    <Maximize color="white" size={24} />
                </TouchableOpacity>
                <ScrollView className="flex-1 px-8 py-10">
                    <Text style={{ fontSize: fontSize + 4, color: 'white', lineHeight: (fontSize + 4) * 1.5, textAlign: 'center' }}>
                        {renderLyricsWithChords()}
                    </Text>
                </ScrollView>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
            {/* Header */}
            <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                <View className="flex-row items-center flex-1">
                    <TouchableOpacity onPress={() => router.back()} className="p-2 mr-2">
                        <ArrowLeft size={24} color="#6366f1" />
                    </TouchableOpacity>
                    <View className="flex-1 pr-2">
                        <Text className="text-xl font-bold text-gray-900 dark:text-white" numberOfLines={1}>
                            {song.title_tamil}
                        </Text>
                    </View>
                </View>

                <View className="flex-row items-center">
                    <TouchableOpacity onPress={decreaseFont} className="p-2">
                        <ZoomOut size={22} color="#64748b" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={increaseFont} className="p-2">
                        <ZoomIn size={22} color="#64748b" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView className="flex-1 px-6 pt-6">
                {/* Metadata */}
                <View className="mb-4 flex-row flex-wrap gap-2">
                    {song.author && (
                        <View className="bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full">
                            <Text className="text-gray-600 dark:text-gray-300 text-sm">Auth: {song.author}</Text>
                        </View>
                    )}
                    {song.category && (
                        <View className="bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-full">
                            <Text className="text-primary-dark dark:text-indigo-300 text-sm">{song.category}</Text>
                        </View>
                    )}
                    {song.scale && (
                        <View className="bg-rose-50 dark:bg-rose-900/30 px-3 py-1.5 rounded-full">
                            <Text className="text-rose-600 dark:text-rose-300 text-sm">Scale: {song.scale}</Text>
                        </View>
                    )}
                </View>

                {/* Chords Toggle & Transpose */}
                {(song.chords || song.lyrics.includes('[')) && (
                    <View className="mb-4 flex-row items-center justify-between bg-white dark:bg-gray-800 p-3 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <TouchableOpacity
                            className={`flex-row items-center px-4 py-2 rounded-lg ${showChords ? 'bg-primary-dark' : 'bg-gray-100 dark:bg-gray-700'}`}
                            onPress={() => setShowChords(!showChords)}
                        >
                            <Music size={18} color={showChords ? "white" : "#64748b"} />
                            <Text className={`ml-2 font-medium ${showChords ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>Chords</Text>
                        </TouchableOpacity>

                        {showChords && (
                            <View className="flex-row items-center bg-gray-100 dark:bg-gray-700 rounded-lg">
                                <TouchableOpacity onPress={() => setTransposeSteps(p => p - 1)} className="p-2">
                                    <Minus size={18} color="#64748b" />
                                </TouchableOpacity>
                                <Text className="px-2 font-bold text-gray-900 dark:text-white">
                                    {transposeSteps === 0 ? 'Orig' : (transposeSteps > 0 ? `+${transposeSteps}` : transposeSteps)}
                                </Text>
                                <TouchableOpacity onPress={() => setTransposeSteps(p => p + 1)} className="p-2">
                                    <Plus size={18} color="#64748b" />
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                )}

                {/* Media Playback Area */}
                {(song.audio_url || song.pdf_url) && (
                    <View className="mb-6 flex-row gap-3">
                        {song.audio_url && (
                            <TouchableOpacity
                                className={`flex-1 flex-row items-center justify-center p-3 rounded-xl ${isPlaying ? 'bg-indigo-100 dark:bg-indigo-900/40' : 'bg-white dark:bg-gray-800'} border border-indigo-100 dark:border-gray-700 shadow-sm`}
                                onPress={handlePlayAudio}
                            >
                                {isPlaying ? <PauseCircle size={22} color="#4f46e5" /> : <PlayCircle size={22} color="#6366f1" />}
                                <Text className={`ml-2 font-bold ${isPlaying ? 'text-primary-dark' : 'text-gray-700 dark:text-gray-300'}`}>
                                    {isPlaying ? 'Pause Track' : 'Play Track'}
                                </Text>
                            </TouchableOpacity>
                        )}
                        {song.pdf_url && (
                            <TouchableOpacity
                                className="flex-1 flex-row items-center justify-center bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm"
                                onPress={() => Linking.openURL(song.pdf_url as string)}
                            >
                                <FileText size={22} color="#10b981" />
                                <Text className="ml-2 font-bold text-gray-700 dark:text-gray-300">Sheet Music</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}

                {/* Lyrics */}
                <Text
                    style={{ fontSize, lineHeight: fontSize * 1.8 }}
                    className="text-gray-800 dark:text-gray-100 mb-6"
                >
                    {renderLyricsWithChords()}
                </Text>
            </ScrollView>

            {/* Floating Action Bar */}
            <View className="absolute bottom-6 left-6 right-6 flex-row justify-between bg-white dark:bg-gray-800 px-6 py-4 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700">
                <TouchableOpacity className="items-center" onPress={toggleFavorite}>
                    <Heart size={24} color={isFavorite ? "#ef4444" : "#64748b"} fill={isFavorite ? "#ef4444" : "transparent"} />
                    <Text className="text-xs text-gray-500 mt-1 flex-1 text-center">Favorite</Text>
                </TouchableOpacity>

                <TouchableOpacity className="items-center" onPress={() => setWorshipMode(true)}>
                    <Maximize size={24} color="#6366f1" />
                    <Text className="text-xs text-primary-dark mt-1 flex-1 text-center">Worship</Text>
                </TouchableOpacity>

                <TouchableOpacity className="items-center">
                    <Share2 size={24} color="#64748b" />
                    <Text className="text-xs text-gray-500 mt-1 flex-1 text-center">Share</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

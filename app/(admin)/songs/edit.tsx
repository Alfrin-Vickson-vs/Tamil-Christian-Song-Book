import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Switch } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import { Upload, File } from 'lucide-react-native';
import { supabase } from '../../../utils/supabase';
import { SongService } from '../../../services/songService';

export default function AdminEditSong() {
    const { id } = useLocalSearchParams();
    const isEditing = !!id;

    const [loading, setLoading] = useState(isEditing);
    const [saving, setSaving] = useState(false);

    // Form State
    const [titleTamil, setTitleTamil] = useState('');
    const [titleEnglish, setTitleEnglish] = useState('');
    const [lyrics, setLyrics] = useState('');
    const [chords, setChords] = useState('');
    const [category, setCategory] = useState('');
    const [author, setAuthor] = useState('');
    const [scale, setScale] = useState('');
    const [isFeatured, setIsFeatured] = useState(false);

    // Media State
    const [audioUrl, setAudioUrl] = useState('');
    const [pdfUrl, setPdfUrl] = useState('');
    const [audioFile, setAudioFile] = useState<any>(null);
    const [pdfFile, setPdfFile] = useState<any>(null);

    useEffect(() => {
        if (isEditing && id) {
            loadSongDetails();
        }
    }, [id]);

    async function loadSongDetails() {
        try {
            const song = await SongService.getSongById(id as string);
            if (song) {
                setTitleTamil(song.title_tamil);
                setTitleEnglish(song.title_english || '');
                setLyrics(song.lyrics);
                setChords(song.chords || '');
                setCategory(song.category || '');
                setAuthor(song.author || '');
                setScale(song.scale || '');
                setIsFeatured(song.is_featured);
                setAudioUrl(song.audio_url || '');
                setPdfUrl(song.pdf_url || '');
            }
        } catch (err) {
            Alert.alert('Error', 'Failed to load existing song properties.');
        } finally {
            setLoading(false);
        }
    }

    const pickAudio = async () => {
        try {
            const res = await DocumentPicker.getDocumentAsync({ type: 'audio/*' });
            if (!res.canceled && res.assets && res.assets.length > 0) {
                setAudioFile(res.assets[0]);
            }
        } catch (err) {
            console.error('Failed to pick audio:', err);
        }
    };

    const pickPdf = async () => {
        try {
            const res = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' });
            if (!res.canceled && res.assets && res.assets.length > 0) {
                setPdfFile(res.assets[0]);
            }
        } catch (err) {
            console.error('Failed to pick pdf:', err);
        }
    };

    const uploadFile = async (file: any, folder: string): Promise<string | null> => {
        try {
            const ext = file.name.split('.').pop();
            const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;

            // RN specific blob conversion for file uris
            const response = await fetch(file.uri);
            const blob = await response.blob();

            const { data, error } = await supabase.storage
                .from('songs_media')
                .upload(fileName, blob, {
                    contentType: file.mimeType || 'application/octet-stream',
                    upsert: false
                });

            if (error) throw error;

            const { data: publicUrlData } = supabase.storage
                .from('songs_media')
                .getPublicUrl(fileName);

            return publicUrlData.publicUrl;
        } catch (error) {
            console.error('Error uploading file: ', error);
            return null;
        }
    };

    const handleSave = async () => {
        if (!titleTamil.trim() || !lyrics.trim()) {
            Alert.alert('Validation Error', 'Tamil Title and Lyrics are required fields.');
            return;
        }

        setSaving(true);

        let uploadedAudio = audioUrl;
        let uploadedPdf = pdfUrl;

        // Conditional Uploads
        if (audioFile) {
            const newAudioUrl = await uploadFile(audioFile, 'audio');
            if (newAudioUrl) uploadedAudio = newAudioUrl;
        }

        if (pdfFile) {
            const newPdfUrl = await uploadFile(pdfFile, 'pdf');
            if (newPdfUrl) uploadedPdf = newPdfUrl;
        }

        const payload: any = {
            title_tamil: titleTamil,
            title_english: titleEnglish || null,
            lyrics: lyrics,
            chords: chords || null,
            category: category || null,
            author: author || null,
            scale: scale || null,
            is_featured: isFeatured,
            audio_url: uploadedAudio || null,
            pdf_url: uploadedPdf || null
        };

        try {
            if (isEditing) {
                const { error } = await supabase.from('songs').update(payload).eq('id', id);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('songs').insert([payload]);
                if (error) throw error;
            }
            Alert.alert('Success', `Song successfully ${isEditing ? 'updated' : 'added'}!`);
            router.back();
        } catch (err: any) {
            Alert.alert('Database Error', err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900">
                <ActivityIndicator size="large" color="#4f46e5" />
            </View>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900" edges={['bottom']}>
            <ScrollView className="flex-1 px-4 py-4" showsVerticalScrollIndicator={false}>

                <View className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
                    <Text className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                        {isEditing ? 'Edit Song Details' : 'Create New Song'}
                    </Text>

                    {/* Title Tamil */}
                    <View className="mb-4">
                        <Text className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Title (Tamil) *</Text>
                        <TextInput
                            className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-base text-gray-900 dark:text-white"
                            placeholder="Enter tamil title"
                            value={titleTamil}
                            onChangeText={setTitleTamil}
                        />
                    </View>

                    {/* Title English */}
                    <View className="mb-4">
                        <Text className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Title (English Translation/Phonetic)</Text>
                        <TextInput
                            className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-base text-gray-900 dark:text-white"
                            placeholder="Enter english title"
                            value={titleEnglish}
                            onChangeText={setTitleEnglish}
                        />
                    </View>

                    {/* Category */}
                    <View className="mb-4">
                        <Text className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Category</Text>
                        <TextInput
                            className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-base text-gray-900 dark:text-white"
                            placeholder="e.g. Worship, Christmas"
                            value={category}
                            onChangeText={setCategory}
                        />
                    </View>

                    {/* Scale */}
                    <View className="mb-4">
                        <Text className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Scale / Key</Text>
                        <TextInput
                            className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-base text-gray-900 dark:text-white"
                            placeholder="e.g. C Major, F# minor"
                            value={scale}
                            onChangeText={setScale}
                        />
                    </View>

                    {/* Featured Toggle */}
                    <View className="mb-4 flex-row items-center justify-between">
                        <Text className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Feature on Home Dashboard?</Text>
                        <Switch
                            value={isFeatured}
                            onValueChange={setIsFeatured}
                            trackColor={{ false: '#cbd5e1', true: '#818cf8' }}
                            thumbColor={isFeatured ? '#4f46e5' : '#f8fafc'}
                        />
                    </View>

                    {/* Lyrics Area */}
                    <View className="mb-4 mt-4">
                        <Text className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Lyrics *</Text>
                        <TextInput
                            className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-base text-gray-900 dark:text-white min-h-[200px]"
                            placeholder="Paste lyrics here..."
                            multiline
                            textAlignVertical="top"
                            value={lyrics}
                            onChangeText={setLyrics}
                        />
                    </View>

                    {/* Chords Area */}
                    <View className="mb-4">
                        <Text className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Chords Sheet (Optional)</Text>
                        <TextInput
                            className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-base text-gray-900 dark:text-white min-h-[150px]"
                            placeholder="[C] Hallelujah [G] Amen..."
                            multiline
                            textAlignVertical="top"
                            value={chords}
                            onChangeText={setChords}
                        />
                    </View>

                    {/* Media Attachments Area */}
                    <View className="mb-6 mt-2 p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
                        <Text className="text-base font-bold text-gray-900 dark:text-white mb-3">Media Attachments</Text>

                        {/* Audio File */}
                        <View className="mb-4">
                            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Backing Track / Audio (MP3)</Text>
                            <TouchableOpacity
                                className="flex-row items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 rounded-lg border-dashed"
                                onPress={pickAudio}
                            >
                                <Upload size={18} color="#6366f1" />
                                <Text className="ml-2 text-gray-600 dark:text-gray-400 flex-1" numberOfLines={1}>
                                    {audioFile ? audioFile.name : (audioUrl ? 'Audio already uploaded (tap to replace)' : 'Select Audio File...')}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* PDF File */}
                        <View>
                            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sheet Music (PDF)</Text>
                            <TouchableOpacity
                                className="flex-row items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 rounded-lg border-dashed"
                                onPress={pickPdf}
                            >
                                {/* @ts-ignore */}
                                <File size={18} color="#10b981" />
                                <Text className="ml-2 text-gray-600 dark:text-gray-400 flex-1" numberOfLines={1}>
                                    {pdfFile ? pdfFile.name : (pdfUrl ? 'PDF already uploaded (tap to replace)' : 'Select PDF File...')}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity
                        className={`py-4 rounded-xl items-center shadow-md flex-row justify-center mt-2 ${saving ? 'bg-indigo-400' : 'bg-primary-dark'}`}
                        onPress={handleSave}
                        disabled={saving}
                    >
                        {saving && <ActivityIndicator size="small" color="#fff" className="mr-2" />}
                        <Text className="text-white font-bold text-base">{isEditing ? 'Update Song' : 'Create Song'}</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

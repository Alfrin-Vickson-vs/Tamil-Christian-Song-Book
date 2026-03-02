import { supabase } from '../utils/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Song } from '../types/song';
import { useAuthStore } from '../store/auth';

const OFFLINE_FAVORITES_KEY = 'offline_favorites';

export const FavoritesService = {
    async getFavorites(): Promise<Song[]> {
        const user = useAuthStore.getState().user;

        // First try getting from state/offline
        try {
            const offlineFavs = await AsyncStorage.getItem(OFFLINE_FAVORITES_KEY);
            if (offlineFavs) {
                // We could just return this, but let's try to sync if user is logged in
                if (!user) {
                    return JSON.parse(offlineFavs);
                }
            }
        } catch (e) {
            console.warn('Error reading offline favorites:', e);
        }

        if (!user) return [];

        // Fetch from Supabase
        const { data, error } = await supabase
            .from('favorites')
            .select('song_id, songs(*)')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching favorites:', error);
            return [];
        }

        // Map the relational data back to Song array
        const songs = data.map(item => item.songs) as unknown as Song[];

        // Cache them offline
        try {
            await AsyncStorage.setItem(OFFLINE_FAVORITES_KEY, JSON.stringify(songs));
        } catch (e) {
            console.warn('Error caching favorites:', e);
        }

        return songs;
    },

    async isFavorite(songId: string): Promise<boolean> {
        const favs = await this.getFavorites();
        return favs.some(song => song?.id === songId);
    },

    async toggleFavorite(song: Song): Promise<boolean> {
        const user = useAuthStore.getState().user;
        if (!user) {
            // Offline/Guest only
            let favs = await this.getFavorites();
            const isFav = favs.some(f => f?.id === song.id);

            if (isFav) {
                favs = favs.filter(f => f?.id !== song.id);
            } else {
                favs.push(song);
            }

            await AsyncStorage.setItem(OFFLINE_FAVORITES_KEY, JSON.stringify(favs));
            return !isFav;
        }

        // Logged in user - sync with Supabase
        const isFav = await this.isFavorite(song.id);

        if (isFav) {
            // Remove
            const { error } = await supabase
                .from('favorites')
                .delete()
                .eq('user_id', user.id)
                .eq('song_id', song.id);

            if (error) throw error;
        } else {
            // Add
            const { error } = await supabase
                .from('favorites')
                .insert({ user_id: user.id, song_id: song.id });

            if (error) throw error;
        }

        // Refresh cache
        await this.getFavorites();
        return !isFav;
    }
};

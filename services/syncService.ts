import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../utils/supabase';
import { SongService } from './songService';

const OFFLINE_SONGS_KEY = 'offline_songs';
const LAST_SYNC_KEY = 'last_sync_date';

export const SyncService = {
    async syncAllSongs(): Promise<boolean> {
        try {
            const { data, error } = await supabase.from('songs').select('*');
            if (error) throw error;

            await AsyncStorage.setItem(OFFLINE_SONGS_KEY, JSON.stringify(data));
            await AsyncStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());

            return true;
        } catch (e) {
            console.error('Sync failed:', e);
            return false;
        }
    },

    async getLastSyncDate(): Promise<Date | null> {
        const dateStr = await AsyncStorage.getItem(LAST_SYNC_KEY);
        return dateStr ? new Date(dateStr) : null;
    },

    async clearOfflineData() {
        await AsyncStorage.removeItem(OFFLINE_SONGS_KEY);
        await AsyncStorage.removeItem(LAST_SYNC_KEY);
    }
};

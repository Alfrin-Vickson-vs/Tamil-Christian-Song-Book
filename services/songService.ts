import { supabase } from '../utils/supabase';
import { Song, Category } from '../types/song';

export const SongService = {
    async getSongs(searchQuery: string = '', category: string = ''): Promise<Song[]> {
        let query = supabase
            .from('songs')
            .select('*')
            .order('title_tamil', { ascending: true });

        if (category) {
            query = query.eq('category', category);
        }

        if (searchQuery) {
            // Search in english title, tamil title, and lyrics
            query = query.or(`title_tamil.ilike.%${searchQuery}%,title_english.ilike.%${searchQuery}%,lyrics.ilike.%${searchQuery}%`);
        }

        const { data, error } = await query;
        if (error) {
            console.error('Error fetching songs:', error);
            throw error;
        }
        return data as Song[];
    },

    async getSongById(id: string): Promise<Song | null> {
        const { data, error } = await supabase
            .from('songs')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching song by id:', error);
            return null;
        }
        return data as Song;
    },

    async getFeaturedSongs(): Promise<Song[]> {
        const { data, error } = await supabase
            .from('songs')
            .select('*')
            .eq('is_featured', true)
            .limit(10);

        if (error) {
            console.error('Error fetching featured songs', error);
            throw error;
        }
        return data as Song[];
    }
};

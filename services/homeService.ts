import { supabase } from '../utils/supabase';

export interface Verse {
    id: string;
    verse_reference: string;
    verse_text: string;
    date: string;
}

export interface Announcement {
    id: string;
    title: string;
    message: string;
    created_at: string;
}

export const HomeService = {
    async getDailyVerse(): Promise<Verse | null> {
        const today = new Date().toISOString().split('T')[0];

        // First try to get today's verse
        let { data, error } = await supabase
            .from('verses')
            .select('*')
            .eq('date', today)
            .single();

        // If no verse for today, get the most recent one
        if (error || !data) {
            const { data: latestData } = await supabase
                .from('verses')
                .select('*')
                .order('date', { ascending: false })
                .limit(1)
                .single();

            data = latestData;
        }

        return data as Verse | null;
    },

    async getRecentAnnouncements(): Promise<Announcement[]> {
        const { data, error } = await supabase
            .from('announcements')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(5);

        if (error) {
            console.error('Error fetching announcements:', error);
            return [];
        }

        return data as Announcement[];
    }
};

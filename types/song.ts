export interface Song {
    id: string;
    title_tamil: string;
    title_english: string | null;
    lyrics: string;
    chords: string | null;
    category?: string | null;
    author?: string | null;
    scale?: string | null;
    tempo?: number | null;
    year?: number | null;
    is_featured: boolean;
    audio_url?: string | null;
    pdf_url?: string | null;
    created_at: string;
}

export type Category =
    | 'Worship'
    | 'Christmas'
    | 'Easter'
    | 'Youth'
    | 'Fasting Prayer'
    | 'Special Songs';

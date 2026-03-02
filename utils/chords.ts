const scales = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];

export function transposeChord(chord: string, steps: number): string {
    // Regex to match root note, sharp/flat, and the rest of the chord (e.g. m, m7, sus4)
    const regex = /^([A-G][b#]?)(.*)$/;
    const match = chord.match(regex);

    if (!match) return chord; // If it doesn't match a standard chord, return as is

    let root = match[1];
    const suffix = match[2];

    // Normalize Db to C#, D# to Eb, Gb to F#, A# to Bb for simplicity based on `scales` array
    if (root === 'Db') root = 'C#';
    if (root === 'D#') root = 'Eb';
    if (root === 'Gb') root = 'F#';
    if (root === 'A#') root = 'Bb';

    let index = scales.indexOf(root);
    if (index === -1) return chord;

    // Calculate new index wrapping around the 12 semi-tones
    let newIndex = (index + steps) % 12;
    if (newIndex < 0) newIndex += 12;

    return scales[newIndex] + suffix;
}

export function transposeChordsText(text: string, steps: number): string {
    if (!text) return text;

    // Replace chords in brackets [C] or just floating. Assuming format [C] or directly.
    return text.replace(/\[([A-G][b#]?[^\]]*)\]/g, (match, chord) => {
        return `[${transposeChord(chord, steps)}]`;
    });
}
